/**
 * @module style/poi
 */

import * as munimap_range from '../utils/range.js';
import {Circle, Fill, Stroke, Style, Text} from 'ol/style';
import {RESOLUTION as FLOOR_RESOLUTION} from '../feature/floor.js';
import {PURPOSE} from '../feature/poi.js';
import {getByCode as getBuildingByCode} from '../feature/building.js';

/**
 * @typedef {import('../utils/range.js').RangeInterface} RangeInterface
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("ol/render/Feature").default} ol.render.Feature
 */

/**
 * @enum {RangeInterface}
 * @const
 */
const Resolutions = {
  INFORMATION: FLOOR_RESOLUTION,
  STAIRS: munimap_range.createResolution(0, 0.15),
  TOILET: munimap_range.createResolution(0, 0.13),
  BUILDING_ENTRANCE: munimap_range.createResolution(0, 1.19),
};

/**
 * @type {number}
 */
const RADIUS = 7;

/**
 * @type {Fill}
 */
const FILL = new Fill({
  color: [255, 255, 255, 1],
});

/**
 * @type {Stroke}
 */
const STROKE = new Stroke({
  color: [0, 0, 0, 1],
  width: 1.2,
});

/**
 * @type {Style}
 * @const
 */
const STYLE = new Style({
  image: new Circle({
    radius: RADIUS,
    fill: FILL,
    stroke: STROKE,
  }),
});

/**
 * Get style.
 * @return {Style} style
 */
const getStyle = () => STYLE;

/**
 * @type {number}
 * @const
 */
const ICON_HEIGHT = 24;

/**
 * @type {Style}
 * @const
 */
const BACKGROUND_SQUARE = new Style({
  text: new Text({
    text: '\uf0c8',
    font: `normal ${ICON_HEIGHT}px MunimapFont`,
    fill: new Fill({
      color: '#666',
    }),
  }),
});

/**
 * @type {Style}
 * @const
 */
const BACKGROUND_SQUARE_GREEN = new Style({
  text: new Text({
    text: '\uf0c8',
    font: `normal ${ICON_HEIGHT}px MunimapFont`,
    fill: new Fill({
      color: 'green',
    }),
  }),
});

/**
 * @type {Style}
 * @const
 */
const BACKGROUND_SQUARE_GREEN_BIG = new Style({
  text: new Text({
    text: '\uf0c8',
    font: 'normal 30px MunimapFont',
    fill: new Fill({
      color: 'green',
    }),
  }),
});

/**
 * @type {Array<Style>}
 */
