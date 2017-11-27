import * as calculateHelper from './calculateHelper.js';

/**
 * Insert one new row in tiles map
 * @param {array[]} map, tiles map, two-dimensional array,
 *   A single item in map is an object with below structure: 
 *   {piece: {string}, startX: {number}, startY: {number}
 *   , endX: {number}, endY: {number}}
 * @param {integer} iNumberOfColumns
 * @return void
 *   update map in this function
 */
export function insertNewLineIntoMap(settings, map) {
  let row = [];
  let iNumberOfColumns = settings._numberOfColumns;
  while(iNumberOfColumns--){
    row.push(new MapItem('#'));
  }
  map.push(row);

  function MapItem(piece){
    this.piece = piece;
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
  }
}

/**
 * Check if the tile can be put into target position
 * @param {array[]} map, tiles map
 * @param {integer} x, tile x-coordinate
 * @param {integer} y, tile y-coordinate
 * @param {object} oTile
 * @return {boolean}
 */
export function canPut(settings, map, x, y, oTile) {
  let width = oTile.width;
  let height = oTile.height;
  //check row
  for(let i = x; i < x + height; i++){
    if(map[i] === undefined){
      continue; //could put tile here if we insert a new line later
    }
    //check column
    for(let j = y; j < y + width; j++){
      if(!map[i][j]){
        return false;
      }
      //can put into current postion and empty position
      //if(map[i][j].piece !== oTile.id && map[i][j].piece !== '#'){
      if(map[i][j].piece !== '#'){
        return false;
      }
    }
  }
  return true;
}

/**
 * Recursively search next empty position('#')
 * @param {array[]} map, tiles map
 * @param {integer} currId, current tile id
 * @param {integer} currX
 * @param {integer} currY
 * @param {boolean} isIncludeCurrCoor, whether including current coordinate
 * @return {object} {x:{integer}, y:{integer}}
 */
export function findNextEmptyPos(settings, map, currId, currX, currY, isIncludeCurrCoor) {
  //current position is empty
  if(isIncludeCurrCoor && map[currX] && map[currX][currY] 
    && (map[currX][currY].piece === '#' || map[currX][currY].piece === '@')){
    return {
      x : currX,
      y : currY
    }
  }
  //create a new row and return first cell
  if(!map[currX] && currY === 0){
    insertNewLineIntoMap(settings, map);
    return {
      x : currX,
      y : currY
    }
  }
  //try to find next cell
  if(map[currX][currY] !== undefined){ //right one
    return findNextEmptyPos(settings, map, currId, currX, currY + 1, true);
  }else{ //next line, first one
    return findNextEmptyPos(settings, map, currId, currX + 1, 0, true);
  }
}

/**
 * Get next cell position
 * @param {integer} x
 * @param {integer} y
 * @return {object} {emptyX:{integer}, emptyY:{integer}}
 */
export function getNextCell(settings, x, y) {
  if(y < settings._numberOfColumns - 1){
    return {
      x: x, 
      y: y + 1
    }
  }else{
    return {
      x: x + 1, 
      y: 0
    }
  }
}

/**
 * Recursively search insert index.
 * If current cell is '#', find previous one.
 * If the first cell is still empty(in other words the map is empty),
 * should insert at index 0.
 * @param {array[]} map, tiles map
 * @param {integer} i
 * @param {integer} j
 * @return {integer}
 */
export function findInsertIndex(settings, map, i, j) {
  let columnLen = map[0].length;
  if(i === 0 && j === 0 && map[i][j].piece === '#'){
    return 0;
  }
  if(map[i][j].piece !== '#'){
    let oTile = settings._cellsMap[map[i][j].piece];
    return oTile.index + 1;
  }else{
    if(j !== 0){ //left one
      return findInsertIndex(settings, map, i, j - 1);
    }else{ //previous row
      return findInsertIndex(settings, map, i - 1, columnLen - 1);
    }
  }
}

/**
 * Put a tile into the map
 * @param {array[]} map, tiles map
 * @param {integer} emptyX, first empty tile x-coordinate
 * @param {integer} emptyY, first empty tile y-coordinate
 * @param {object} oTile
 * @return {object} {emptyX: {integer}, emptyY: {integer}}
 *   update emptyX, emptyY in this function
 *   calculate and update oTile.mapX, oTile.mapY, 
 *     oTile.top, oTile.left in this function
 */
export function putTile(settings, map, emptyX, emptyY, oTile) {
  //find an empty space
  let tmp;
  while(!canPut(settings, map, emptyX, emptyY, oTile)){
    tmp = findNextEmptyPos(settings, map, oTile.id, emptyX, emptyY);
    emptyX = tmp.x;
    emptyY = tmp.y;
  }
  //put the tile into the map, then update map information
  for(let i = emptyX; i < emptyX + oTile.height; i++){
    if(map[i] === undefined){
      insertNewLineIntoMap(settings, map);
    }
    for(let j = emptyY; j < emptyY + oTile.width; j++){
      map[i][j].piece = oTile.id;
    }
  }
  oTile.mapX = emptyX;
  oTile.mapY = emptyY;

  //calculate top and left pixus, set it to the tile
  tmp = calculateHelper.getTopLeftPxByCoordinate(settings, 
    oTile.groupId, emptyX, emptyY);
  oTile.top = tmp.top;
  oTile.left = tmp.left;

  return getNextCell(settings, emptyX, emptyY);
}

