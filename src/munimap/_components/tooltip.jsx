import MapContext from '../_contexts/mapcontext.jsx';
import PropTypes from 'prop-types';
import React, {useContext, useLayoutEffect, useRef} from 'react';
import {
  getCenter,
  getResolution,
  getRotation,
  getSize,
} from '../redux/selector.js';
import {getElementSize} from '../utils/dom.js';
import {getPixelFromCoordinate} from '../utils/map.js';
import {hot} from 'react-hot-loader';
import {useSelector} from 'react-redux';

/**
 * @typedef {import("ol/pixel").Pixel} ol.pixel.Pixel
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("../view/tooltip.js").TooltipParams} TooltipParams
 */

/**
 * Update tooltip position.
 * @param {HTMLElement} element element
 * @param {ol.pixel.Pixel} centroidAsPixel pixel
 * @param {number} [offsetX] offsetX
 * @param {number} [offsetY] offsetY
 */
const updatePosition = (element, centroidAsPixel, offsetX = 0, offsetY = 2) => {
  if (!element || !centroidAsPixel) {
    return;
  }
  const popupSize = getElementSize(element);
  const x = Math.round(centroidAsPixel[0] + offsetX);
  const y = Math.round(centroidAsPixel[1] - (popupSize.height + offsetY));

  const transform = `translate(0%, 0%) translate(${x}px, ${y}px)`;
  element.style.transform = transform;
  // @ts-ignore IE9
  element.style.msTransform = transform;
};

/**
 * @type {React.FC<TooltipParams>}
 * @param {React.PropsWithChildren<TooltipParams>} props props
 * @return {React.ReactElement} React element
 */
const TooltipComponent = (props) => {
  const resolution = useSelector(getResolution);
  const size = useSelector(getSize);
  const rotation = useSelector(getRotation);
  const center = useSelector(getCenter);

  const {title, positionInCoords} = props;

  const tooltipElRef = useRef(null);
  const mapRef = useContext(MapContext);
  const map = mapRef && mapRef.current;

  useLayoutEffect(() => {
    if (map && tooltipElRef.current && positionInCoords) {
      const centroidAsPixel = getPixelFromCoordinate(positionInCoords, {
        size,
        resolution,
        rotation,
        center,
      });
      updatePosition(tooltipElRef.current, centroidAsPixel);
    }
  }, [map, positionInCoords, size, resolution, rotation, center]);

  return (
    <div
      className="munimap-tooltip"
      ref={tooltipElRef}
      style={{display: positionInCoords ? '' : 'none'}}
    >
      <div className="munimap-tooltip-text">{title}</div>
    </div>
  );
};

TooltipComponent.propTypes = {
  title: PropTypes.string.isRequired,
  positionInCoords: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default hot(module)(TooltipComponent);