const ELEVATOR = [
  BACKGROUND_SQUARE,
  new Style({
    text: new Text({
      text: '\uf183\uf07d',
      font: 'normal 16px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 * @const
 */
const ENTRANCE = [
  BACKGROUND_SQUARE_GREEN,
  new Style({
    text: new Text({
      text: '\uf090',
      font: 'normal 16px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 * @const
 */
const COMPLEX_ENTRANCE = [
  BACKGROUND_SQUARE_GREEN_BIG,
  new Style({
    text: new Text({
      text: '\uf090',
      font: 'normal 20px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 * @const
 */
const BUILDING_COMPLEX_ENTRANCE = [
  BACKGROUND_SQUARE_GREEN_BIG,
  new Style({
    text: new Text({
      text: '\uf090',
      font: 'normal 20px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 */
const INFORMATION = [
  BACKGROUND_SQUARE,
  new Style({
    text: new Text({
      text: '\uf129',
      offsetY: 1,
      font: 'normal 18px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 */
const TOILET = [
  BACKGROUND_SQUARE,
  new Style({
    text: new Text({
      text: '\uf182\uf183',
      font: 'normal 14px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 */
const TOILET_IM = [
  BACKGROUND_SQUARE,
  new Style({
    text: new Text({
      text: '\uf193',
      font: 'bold 16px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 */
const TOILET_M = [
  BACKGROUND_SQUARE,
  new Style({
    text: new Text({
      text: '\uf183',
      font: 'normal 18px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * @type {Array<Style>}
 */
const TOILET_W = [
  BACKGROUND_SQUARE,
  new Style({
    text: new Text({
      text: '\uf182',
      font: 'normal 18px MunimapFont',
      fill: new Fill({
        color: 'white',
      }),
    }),
  }),
];

/**
 * Style function.
 *
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @return {Style|Array<Style>} style
 */
const activeStyleFunction = (feature, resolution) => {
  let result = /** @type {Style|Array<Style>} */ (getStyle());
  const poiType = feature.get('typ');
  const showInfo = munimap_range.contains(Resolutions.INFORMATION, resolution);
  const showToilets = munimap_range.contains(Resolutions.TOILET, resolution);
  const showStairs = munimap_range.contains(Resolutions.STAIRS, resolution);
  switch (poiType) {
    case PURPOSE.INFORMATION_POINT:
      result = showInfo ? INFORMATION : null;
      break;
    case PURPOSE.ELEVATOR:
      result = showStairs ? ELEVATOR : null;
      break;
    case PURPOSE.BUILDING_ENTRANCE:
      result = ENTRANCE;
      break;
    case PURPOSE.BUILDING_COMPLEX_ENTRANCE:
      result = BUILDING_COMPLEX_ENTRANCE;
      break;
    case PURPOSE.TOILET_IMMOBILE:
      result = showToilets ? TOILET_IM : null;
      break;
    case PURPOSE.TOILET_MEN:
      result = showToilets ? TOILET_M : null;
      break;
    case PURPOSE.TOILET_WOMEN:
      result = showToilets ? TOILET_W : null;
      break;
    case PURPOSE.TOILET:
      result = showToilets ? TOILET : null;
      break;
    case PURPOSE.CLASSROOM:
      result = null;
      break;
    default:
      result = null;
  }
  return result;
};

/**
 * Style function.
 *
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @return {Style|Array<Style>} style
 */
const defaultStyleFunction = (feature, resolution) => {
  const poiType = feature.get('typ');
  let result = null;
  switch (poiType) {
    case PURPOSE.COMPLEX_ENTRANCE:
    case PURPOSE.BUILDING_COMPLEX_ENTRANCE:
      result = COMPLEX_ENTRANCE;
      break;
    case PURPOSE.BUILDING_ENTRANCE:
      result = ENTRANCE;
      break;
    default:
      result = null;
  }
  return result;
};

/**
 * Style function.
 *
 * @param {ol.Feature|ol.render.Feature} feature feature
 * @param {number} resolution resolution
 * @param {string} selectedFeature selected feature
 * @param {string} targetId targetId
 * @return {Style|Array<Style>} style
 */
const outdoorStyleFunction = (
  feature,
  resolution,
  selectedFeature,
  targetId
) => {
  const poiType = feature.get('typ');
  let result = null;
  let showEntrance = false;
  switch (poiType) {
    case PURPOSE.COMPLEX_ENTRANCE:
      result = COMPLEX_ENTRANCE;
      break;
    case PURPOSE.BUILDING_COMPLEX_ENTRANCE:
      const floorCode = /**@type {string}*/ (feature.get('polohKodPodlazi'));
      const selectedFloor =
        selectedFeature && selectedFeature.length === 8
          ? selectedFeature
          : null;
      const selectedBuildingCode =
        selectedFeature && selectedFeature.length >= 5
          ? selectedFeature.substring(0, 5)
          : '';
      const building = getBuildingByCode(targetId, floorCode.substring(0, 5));
      if (building) {
        //some buildings not loaded when outdoorFunction is called;
        //building with active floor (where entrances should be added)
        //is already loaded

        const defaultFloorCode = /**@type {string}*/ (
          building.get('vychoziPodlazi')
        );
        showEntrance =
          !floorCode.startsWith(selectedBuildingCode) ||
          !munimap_range.contains(FLOOR_RESOLUTION, resolution) ||
          (selectedFloor && selectedFloor === defaultFloorCode);
        result = showEntrance ? BUILDING_COMPLEX_ENTRANCE : null;
      }
      break;
    case PURPOSE.BUILDING_ENTRANCE:
      showEntrance =
        !munimap_range.contains(FLOOR_RESOLUTION, resolution) &&
        munimap_range.contains(Resolutions.BUILDING_ENTRANCE, resolution);
      result = showEntrance ? ENTRANCE : null;
      break;
    default:
      break;
  }
  return result;
};

export {
  ICON_HEIGHT,
  Resolutions,
  activeStyleFunction,
  defaultStyleFunction,
  getStyle,
  outdoorStyleFunction,
};
