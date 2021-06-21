/* eslint-disable sort-imports-es6-autofix/sort-imports-es6 */
import 'ol/ol.css';
import '../css/munimaplib.css'; //must be after ol.css => rewrite some rules
import './google.png';
import './seznam.png';
import create from './create.js';
import reset from './reset.js';
import {Map, View} from 'ol';

// Example how to "export" openlayers classes
// They will be accessible as munimap.ol.Map, munimap.ol.View including all their methods
const ol = {
  Map,
  View,
};

export {create, reset, ol};
