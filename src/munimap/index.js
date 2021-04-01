import 'ol/ol.css';
import create from "./create"
import reset from "./reset"
import {Map, View} from 'ol';

// Example how to "export" openlayers classes
// They will be accessible as munimap.ol.Map, munimap.ol.View including all their methods
const ol = {
  Map,
  View,
};

export {create, reset, ol};
