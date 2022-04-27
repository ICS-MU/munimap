/* eslint-disable sort-imports-es6-autofix/sort-imports-es6 */
/**
 * @module index
 */

//polyfills for IE11
import 'whatwg-fetch';

import 'ol/ol.css';
import '../css/munimaplib.css'; //must be after ol.css => rewrite some rules

import * as mm_matomo from './matomo.js';
import VectorSource from 'ol/source/Vector';
import create from './create.js';
import reset from './reset.js';
import {Attribution, Control, FullScreen, Zoom} from 'ol/control';
import {Feature, Map, View} from 'ol';
import {Point} from 'ol/geom';
import {Stroke, Style} from 'ol/style';
import {Tile} from 'ol/layer';
import {Vector} from 'ol/layer';
import {createSelector} from 'reselect';
import {createXYZ} from 'ol/tilegrid';
import {featuresForMap} from './load.js';
import {
  getActiveFloorCodes,
  getSelectedFloorCode,
} from './redux/selector/selector.js';
import {getNotYetAddedFeatures} from './utils/store.js';
import {getStoreByTargetId} from './constants.js';
import {tile} from 'ol/loadingstrategy';

import '../img/google.png';
import '../img/seznam.png';
import '../img/marker.style.coridors.bg.png';
import '../img/room.style.coridors.bg.png';

mm_matomo.init();

// Example how to "export" openlayers classes
// They will be accessible as munimap.ol.Map, munimap.ol.View including all their methods
const ol = {
  Map,
  View,
  Feature,
  geom: {
    Point,
  },
  layer: {
    Tile,
    Vector,
  },
  control: {
    Attribution,
    Control,
    FullScreen,
    Zoom,
  },
  source: {
    Vector: VectorSource,
  },
  loadingstrategy: {
    tile,
  },
  tilegrid: {
    createXYZ,
  },
  style: {
    Stroke,
    Style,
  },
};

const slctr = {
  createSelector,
  getActiveFloorCodes,
  getSelectedFloorCode,
};

const load = {
  featuresForMap,
};

const store = {
  getNotYetAddedFeatures,
};

//legacy export as global ol
if (!window.hasOwnProperty('ol')) {
  window['ol'] = ol;
} else {
  mm_matomo.sendEvent('alreadyHasOl', 'true');
  throw new Error(
    'Window already has property `ol`, cannot initialize munimap.'
  );
}

export {create, reset, ol, slctr, load, store, getStoreByTargetId};
