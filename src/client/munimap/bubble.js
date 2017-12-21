goog.provide('munimap.bubble');

/**
 * @param {ol.Map} map
 *
 * @return {ol.Overlay}
 */
munimap.bubble.create = function (map) {
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

  var closePopup = function () {
    popup.setPosition(undefined);
    return false;
  };

  closeButtonEl.onclick = closePopup;

  var view = map.getView();
  view.on('change:resolution', function (evt) {
    var resolution = view.getResolution();
    if (resolution) {
      var isVisible = munimap.range.contains(
        munimap.pubtran.stop.RESOLUTION, resolution);
      if (!isVisible) {
        closePopup();
      }
    }
  });
  map.addOverlay(popup);
  return popup;
};


/**
 * @param {ol.Feature} feature
 * @param {ol.Map} map
 * * @param {string} detail
 */
munimap.bubble.show = function (feature, map, detail) {
  var popup = map.getOverlayById('genericPopup');
  if (!popup) {
    popup = munimap.bubble.create(map);
  }
  var popupEl = popup.getElement();
  if (popupEl) {
    var title = detail
    var contentEl = goog.dom.getElementByClass('munimap-content', popupEl);

    goog.dom.removeChildren(contentEl);
    munimap.bubble.appendContentToEl(title, contentEl);
    popup.setPosition(ol.extent.getCenter(feature.getGeometry().getExtent()));

    var popupSize = goog.style.getSize(popupEl);
    var x = -munimap.info.POPUP_TALE_INDENT;
    var y = -(popupSize.height + munimap.info.POPUP_TALE_HEIGHT);

    popup.setOffset([x, y]);
  }
};


/**
 * @param {string} title
 * @param {Element} contentEl
 * @protected
 */
munimap.bubble.appendContentToEl = function (title, contentEl) {
  contentEl.innerHTML = title
};
