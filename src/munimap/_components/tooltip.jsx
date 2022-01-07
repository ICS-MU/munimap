import MapContext from '../_contexts/mapcontext.jsx';
import React, {useContext, useLayoutEffect, useRef} from 'react';
import {ENABLE_EFFECT_LOGS, ENABLE_RENDER_LOGS} from '../conf.js';
import {
  getCenter,
  getResolution,
  getRotation,
  getSize,
  getTooltip,
} from '../redux/selector.js';
import {getElementSize} from '../utils/dom.js';
import {getPixelFromCoordinate} from '../utils/map.js';
import {hot} from 'react-hot-loader';
import {useSelector} from 'react-redux';

/**
 * @typedef {import("ol/pixel").Pixel} ol.pixel.Pixel
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
 * @type {React.FC}
 * @param {React.PropsWithChildren<{}>} props props
 * @return {React.ReactElement} React element
 */
const TooltipComponent = (props) => {
  const resolution = useSelector(getResolution);
  const size = useSelector(getSize);
  const rotation = useSelector(getRotation);
  const center = useSelector(getCenter);
  const {title, positionInCoords} = useSelector(getTooltip);

  const tooltipElRef = useRef(null);
  const mapRef = useContext(MapContext);
  const map = mapRef && mapRef.current;

  useLayoutEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## TOOLTIP-useLayoutEffect-position');
    }
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

  if (ENABLE_RENDER_LOGS) {
    console.log('########## TOOLTIP-render');
  }

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

export default hot(module)(TooltipComponent);
