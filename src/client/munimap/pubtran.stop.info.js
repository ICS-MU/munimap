goog.provide('munimap.pubtran.stop.info');


/**
 * @param {ol.Map} map
 * 
 * @return {ol.Overlay}
 */
munimap.pubtran.stop.info.create = function(map) {
  var element = munimap.getProps(map).popupInfo;
  var contentEl = goog.dom.createDom('div', 'content');
  var closeButtonEl = goog.dom.createDom('div', 'close-button');
  goog.dom.appendChild(element, closeButtonEl);
  goog.dom.appendChild(element, contentEl);
  
  var popup = new ol.Overlay({
    id: 'pubTranPopup',
    element: element,
    autoPan: true,
    offset: [40,-70]
  });
  
  closeButtonEl.onclick = function() {
    popup.setPosition(undefined);
    return false;    
  };

  map.addOverlay(popup);
  return popup;
};


/**
 * @param {ol.Feature} feature
 * @param {ol.Map} map
 */
munimap.pubtran.stop.info.show = function(feature, map) {
  var popup = map.getOverlayById('pubTranPopup');
  if (!popup) {
    popup = munimap.pubtran.stop.info.create(map);
  }
  
  var popupEl = popup.getElement();
  if (popupEl) {
    var contentEl = goog.dom.getElementByClass('content', popupEl);
    contentEl.innerHTML = /**@type {string}*/ (feature.get('nazev'));
    var point = /**@type {ol.geom.Point}*/ (feature.getGeometry());
    var coordinates = point.getCoordinates();
    popup.setPosition(coordinates);
  }
};
