/* eslint-disable sort-imports-es6-autofix/sort-imports-es6 */
/**
 * @module index
 */

//polyfills for IE11
import 'whatwg-fetch';

import 'ol/ol.css';
import '../css/munimaplib.css'; //must be after ol.css => rewrite some rules
import * as munimap_matomo from './matomo/matomo.js';
import create from './create.js';
import reset from './reset.js';
import {Map, View, Feature} from 'ol';
import {Point} from 'ol/geom';
import {Tile} from 'ol/layer';
import {Vector} from 'ol/layer';
import {Attribution, Control, FullScreen, Zoom} from 'ol/control';

import '../img/google.png';
import '../img/seznam.png';
import '../img/marker.style.coridors.bg.png';
import '../img/room.style.coridors.bg.png';

munimap_matomo.init();

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
};

export {create, reset, ol};
