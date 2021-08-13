/**
 * @module style/basemap
 */

import {BASEMAPS} from '../layer/basemap.js';
import {RESOLUTION_COLOR} from './style.js';
import {isUserAgentIE} from '../utils/utils.js';

/**
 * @typedef {import("ol/layer/Tile").default} ol.layer.Tile
 */

/**
 * @param {ol.layer.Tile} raster raster
 * @param {string} baseMap options
 */
const setStyle = (raster, baseMap) => {
  raster.on('prerender', (evt) => {
    const ctx = evt.context;
    ctx.fillStyle = '#dddddd';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    //set opacity of the layer according to current resolution
    const resolution = evt.frameState.viewState.resolution;
    const resColor = RESOLUTION_COLOR.find((obj, i, arr) => {
      return resolution > obj.resolution || i === arr.length - 1;
    });
    raster.setOpacity(resColor.opacity);
  });
  if (
    (baseMap === BASEMAPS.OSM_BW || baseMap === BASEMAPS.ARCGIS_BW) &&
    !isUserAgentIE()
  ) {
    raster.on('postrender', (evt) => {
      const ctx = evt.context;
      ctx.globalCompositeOperation = 'color';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = '#000000';
      ctx.globalCompositeOperation = 'source-over';
    });
  }
};

export {setStyle};
