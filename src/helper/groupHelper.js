/** 
 * Calculate group top pixus
 * @param {object} oGroup
 * @return {integer}
 */
export function getTopPx(settings, oGroup, i) {
  if(!oGroup){
    return 0;
  }
  if(i === 0){
    return settings.paddingTop;
  }else{
    let previousBottom = oGroup[i - 1].bottom;
    return previousBottom + settings.groupSpace;
  }
}

/** 
 * Calculate group bottom pixus
 * @param {object} oGroup
 * @return {integer}
 */
export function getBottomPx(settings, groups, i) {
  if(!groups){
    return 0;
  }
  let map = groups[i].map;
  let tilesHeight = map.length;
  let itemSpace = 0;
  if(tilesHeight !== 0){
    itemSpace = (tilesHeight - 1) * settings.cellSpace;
  }
  return groups[i].top + settings.titleHeight
    + tilesHeight * settings.cellHeight + itemSpace;
}

/** 
 * Calculate group width
 * @param {object} oGroup
 * @return {integer}
 */
export function getWidth(settings, oGroup, i) {
  if(!oGroup){
    return 0;
  }
  let paddingLeft = settings.paddingLeft || 0;
  let paddingRight = settings.paddingRight || 0;
  return settings.containerWidth - paddingLeft - paddingRight;
}