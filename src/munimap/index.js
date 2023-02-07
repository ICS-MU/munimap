/**
 * @module index
 */

//polyfills
import 'whatwg-fetch';

import 'ol/ol.css';

import '../css/munimaplib.css'; //must be after ol.css => rewrite some rules

import * as mm_matomo from './matomo.js';
import * as ol_extent from 'ol/extent.js';
import ClusterSource from 'ol/source/Cluster.js';
import EnhancedVectorSource from './source/vector.js';
import VectorSource from 'ol/source/Vector.js';
import create from './create.js';
import reset from './reset.js';
import {Attribution, Control, FullScreen, Zoom} from 'ol/control.js';
import {Circle, Fill, Icon, Stroke, Style, Text} from 'ol/style.js';
import {EnhancedClusterSource} from './source/cluster.js';
import {Feature, Map, View} from 'ol';
import {GeoJSON, WKT} from 'ol/format.js';
import {Point} from 'ol/geom.js';
import {Tile, Vector} from 'ol/layer.js';
import {createSelector} from 'reselect';
import {createXYZ} from 'ol/tilegrid.js';
import {featuresForMap} from './load/load.js';
import {
  getActiveFloorCodes,
  getExtent,
  getSelectedFloorCode,
  isInFloorResolutionRange,
} from './redux/selector/selector.js';
import {getNotYetAddedFeatures} from './utils/store.js';
import {getStoreByTargetId} from './constants.js';
import {selected_feature_changed} from './redux/action.js';
import {tile} from 'ol/loadingstrategy.js';
import {unByKey} from 'ol/Observable.js';

import '../img/rectangle.png';
import '../img/rectangle_blue.png';
import '../img/rectangle_purple.png';
import '../img/triangle_cyan.png';
import '../img/triangle_orange.png';

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
  extent: {
    ...ol_extent,
  },
  source: {
    Cluster: ClusterSource,
    Vector: VectorSource,
    EnhancedCluster: EnhancedClusterSource,
    EnhancedVector: EnhancedVectorSource,
  },
  loadingstrategy: {
    tile,
  },
  tilegrid: {
    createXYZ,
  },
  style: {
    Circle,
    Fill,
    Icon,
    Stroke,
    Style,
    Text,
  },
  format: {
    GeoJSON,
    WKT,
  },
  Observable: {
    unByKey,
  },
};

const slctr = {
  createSelector,
  getActiveFloorCodes,
  getExtent,
  getSelectedFloorCode,
  isInFloorResolutionRange,
};

const action = {
  selected_feature_changed,
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

export {create, reset, ol, action, slctr, load, store, getStoreByTargetId};
