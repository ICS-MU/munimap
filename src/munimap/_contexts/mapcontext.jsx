import {createContext} from 'react';

/**
 * @typedef {import("ol").Map} ol.Map
 */

/**
 * @type {React.Context<React.MutableRefObject<ol.Map>>}
 */
const MapContext = createContext(null);

export default MapContext;
