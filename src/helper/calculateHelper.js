import * as mapHelper from './mapHelper.js';
import * as tileHelper from './tileHelper.js';

/**
 * Calculate number of columns
 * @return 
 */
export function getNumberOfColumns(settings) {
  let size = settings.containerWidth;
  let count = 0, tilesWidth = settings.cellWidth;
  let tileSpace = size - settings.paddingLeft 
    - settings.paddingRight + settings.spaceBetweenCellAndGroup * 2;
  while(tilesWidth <= tileSpace){
    count++;
    tilesWidth += settings.cellWidth + settings.cellSpace;
  }
  return count;
}

/**
 * Calculate group ranges
 * @return {array} [{start:{double}, end:{double}, groupId: {string}}]
 *   eg. [{start: -Infinity, end: 100, groupId: 0}, {start: 101, end: Infinity, groupId: 1}]
 */
export function getGroupRanges(settings, groups) {
  function Range(groupId){
    this.groupId = groupId;
    this.start = 0;
    this.end = 0;
  }
  
  let result = [], oTmpRange, curr, currGroup, previousEnd = 0;
  //If we have decimals, ceil it, otherwise, it will have some cracks, 1px probably.
  //If user drag tile on the crack will arouse some error.
  const halfGroupSpace = Math.ceil(settings.groupSpace / 2);
  for(let i = 0 ; i < groups.length; i++){
    currGroup = settings._groupsMap[groups[i].id];
    oTmpRange = new Range(currGroup.id);
    if(groups.length === 1){
      oTmpRange.start = -Infinity;
      oTmpRange.end = Infinity;
    }else if(i === 0){
      oTmpRange.start = -Infinity;
      oTmpRange.end = currGroup.bottom + halfGroupSpace;
    }else if(i === groups.length - 1){
      oTmpRange.start = previousEnd;
        oTmpRange.end = Infinity;
    }else{
      oTmpRange.start = previousEnd;
      oTmpRange.end = currGroup.bottom + halfGroupSpace;
    }
    result.push(oTmpRange);
    previousEnd = currGroup.bottom + halfGroupSpace;
  }
  return result;
}

/**
 * Calculate tile ranges
 * @param {object} oGroup
 * @return {array} [{startX:{double}, endX:{double}, startY:{double},
 *   endY:{double}, mapX: {integer}, mapY: {integer}}]
 *   eg. [{startX: 10, endX: 20, startY: 10, endY: 20, mapX: 1, mapY, 3}]
 */
export function getTileRanges(settings, oGroup){
  function Range(startX, endX, startY, endY, mapX, mapY){
    this.startX = startX;
    this.endX = endX;
    this.startY = startY;
    this.endY = endY;
    this.mapX = mapX;
    this.mapY = mapY;
  }

  let result = [], curr, tileIndex, oTile;
  let map = oGroup.map;
  for(let i = 0; i < map.length; i++){
    for(let j = 0; j < map[i].length; j++){
      curr = map[i][j];
      if(curr && curr.piece !== '#'){
        oTile = settings._cellsMap[curr.piece];
        tileIndex = oTile.index;
      }else{
        tileIndex = mapHelper.findInsertIndex(settings, map, i, j);
      }
      result.push(
        new Range(curr.startX, curr.endX,
          curr.startY, curr.endY, i, j)
      );
    }
  }
  return result;
}

// /**
//  * Update the cell position.
//  * If top and left are not undefined, set it to the tile css.
//  * @param {object} evt
//  * @param {object} oTile
//  * @param {integer} top
//  * @param {integer} left
//  * @return void
//  *   update tile top and left css in this function
//  */
// export function updateCellPos(settings, evt, groups, oTile, top, left) {
//   //calculte previous tiles index
//   let iGroupIndex = oTile.groupIndex;
//   let countPreviousIndex = 0;
//   for(let i = 0; i < iGroupIndex; i++){
//     countPreviousIndex += groups[i].items.length;
//   }
//   //tile index in current group
//   //Add group offset as groupbackground is rendered before tiles
//   const tileDomIndex = countPreviousIndex + oTile.index + groups.length;
//   const tileDom = ReactDOM.findDOMNode(this).childNodes[tileDomIndex];
  
//   if(top !== undefined && left !== undefined){
//     tileDom.style.top = top + 'px';
//     tileDom.style.left = left + 'px';
//     return;
//   }    

//   //calculate x and y coodinate from click point to the grid control boundary
//   const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
//   const XY = this.calculateHelper_pointerEventToXY(evt);
//   const relX = XY.pageX - rect.left; 
//   const relY = XY.pageY - rect.top + ReactDOM.findDOMNode(this).scrollTop;
//   tileDom.style.top = relY - this.state.draggableState.deltaY + 'px';
//   tileDom.style.left = relX - this.state.draggableState.deltaX + 'px';
// }

