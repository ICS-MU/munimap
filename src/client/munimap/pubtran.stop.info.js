goog.provide('munimap.pubtran.stop.info');


/**
 * @param {ol.Map} map
 *
 * @return {ol.Overlay}
 */
munimap.pubtran.stop.info.create = function(map) {
  var munimapEl = map.getTargetElement();
  var popupEl = goog.dom.createDom('div', 'ol-popup munimap-info munimap-info-bubble');
  var contentEl = goog.dom.createDom('div', 'munimap-content');
  var closeButtonEl = goog.dom.createDom('div', 'munimap-close-button');
  goog.dom.appendChild(popupEl, closeButtonEl);
  goog.dom.appendChild(popupEl, contentEl);
  goog.dom.appendChild(munimapEl, popupEl);

  var popup = new ol.Overlay({
    id: 'pubTranPopup',
    element: popupEl,
    autoPan: true
  });

  var closePopup = function() {
    popup.setPosition(undefined);
    return false;
  };

  closeButtonEl.onclick = closePopup;

  var view = map.getView();
  view.on('change:resolution', function(evt) {
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
 */
munimap.pubtran.stop.info.show = function(feature, map) {
  var popup = map.getOverlayById('pubTranPopup');
  if (!popup) {
    popup = munimap.pubtran.stop.info.create(map);
  }

  var popupEl = popup.getElement();
  if (popupEl) {
    var title = /**@type {string}*/ (feature.get('nazev'));
    var contentEl = goog.dom.getElementByClass('munimap-content', popupEl);
    goog.dom.removeChildren(contentEl);

    munimap.pubtran.stop.info.appendContentToEl(title, contentEl);

    var point = /**@type {ol.geom.Point}*/ (feature.getGeometry());
    var coordinates = point.getCoordinates();
    popup.setPosition(coordinates);

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
munimap.pubtran.stop.info.appendContentToEl = function(title, contentEl) {
  var titleEl =
      goog.dom.createDom('div', 'munimap-title', goog.dom.createTextNode(title));
  var link = 'http://jizdnirady.idnes.cz/idsjmk/spojeni/?';
  var linkToAttributes = {
    href: encodeURI(link + 't=' + title),
    target: '_blank'
  };
  var linkFromAttributes = {
    href: encodeURI(link + 'f=' + title),
    target: '_blank'
  };
  var linkToEl = goog.dom.createDom('a', linkToAttributes,
      goog.dom.createTextNode(
      munimap.lang.getMsg(munimap.lang.Translations.CONNECTION_TO)));
  var linkFromEl = goog.dom.createDom('a', linkFromAttributes,
      goog.dom.createTextNode(
      munimap.lang.getMsg(munimap.lang.Translations.CONNECTION_FROM)));
  var linkEl = goog.dom.createDom('div', null, goog.dom.createTextNode(
      munimap.lang.getMsg(munimap.lang.Translations.FIND_CONNECTION) + ': '));
  goog.dom.appendChild(linkEl, linkToEl);
  goog.dom.appendChild(linkEl, goog.dom.createTextNode(' / '));
  goog.dom.appendChild(linkEl, linkFromEl);
  goog.dom.appendChild(contentEl, titleEl);
  goog.dom.appendChild(contentEl, linkEl);
};
