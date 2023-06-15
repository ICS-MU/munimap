import * as mm_utils from '../utils/utils.js';
import * as ol_extent from 'ol/extent.js';
import * as slctr from '../redux/selector/selector.js';
import MapContext from '../contexts/mapcontext.jsx';
import Select from './select.jsx';
import {GeoJSON} from 'ol/format.js';
import {POPUP_TALE_HEIGHT, POPUP_TALE_INDENT} from '../view/constants.js';
import {featureExtentIntersect} from '../utils/geom.js';
import {sort as floorSortFn} from '../feature/floor.js';
import {getByCode as getBuildingByCode} from '../feature/building.js';
import {getElementSize} from '../utils/dom.js';
import {getPixelFromCoordinate} from '../utils/map.js';
import {useContext, useLayoutEffect, useRef} from 'react';
import {useSelector} from 'react-redux';

/**
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("../conf.js").State} State
 */

/**
 * @typedef {object} InfoPositionOptions
 * @property {string} targetId targetId
 * @property {ol.extent.Extent} [extent] extent
 * @property {number} [resolution] resolution
 * @property {string} [selectedFeature] selectedFeature
 */

/**
 * @typedef {object} PopupPositionOptions
 * @property {boolean} hideTale hide tale
 * @property {Array<number>} [coordinate] coordinate
 * @property {Array<number>} [position] coordinate
 */

/**
 * Get infobox position.
 * @param {HTMLElement} infoEl info element
 * @param {InfoPositionOptions} options options
 * @return {PopupPositionOptions} position
 */
const getInfoBoxPosition = (infoEl, options) => {
  const {targetId, extent, resolution, selectedFeature} = options;
  if (!extent || !selectedFeature || !resolution) {
    return;
  }
  const building = getBuildingByCode(targetId, selectedFeature);
  const topRight = ol_extent.getTopRight(extent);
  const elSize = getElementSize(infoEl);
  const extWidth = resolution * elSize.width;
  const extHeight = resolution * (elSize.height + POPUP_TALE_HEIGHT);

  const elExtent = /**@type {ol.extent.Extent}*/ ([
    topRight[0] - extWidth,
    topRight[1] - extHeight,
    topRight[0],
    topRight[1],
  ]);
  const result = {};
  const bldgGeom = building.getGeometry();
  if (!bldgGeom.intersectsExtent(elExtent)) {
    const bottomLeft = ol_extent.getBottomLeft(extent);
    const reducedViewExt = /**@type {ol.extent.Extent}*/ ([
      bottomLeft[0],
      bottomLeft[1],
      topRight[0] - extWidth,
      topRight[1] - extHeight,
    ]);
    const format = new GeoJSON();
    let intersect = featureExtentIntersect(building, reducedViewExt, format);
    if (mm_utils.isDefAndNotNull(intersect) && !!intersect.getGeometry()) {
      const closestPoint = intersect.getGeometry().getClosestPoint(topRight);
      result.coordinate = [closestPoint[0], closestPoint[1] + extHeight];
      result.hideTale = false;
    } else {
      intersect = featureExtentIntersect(building, extent, format);
      if (mm_utils.isDefAndNotNull(intersect) && !!intersect.getGeometry()) {
        const bbox = intersect.getGeometry().getExtent();
        const topLeft = ol_extent.getTopLeft(extent);
        const upperExt = /**@type {ol.extent.Extent}*/ ([
          topLeft[0],
          topLeft[1] - extHeight,
          topRight[0],
          topRight[1],
        ]);
        if (bldgGeom.intersectsExtent(upperExt)) {
          result.coordinate = [bbox[2], topRight[1]];
        } else {
          result.coordinate = [topRight[0] - extWidth, bbox[3] + extHeight];
        }
      }
      result.hideTale = true;
    }
  }

  if (!result.coordinate) {
    const parentEl = infoEl.parentElement;
    result.position = [parentEl.offsetWidth - elSize.width, 0];
    result.hideTale = true;
  }

  return result;
};

/**
 * @type {React.FC}
 * @param {React.PropsWithChildren<{}>} props props
 * @return {React.ReactElement} React element
 */
const InfoBubbleComponent = (props) => {
  const showInfoEl = useSelector(slctr.showInfoEl);
  const floors = useSelector(slctr.getFloorsByBuildingCode);
  const extent = useSelector(slctr.getExtent);
  const resolution = useSelector(slctr.getResolution);
  const rotation = useSelector(slctr.getRotation);
  const size = useSelector(slctr.getSize);
  const center = useSelector(slctr.getCenter);
  const selectedFeature = useSelector(slctr.getSelectedFeature);
  const {bldgTitle, complexTitle} = useSelector(slctr.getBuildingTitle);
  const targetId = useSelector(slctr.getTargetId);

  const mapRef = useContext(MapContext);
  const map = mapRef && mapRef.current;

  if (floors.length > 0) {
    floors.sort(floorSortFn);
  }

  const bubbleRef = useRef(null);
  useLayoutEffect(() => {
    if (map && bubbleRef.current) {
      const opts = {extent, resolution, selectedFeature, targetId};
      const positionInfo = getInfoBoxPosition(bubbleRef.current, opts);
      if (positionInfo) {
        const position = positionInfo.coordinate
          ? getPixelFromCoordinate(positionInfo.coordinate, {
              size,
              resolution,
              rotation,
              center,
            })
          : positionInfo.position;

        if (position && position.length > 0) {
          const left = !positionInfo.hideTale
            ? (position[0] -= POPUP_TALE_INDENT)
            : position[0];
          const top = position[1];
          bubbleRef.current.style.left = left + 'px';
          bubbleRef.current.style.top = top + 'px';
          positionInfo.hideTale
            ? bubbleRef.current.classList.add('munimap-hide-tale')
            : bubbleRef.current.classList.remove('munimap-hide-tale');
        }
      }
    }
  }, [map, extent, resolution, selectedFeature, size, rotation, center]);

  return (
    <div
      className="ol-popup munimap-info"
      style={{zIndex: '2', display: showInfoEl ? '' : 'none'}}
      ref={bubbleRef}
    >
      <div className="munimap-complex">{complexTitle}</div>
      <div className="munimap-building">{bldgTitle}</div>
      <div className="munimap-floor">
        <div className="munimap-floor-select">
          <Select floors={floors} />
        </div>
      </div>
    </div>
  );
};

InfoBubbleComponent.displayName = 'InfoBubbleComponent';

export default InfoBubbleComponent;