/**
 * Get tile top and left pixus by it's topleft cell coordinate
 * @param {array[]} map, tiles map
 * @param {integer} x, tile topleft x-coordinate
 * @param {integer} y, tile topleft y-coordinate
 * @return {object}, {top:{double}, left:{double}} 
 */
export function getTopLeftPxByCoordinate(settings, groupId, x, y) {
  let top = 0, left = 0;
  let oCurrGroup = settings._groupsMap[groupId];
  top = oCurrGroup.top + x * (settings.cellHeight + settings.cellSpace)
    + settings.titleHeight;
  left = y * (settings.cellWidth + settings.cellSpace)
    + settings._leftMargin;
  return {
    top: top,
    left: left
  }
}

/**
 * Get group Id and tile mapX&mapY by it's relative coordinate
 * @param {array[]} map, tiles map
 * @param {integer} x, tile topleft x-coordinate
 * @param {integer} y, tile topleft y-coordinate
 * @return {object}, {top:{double}, left:{double}} 
 */
export function getCurrentGroupAndCellByCoordinator(settings, groups, x, y) {
  let i, destGroupId, destTileMapX, destTileMapY;
  // find groupId by coordinator 
  let aGroupRanges = getGroupRanges(settings, groups);
  for(i = 0; i < aGroupRanges.length; i++){
    if(y >= aGroupRanges[i].start && y <= aGroupRanges[i].end){
      destGroupId = aGroupRanges[i].groupId;
      break;
    }
  }
  let destGroup = settings._groupsMap[destGroupId];
  let destGroupIndex = destGroup.index;

  // Judge dragged tile position, must in one of the tile,
  //if not, put it to the end.
  mapHelper.updateMapCoordinates(settings, destGroup);
  let aTileRanges = getTileRanges(settings, destGroup);
  for(i = 0; i < aTileRanges.length; i++){
    if(x >= aTileRanges[i].startX && x <= aTileRanges[i].endX
      && y >= aTileRanges[i].startY && y <= aTileRanges[i].endY){
      destTileMapX = aTileRanges[i].mapX;
      destTileMapY = aTileRanges[i].mapY;                
      break;
    }
  }
  if(destTileMapX === undefined || destTileMapY === undefined){ //last index in the group
    let rowLen = destGroup.map.length;
    let colLen = destGroup.map[0].length;
    destTileMapX = rowLen - 1;
    destTileMapY = colLen - 1;
  }

  return {
    groupId : destGroupId,
    mapX : destTileMapX,
    mapY : destTileMapY
  };
}

/**
 * Get exactly postion for the tile placeholder
 * @return {object}, {top:{double}, left:{double}, width: {integer}, height:{integer}} 
 */
export function getTargetPosition(settings) {
  let oPosition = {
    top : 0,
    left : 0,
    width : 0,
    height : 0
  };

  let oCurTile, oCurGroup;
  if (settings.draggableState.dragging) {
    oCurTile = settings.draggableState.srcTile;
    oCurGroup = settings._groupsMap[oCurTile.groupId];
  }
  // else if (this.state.resizeState.isItemResizing) {
  //   oCurGroup = this._groupsHashMap[this.state.resizeState.srcTileGroupId];
  //   oCurTile = this._tilesHashMap[this.state.resizeState.srcTilePiece];
  // }

  //if(this.state.draggableState.dragging || this.state.resizeState.isItemResizing){
  if(settings.draggableState.dragging){
    let curMapX = oCurTile.mapX;
    let curMapY = oCurTile.mapY;
    let oCoordinate = getTopLeftPxByCoordinate(settings, 
      oCurTile.groupId, curMapX, curMapY);
    oPosition.top = oCoordinate.top;
    oPosition.left = oCoordinate.left;
    oPosition.width = tileHelper.getWidthPx(settings, oCurTile.width);
    oPosition.height = tileHelper.getHeigthPx(settings, oCurTile.height);
  }

  return oPosition;
}

/**
 * pageX and pageY for different events
 */
export function pointerEventToXY(settings, e){
  let res = {pageX: 0, pageY: 0, clientX: 0, clientY: 0};
  res.pageX = e.pageX || e.originalEvent.touches[0].pageX;
  res.pageY = e.pageY || e.originalEvent.touches[0].pageY;
  res.clientX = e.clientX || e.originalEvent.touches[0].clientX;
  res.clientY = e.clientY || e.originalEvent.touches[0].clientY;
  return res;
  // if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
  //   let touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
  //   res.pageX = touch.pageX;
  //   res.pageY = touch.pageY;
  // } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' 
  //   || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
  //   res.pageX = e.pageX;
  //   res.pageY = e.pageY;
  // }
};


