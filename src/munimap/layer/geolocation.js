/**
 * @module layer/geolocate
 */

import EnhancedVectorSource from '../source/vector.js';
import Feature from 'ol/Feature.js';
import VectorLayer from 'ol/layer/Vector.js';
import {Circle, Fill, Stroke, Style} from 'ol/style.js';
import {GEOLOCATION_LAYER_ID} from './constants.js';

/**
 * @typedef {import("ol/layer/Base").default} ol.layer.Base
 */

/**
 * @param {ol.layer.Base} layer layer
 * @return {boolean} isLayer
 */
const isLayer = (layer) => {
  return layer.get('id') === GEOLOCATION_LAYER_ID;
};

/**
 * @return {VectorLayer} layer
 */
const create = () => {
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

  const layer = new VectorLayer({
    source: new EnhancedVectorSource({
      features: [positionFeature],
    }),
  });
  layer.set('id', GEOLOCATION_LAYER_ID);
  return layer;
};

export {create, isLayer};
