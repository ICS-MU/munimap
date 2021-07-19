/**
 *
 * @module control/geolocate
 */
import * as actions from '../redux/action.js';
import * as munimap_lang from '../lang/lang.js';
import * as ol_extent from 'ol/extent';
import Circle from 'ol/style/Circle';
import Control from 'ol/control/Control';
import Feature from 'ol/Feature';
import Fill from 'ol/style/Fill';
import Geolocation from 'ol/Geolocation';
import Point from 'ol/geom/Point';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {getAnimationDuration} from '../utils/animation.js';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("redux").Store} redux.Store
 */

/**
 * @param {ol.Map} map map
 * @param {Geolocation} geolocation geolocation instance
 */
const animate = (map, geolocation) => {
  const center = geolocation.getPosition() || null;
  const view = map.getView();
  const currExt = view.calculateExtent(map.getSize());
  const res = view.getResolution();
  const buffExt = ol_extent.buffer(currExt, res * 100, currExt);
  const extent = ol_extent.boundingExtent([center, view.getCenter()]);
  const targetExtent = ol_extent.boundingExtent([center]);
  const duration = getAnimationDuration(currExt, targetExtent);
  const resolution = view.getResolutionForExtent(extent);
  let zoom = view.getZoomForResolution(resolution);
  if (ol_extent.intersects(buffExt, targetExtent)) {
    view.animate({
      center: center,
      duration: duration,
      zoom: 18,
    });
  } else {
    if (zoom >= 18) {
      zoom = 17.5;
    }
    view.animate({
      center: center,
      duration: duration,
    });
    view.animate(
      {
        zoom: zoom,
        duration: duration / 2,
      },
      {
        zoom: 18,
        duration: duration / 2,
      }
    );
  }
};

/**
 * @param {ol.Map} map map
 * @param {redux.Store} store store
 * @param {Geolocation} geolocation geolocation
 */
const handleClick = (map, store, geolocation) => {
  store.dispatch(
    actions.send_to_matomo({
      category: 'geolocation',
      action: 'click',
    })
  );

  if (!geolocation.getTracking()) {
    geolocation.setTracking(true);
    geolocation.once('change', () => {
      animate(map, geolocation);
    });
  } else {
    animate(map, geolocation);
  }
};

/**
 * @param {Geolocation} geolocation geolocation
 * @param {Feature} positionFeature feature
 */
const handlePositionChange = (geolocation, positionFeature) => {
  const coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
};

/**
 * @param {ol.Map} map map
 * @param {redux.Store} store store
 * @param {string} lang language
 * @return {Control} control
 */
export default (map, store, lang) => {
  const geolocation = new Geolocation({
    projection: map.getView().getProjection(),
  });

  const main = document.createElement('div');
  main.className += ' munimap-geolocate';
  main.id = 'muni-locate';
  main.title = munimap_lang.getMsg(munimap_lang.Translations.FIND_ME, lang);
  const icon = document.createElement('i');
  icon.className += ' munimap-crosshairs';
  icon.innerHTML = '&#xe807;';
  main.appendChild(icon);
  const result = new Control({
    element: main,
  });

  main.addEventListener('click', () => handleClick(map, store, geolocation));

  const positionFeature = new Feature();
  positionFeature.setStyle(
    new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({
          color: '#0000dc',
        }),
        stroke: new Stroke({
          color: 'rgba(0,39,118,0.25)',
          width: 30,
        }),
      }),
    })
  );

  geolocation.on('change:position', () =>
    handlePositionChange(geolocation, positionFeature)
  );

  const layer = new VectorLayer({
    source: new VectorSource({
      features: [positionFeature],
    }),
  });

  map.addLayer(layer);
  return result;
};
