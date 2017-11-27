<template>
	<div>
    <Group
      v-for="group in groupList"
      :key="group.id"
      :group="group"
      :onDragStart="_handleDragStart"
    />
	</div>
</template>

<script>
import Group from './Group.vue';
import * as mapHelper from '../helper/mapHelper.js';
import * as calculateHelper from '../helper/calculateHelper.js';
import * as groupHelper from '../helper/groupHelper.js';
import * as tileHelper from '../helper/tileHelper.js';

let _maxCellWidth = 0;
const _groupsMap = {};
const _cellsMap = {};

const settings = {
  cellWidth: 100,
  cellHeight: 100,
  cellSpace: 16,

  groupPaddingTop: 15,
  groupPaddingBottom: 26,
  groupSpace: 35,
  spaceBetweenCellAndGroup: 15,

  titleHeight: 40,

  paddingTop: 20,
  paddingLeft: 80,
  paddingRight: 80,
  containerWidth: document.body.offsetWidth,
}

settings.draggableState = {
  dragging: false, //start drag and doesn't release is dragging
  moved: false,  //if tile is moved, e.g. just click the tile, doesn't move
  srcGroupId: 0, //source group id
  srcCellId: 0, //source cell id
  cellTop: 0, //cell css top px
  cellLeft: 0, //cell css left px
  destMapX: 0, //destination map x
  destMapY: 0, //destination map y
  deltaX: 0, //x from click point to tile boundary
  deltaY: 0 //y from click point to tile boundary
};

settings._groupsMap = _groupsMap;
settings._cellsMap = _cellsMap;
settings._numberOfColumns = 0;
settings._leftMargin = 0;

let _groupsData = [];
let _lastResizeTime = 0;

