 /** 
 * Calculate tile width pixus
 * @param {object} oGroup
 * @return {integer}
 */
export function getWidthPx(settings, width) {
  return width * (settings.cellWidth
    + settings.cellSpace) - settings.cellSpace;
}

/** 
 * Calculate tile height pixus
 * @param {object} oGroup
 * @return {integer}
 */
export function getHeigthPx(settings, height) {
  return height * (settings.cellHeight
    + settings.cellSpace) - settings.cellSpace;
}

/**
 * Calculate tile first cell's center by mouse click coordinates.
 * @param {object} oTile
 * @param {double} relX
 * @param {double} relY
 * @return {object} {x:{double}, y:{double}}
 */
export function getCenterByClickCoordinates(settings, oTile, relX, relY) {
  let halfTileWidth = settings.cellWidth >> 1;
  let halfTileHeight = settings.cellHeight >> 1;
  return {
    x: relX - settings.draggableState.deltaX + halfTileWidth,
    y: relY - settings.draggableState.deltaY + halfTileHeight
  }
}