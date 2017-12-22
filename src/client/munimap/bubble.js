goog.provide('munimap.bubble');

/**
 * @param {ol.Map} map
 *
 * @return {ol.Overlay}
 */
munimap.bubble.create = function(map) {
  var munimapEl = map.getTargetElement();
  var popupEl = goog.dom.createDom('div', 'ol-popup munimap-info' +
    ' munimap-info-bubble');
  var contentEl = goog.dom.createDom('div', 'munimap-content');
  var closeButtonEl = goog.dom.createDom('div', 'munimap-close-button');
  goog.dom.appendChild(popupEl, closeButtonEl);
  goog.dom.appendChild(popupEl, contentEl);
  goog.dom.appendChild(munimapEl, popupEl);

  var popup = new ol.Overlay({
    id: 'genericPopup',
    element: popupEl,
    autoPan: false
  });

  // check if marker is visible after the zoom ends
  var ghostZoom = map.getView().getZoom();
  var checkResolution = function() {
    if (ghostZoom != map.getView().getZoom()) {
      ghostZoom = map.getView().getZoom();
      var resolution = map.getView().getResolution();
      if (resolution) {
        var isVisible = munimap.range.contains(
          munimap.marker.RESOLUTION, resolution);
        if (!isVisible) {
          closePopup();
        }
      }
    }
  }

  var closePopup = function() {
    map.un('moveend', checkResolution);
    map.removeOverlay(popup);
    return false;
  };

  closeButtonEl.onclick = closePopup;
  map.on('moveend', checkResolution);
  map.addOverlay(popup);
  return popup;
};


/**
 * @param {ol.Feature} feature
 * @param {ol.Map} map
 * * @param {string} detail
 */
munimap.bubble.show = function(feature, map, detail) {
  var popup = map.getOverlayById('genericPopup');
  if (!popup) {
    popup = munimap.bubble.create(map);
  }
  var popupEl = popup.getElement();
  if (popupEl) {
    var contentEl = goog.dom.getElementByClass('munimap-content', popupEl);

    goog.dom.removeChildren(contentEl);
    contentEl.innerHTML = detail;
    popup.setPosition(ol.extent.getCenter(feature.getGeometry().getExtent()));

    var popupSize = goog.style.getSize(popupEl);
    var x = -munimap.info.POPUP_TALE_INDENT;
    var y = -(popupSize.height + munimap.info.POPUP_TALE_HEIGHT + 20);
    popup.setOffset([x, y]);
  }
};