export default {
	components: {
		Group
	},
  props: {
    groups: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      groupList: []
    }
  },
  created: function(){
    //calculte _numberOfColumns
    settings._numberOfColumns = calculateHelper.getNumberOfColumns(settings);   

    settings._leftMargin = (settings.containerWidth - tileHelper.getWidthPx(
      Object.assign({}, settings), settings._numberOfColumns)) / 2;

    _groupsData = this._deepClone(this.groups);
    this.$data.groupList = this._deepClone(this.groups);
    this.drawCells(this.$data.groupList);

    this.addEvents();
    console.log(settings);
  },
  destroyed: function(){
    this.removeEvents();
  },
	methods: {
    _deepClone: function(obj){
      return JSON.parse(JSON.stringify(obj));
    },
    drawCells: function(rawGroups){
      let groupIndex = 0;
      let cellIndex;
      let groups = this._deepClone(rawGroups);

      for(let i = 0; i < groups.length; i++){
        cellIndex = 0;
        groups[i].map = [];
        let emptyX = 0, emptyY = 0; //first cell in the new map
        mapHelper.insertNewLineIntoMap(Object.assign({}, settings), groups[i].map);
        groups[i].index = groupIndex++;
        groups[i].top = groupHelper.getTopPx(Object.assign({}, settings), groups, i);
        groups[i].left = settings._leftMargin;
        groups[i].width = groupHelper.getWidth(Object.assign({}, settings), groups, i);

        groups[i].backgroundTop = groups[i].top - settings.groupPaddingTop;
        groups[i].backgroundLeft = settings._leftMargin - settings.spaceBetweenCellAndGroup;
        groups[i].backgroundWidth = tileHelper.getWidthPx(settings, settings._numberOfColumns)
          + settings.spaceBetweenCellAndGroup * 2;
        _groupsMap[groups[i].id] = groups[i];

        if(groups[i].cells){
          for(let j = 0; j < groups[i].cells.length; j++){
            let currCell = groups[i].cells[j];
            _maxCellWidth = Math.max(_maxCellWidth, currCell.width);
            currCell.width = Math.floor(currCell.width);
            currCell.width = currCell.width > settings._numberOfColumns ?
              settings._numberOfColumns : currCell.width;
            currCell.height = Math.floor(currCell.height);
            currCell.widthPx = tileHelper.getWidthPx(Object.assign({}, settings), currCell.width);
            currCell.heightPx = tileHelper.getHeigthPx(Object.assign({}, settings), currCell.height);
            currCell.groupId = groups[i].id;
            currCell.groupIndex = groups[i].index;
            currCell.index = cellIndex++;
            _cellsMap[currCell.id] = groups[i].cells[j];

            //set tile top and left in this function
            let emptyXY = mapHelper.putTile(Object.assign({}, settings),
              groups[i].map, emptyX, emptyY, _cellsMap[currCell.id]);
            emptyX = emptyXY.x;
            emptyY = emptyXY.y;

            if(settings.draggableState.dragging &&
              currCell.id === settings.draggableState.srcCellId){
              currCell.top = settings.draggableState.cellTop;
              currCell.left = settings.draggableState.cellLeft;
            }

          }
        }
        groups[i].bottom = groupHelper.getBottomPx(settings, groups, i);
        groups[i].backgroundHeight = groups[i].bottom - groups[i].top + settings.groupPaddingBottom;
      }

      this.$data.groupList = groups
    },
    doMove: function(newGroup){
      _groupsData = this._deepClone(newGroup);
      this.drawCells(newGroup);
    },
    cellCursorPos: function(evt, cellId, t, l){
      let top, left;
      if(t !== undefined && left !== undefined){
        top = t;
        left = l;
      }else{
        //calculate x and y coodinate from click point to the grid control boundary
        const rect = evt.target.getBoundingClientRect();
        const XY = calculateHelper.pointerEventToXY(settings, evt);
        const relX = XY.pageX;
        const relY = XY.pageY;
        top = relY - settings.draggableState.deltaY;
        left = relX - settings.draggableState.deltaX;
      }

      return {
        top: top,
        left: left
      };
    },
    updateAvatarPos: function(cellId, top, left){
      let cellDom = document.getElementById(cellId);
      cellDom.style.top = top + 'px';
      cellDom.style.left = left + 'px';
    },
    addEvents: function(){
      window.addEventListener('resize', this._handleResize);
      window.addEventListener('mousemove', this._handleMouseMove);
      window.addEventListener('mouseup', this._handleMouseUp);
    },
    removeEvents: function(){
      window.removeEventListener('resize', this._handleResize);
      window.removeEventListener('mousemove', this._handleMouseMove);
      window.removeEventListener('mouseup', this._handleMouseUp);
    },
    _handleResize: function(){
      const now = new Date().getTime();
      if (_lastResizeTime && (now - _lastResizeTime) < 300) {
        _lastResizeTime = now;
        return;
      }

      settings.containerWidth = document.body.offsetWidth;
      settings._numberOfColumns = calculateHelper.getNumberOfColumns(settings);   

      settings._leftMargin = (settings.containerWidth - tileHelper.getWidthPx(
        Object.assign({}, settings), settings._numberOfColumns)) / 2;
      this.drawCells(_groupsData);
    },
    _handleDragStart: function(evt){
      //calculate x and y coodinate from click point to the grid control boundary
      const rect = evt.target.getBoundingClientRect();
      const XY = calculateHelper.pointerEventToXY(settings, evt);
      const relX = XY.pageX - rect.left;
      const relY = XY.pageY - rect.top - window.pageYOffset;

      //fetch x and y coodinate and group id by click position
      let currX, currY, groupId;
      let groupAndCellInfo = mapHelper.getCellCoordInfo(evt.target.className);
      groupId = groupAndCellInfo.groupId;
      currX = groupAndCellInfo.currX;
      currY = groupAndCellInfo.currY;

      //get group and tile object
      let oGroup = _groupsMap[groupId];
      let map = oGroup.map;
      let sTileId = map[currX][currY].piece;
      let oTile = _cellsMap[sTileId];
      //set drag status if oTile can be found
      if (oTile) {
        settings.draggableState.srcGroupId = oGroup.id;
        settings.draggableState.srcCellId = oTile.id;
        settings.draggableState.dragging = true;
        settings.draggableState.deltaX = relX;//relX - oTile.left; //x from click point to tile boundary
        settings.draggableState.deltaY = relY;//relY - oTile.top; //y from click point to tile boundary
      }  
    },
    _handleMouseMove: function(evt){
      if(settings.draggableState.dragging){
        //This function is mainly to find source and destination group/tile index
        let destGroupIndex, destGroup, destTileMapX, destTileMapY;
        let oSrcTile = _cellsMap[settings.draggableState.srcCellId];
        let oSrcGroup = _groupsMap[oSrcTile.groupId];
        let srcGroupIndex = oSrcGroup.index;
        let srcTileIndex = oSrcTile.index;
        let srcCellId = oSrcTile.id;

        //1. Calculate cell center
        const rect = evt.target.getBoundingClientRect();
        const XY = calculateHelper.pointerEventToXY(settings, evt);
        const relX = XY.pageX;
        const relY = XY.pageY;
        let centerXY = tileHelper.getCenterByClickCoordinates(settings, oSrcTile, relX, relY);
        let centerX = centerXY.x, centerY = centerXY.y;

        //2. calulate group and cell info and by coordinator
        let groupAndCellInfo = calculateHelper.getCurrentGroupAndCellByCoordinator(
          settings, this.$data.groupList, centerX, centerY);
        let destGroupId = groupAndCellInfo.groupId;
        destTileMapX = groupAndCellInfo.mapX;
        destTileMapY = groupAndCellInfo.mapY;
        destGroup = _groupsMap[destGroupId];
        destGroupIndex = destGroup.index;

        //3. Move cell to the destination
        if(srcGroupIndex !== destGroupIndex || oSrcTile.mapX !== destTileMapX
          || oSrcTile.mapY !== destTileMapY){
          let aNewGroup = this._deepClone(_groupsData);
          let splicedTile = aNewGroup[srcGroupIndex].cells.splice(srcTileIndex, 1);
          let sDestTileIndex = mapHelper.tilesSimulation(
            settings, destGroup.cells, oSrcTile, destTileMapX, destTileMapY);
          let aTiles = aNewGroup[destGroupIndex].cells;

          aTiles.splice(sDestTileIndex, 0, splicedTile[0]); 
          this.doMove(aNewGroup);
        }
        settings.draggableState.moved = true;

        //4. get postion
        let cursor = this.cellCursorPos(evt, srcCellId);

        //5. Set destination cell id into the state
        settings.draggableState.destGroupId = destGroupId;
        settings.draggableState.destMapX = destTileMapX;
        settings.draggableState.destMapY = destTileMapY;
        settings.draggableState.cellTop = cursor.top;
        settings.draggableState.cellLeft = cursor.left;

        //6. update style
        this.updateAvatarPos(srcCellId, cursor.top, cursor.left);
        
        evt.stopPropagation();
        evt.preventDefault();
      }
    },
    _handleMouseUp: function(evt){
      if(settings.draggableState.dragging){
        let oSrcCell = _cellsMap[settings.draggableState.srcCellId];
        let oDescGroup = _groupsMap[oSrcCell.groupId];
        let oCoordinate = calculateHelper.getTopLeftPxByCoordinate(settings, 
          oDescGroup.id, oSrcCell.mapX, oSrcCell.mapY);
        this.updateAvatarPos(oSrcCell.id, oCoordinate.top, oCoordinate.left);
        settings.draggableState.dragging = false;
      }
    },

	},
  
}
</script>

<style lang="scss" scoped>

</style>