/**
 * Update Map Coordinates
 * @param {object} oGroup, current single group
 * @return void
 *   update map item's startX, startY,
 *   endX, endY in this function
 */
export function updateMapCoordinates(settings, oGroup) {
  let map = oGroup.map;
  let row = map.length;
  let col = map[0].length; //noticed that map at least has one row, safe here
  //If we have decimals, ceil it, otherwise, it will have some cracks, 1px probably.
  //If user drag a tile on the crack, it will cause some error.
  const halfTileSpace = Math.ceil(settings.cellSpace / 2);
  for(let i = 0; i < row; i++){
    for(let j = 0; j < col; j++){
      //Similar formula like calculate tile's top and left,
      //but add halfTileSpace to cover all of the areas
      map[i][j].startX = j * (settings.cellWidth + settings.cellSpace)
        + settings._leftMargin - halfTileSpace;
      map[i][j].startY = oGroup.top + i * (settings.cellHeight + settings.cellSpace)
        + settings.titleHeight - halfTileSpace;
      //Add tile's width or height to calculte bottomright coordinate
      map[i][j].endX = map[i][j].startX + settings.cellWidth
        + settings.cellSpace;
      map[i][j].endY = map[i][j].startY + settings.cellHeight
        + settings.cellSpace;
    }
  }
}

/**
 * Find the last possible postion to put the tile
 * @param {object} oDestGroup, destination group object
 * @param {object} oSrcTile, source tile
 * @return {object}, {mapX: {integer}, mapY: {integer}}
 */
export function findLastPossibleMapXY(settings, oDestGroup, oSrcTile) {
  //find the last tile except oSrcTile
  let iDestTileLen = oDestGroup.items.length;
  let oDestLastTile;
  for(let i = iDestTileLen - 1; i >= 0; i--){
    if(oDestGroup.items[i].id !== oSrcTile.id){
      oDestLastTile = oDestGroup.items[i];
      break;
    }
  }
  let emptyX, emptyY;
  if(!oDestLastTile){ //empty group
    emptyX = 0;
    emptyY = 0;
  }else{
    emptyX = oDestLastTile.mapX;
    emptyY = oDestLastTile.mapY;
  }

  let tmp, map = oDestGroup.map;
  while(!canPut(settings, map, emptyX, emptyY, oSrcTile)){
    tmp = findNextEmptyPos(settings, map, oSrcTile.id, emptyX, emptyY, false);
    emptyX = tmp.x;
    emptyY = tmp.y;
  }
  return {mapX: emptyX, mapY: emptyY};
}

/**
 * Fix the destination tile position, calculte the destination tile index
 * @param {array} aTiles
 * @param {object} oTile, source tile
 * @param {integer} iTileMapX
 * @param {integer} iTileMapY
 * @return {integer}, destination tile index
 */
export function tilesSimulation(settings, aTiles, oTile, iTileMapX, iTileMapY) {
  let i, j, x, y, tmp, map = [];
  //put iTileMapX and iTileMapY into map
  for(i = 0; i < iTileMapX + oTile.height; i++){
    if(!map[i]){
      insertNewLineIntoMap(settings, map);
    }
  }
  for(i = iTileMapX; i < iTileMapX + oTile.height; i++){
    for(j = iTileMapY; j < iTileMapY + oTile.width; j++){
      if(map[i] && map[i][j]){ //in the map
        map[i][j].piece = '@';
      } 
      //else out of boundary     
    }
  }
  //simulate
  let emptyX = 0, emptyY = 0, destTileIndex = 0, nextCell, isFound = false;
  if(map[0][0].piece !== '@'){
    for(i = 0; i < aTiles.length; i++){
      while(!canPut(settings, map, emptyX, emptyY, aTiles[i])){          
        tmp = findNextEmptyPos(settings, map, oTile.id, emptyX, emptyY, false);
        emptyX = tmp.x;
        emptyY = tmp.y;
        if(map[emptyX] && map[emptyX][emptyY].piece === '@'){
          isFound = true;
          break;
        }          
      }
      if(isFound){
        break;
      }
      //put tile into the map
      for(x = emptyX; x < emptyX + aTiles[i].height; x++){
        if(!map[x]){
          insertNewLineIntoMap(settings, map);
        }
        for(y = emptyY; y < emptyY + aTiles[i].width; y++){
          map[x][y].piece = aTiles[i].id;
        }
      }
      destTileIndex++;
    }
  }
  //else drag to the first cell, return index 0
  return destTileIndex;
}

export function getCellCoordInfo(targetClass){
  //fetch x and y coodinate and group id from class
  let currX, currY, groupId, splited = targetClass.split(' ');
  for(let i = 0; i < splited.length; i++){
    splited[i] = splited[i].trim();
    if(/^x#/.test(splited[i])){ //start with "x#"
      currX = splited[i].substring(2, splited[i].length);
    }else if(/^y#/.test(splited[i])){ //start with "y#"
      currY = splited[i].substring(2, splited[i].length);
    }else if(/^g#/.test(splited[i])){ //start with "g#"
      groupId = splited[i].substring(2, splited[i].length);
    }
  }
  return {
    currX: currX,
    currY: currY,
    groupId: groupId
  };
}

