import * as munimap_assert from '../assert/assert.js';
import * as ol_extent from 'ol/extent';
import * as ol_proj from 'ol/proj';
import View from 'ol/View';
import {TARGET_ELEMENTS_STORE} from '../constants.js';
import {ofFeatures as extentOfFeatures} from '../utils/extent.js';
import {getBuildingForFictive} from '../source/source.js';

/**
 * @typedef {import("ol/size").Size} ol.Size
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol").View} ol.View
 */

/**
 * @typedef {Object} InitExtentOptions
 * @property {ol.extent.Extent|undefined} extent extent
 * @property {ol.Size} size size
 * @property {ol.coordinate.Coordinate|undefined} center center
 * @property {number|undefined} zoom zoom
 * @property {number|undefined} resolution resolution
 */

/**
 * @param {string} targetId targetId
 * @param {ol.coordinate.Coordinate} requiredCenter required center
 * @param {number} requiredZoom required zoom
 * @param {Array<ol.Feature>} markers markers
 * @param {Array<ol.Feature>} zoomTo zoomTo
 * @return {ol.View} view
 */
const create = (targetId, requiredCenter, requiredZoom, markers, zoomTo) => {
  const target = TARGET_ELEMENTS_STORE[targetId];
  const center = ol_proj.transform(
    requiredCenter || [16.605390495656977, 49.1986567194723],
    ol_proj.get('EPSG:4326'),
    ol_proj.get('EPSG:3857')
  );
  const zoom = requiredZoom === null ? 13 : requiredZoom;
  const view = new View({
    center: center,
    maxZoom: 23,
    minZoom: 0,
    zoom: zoom,
    constrainResolution: true,
  });
  const initExtentOpts = /**@type {InitExtentOptions}*/ ({});
  if (zoomTo || markers) {
    zoomTo = zoomTo.length ? zoomTo : markers;
    if (zoomTo.length) {
      let res;
      const extent = extentOfFeatures(zoomTo, targetId, getBuildingForFictive);
      if (requiredZoom === null && requiredCenter === null) {
        if (target.offsetWidth === 0 || target.offsetHeight === 0) {
          view.fit(extent);
        } else {
          view.fit(extent, {
            size: [target.offsetWidth, target.offsetHeight],
          });
          res = view.getResolution();
          munimap_assert.assert(res);
          ol_extent.buffer(extent, res * 30, extent);
          view.fit(extent, {
            size: [target.offsetWidth, target.offsetHeight],
          });
          initExtentOpts.extent = extent;
          initExtentOpts.size = [target.offsetWidth, target.offsetHeight];
        }
        /** constrainResolution not exists in OL6, */
        /** use view.getConstrainedResolution(resolution), */
        /** https://github.com/openlayers/openlayers/pull/9137 */
        // if (munimap.marker.custom.isCustom(zoomTo[0])) {
        //   if (view.getResolution() < munimap.floor.RESOLUTION.max) {
        //     res = view.constrainResolution(
        //       munimap.floor.RESOLUTION.max,
        //       undefined,
        //       1
        //     );
        //     initExtentOpts.resolution = res;
        //     view.setResolution(res);
        //   }
        // }
      } else if (requiredCenter === null) {
        initExtentOpts.center = ol_extent.getCenter(extent);
        view.setCenter(ol_extent.getCenter(extent));
      }
    } else {
      initExtentOpts.center = center;
      initExtentOpts.zoom = zoom;
    }
  }
  view.set('initExtentOpts', initExtentOpts, true);
  return view;
};

export {create};
