/* eslint-disable no-console */
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import {Map, View} from 'ol';
import {fromLonLat} from 'ol/proj';

export default (opts) => {
  console.log('munimap.create', opts);
  return new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: fromLonLat([14.44, 50.07]),
      zoom: 4,
    }),
  });
};
