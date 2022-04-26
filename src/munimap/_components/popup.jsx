import * as actions from '../redux/action.js';
import * as mm_range from '../utils/range.js';
import * as slctr from '../redux/selector.js';
import MapContext from '../_contexts/mapcontext.jsx';
import React, {useContext, useEffect, useLayoutEffect, useRef} from 'react';
import sanitizeHtml from 'sanitize-html';
import {ENABLE_EFFECT_LOGS, ENABLE_RENDER_LOGS} from '../conf.js';
import {POPUP_TALE_HEIGHT, POPUP_TALE_INDENT} from '../view/constants.js';
import {getElementSize} from '../utils/dom.js';
import {getPixelFromCoordinate} from '../utils/map.js';
import {hot} from 'react-hot-loader';
import {unlistenByKey} from 'ol/events';
import {useDispatch, useSelector} from 'react-redux';

/**
 * @typedef {import("ol/pixel").Pixel} ol.pixel.Pixel
 */

/**
 * Update popup position.
 * @param {HTMLElement} element element
 * @param {ol.pixel.Pixel} centroidAsPixel pixel
 * @param {number} offsetX offsetX
 * @param {number} offsetY offsetY
 */
const updatePosition = (element, centroidAsPixel, offsetX, offsetY) => {
  if (!element || !centroidAsPixel) {
    return;
  }
  const popupSize = getElementSize(element);
  const offX = -POPUP_TALE_INDENT + offsetX;
  const offY = -(popupSize.height + POPUP_TALE_HEIGHT + offsetY);
  const x = Math.round(centroidAsPixel[0] + offX);
  const y = Math.round(centroidAsPixel[1] + offY);

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
const PopupComponent = (props) => {
  const resolution = useSelector(slctr.getResolution);
  const size = useSelector(slctr.getSize);
  const rotation = useSelector(slctr.getRotation);
  const center = useSelector(slctr.getCenter);
  const dispatch = useDispatch();

  const positionInCoords = useSelector(slctr.getPopupPositionInCoords);
  const content = useSelector(slctr.getPopupContent);
  const hideResolution = useSelector(slctr.getHideResolutionForPopup);
  const visible = useSelector(slctr.isPopupVisible);
  const [offsetX, offsetY] = useSelector(slctr.getOffsetForPopup);

  const popupElRef = useRef(null);
  const popupContentElRef = useRef(null);
  const mapRef = useContext(MapContext);
  const map = mapRef && mapRef.current;

  const closePopup = React.useCallback(() => {
    dispatch(actions.popupClosed());
  }, []);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## POPUP-useEffect-hideResolution');
    }
    if (hideResolution && resolution) {
      if (!mm_range.contains(hideResolution, resolution)) {
        closePopup();
      }
    }
  }, [hideResolution, resolution]);

  useLayoutEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## POPUP-useEffect-content');
    }
    if (map && popupContentElRef.current) {
      popupContentElRef.current.innerHTML = sanitizeHtml(content, {
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          '*': ['id', 'class', 'style'],
        },
      });
      return () => {
        popupContentElRef.current.innerHTML = '';
      };
    }
  }, [map, content]);

  useLayoutEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## POPUP-useLayoutEffect-position');
    }
    if (map && popupElRef.current && positionInCoords) {
      const centroidAsPixel = getPixelFromCoordinate(positionInCoords, {
        size,
        resolution,
        rotation,
        center,
      });
      updatePosition(popupElRef.current, centroidAsPixel, offsetX, offsetY);

      const k = map.on('postrender', (e) => {
        updatePosition(
          popupElRef.current,
          e.map.getPixelFromCoordinate(positionInCoords),
          offsetX,
          offsetY
        );
      });
      return () => unlistenByKey(k);
    }
  }, [map, positionInCoords, offsetX, offsetY]);

  if (ENABLE_RENDER_LOGS) {
    console.log('########## POPUP-render');
  }

  return (
    <div
      className="ol-popup munimap-info munimap-info-bubble"
      ref={popupElRef}
      style={{
        display: visible ? '' : 'none',
      }}
    >
      <div className="munimap-close-button" onClick={closePopup}></div>
      <div className="munimap-content" ref={popupContentElRef}></div>
    </div>
  );
};

export default hot(module)(PopupComponent);
