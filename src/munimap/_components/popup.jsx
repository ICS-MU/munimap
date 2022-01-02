import * as actions from '../redux/action.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_range from '../utils/range.js';
import MapContext from '../_contexts/mapcontext.jsx';
import React, {useContext, useEffect, useLayoutEffect, useRef} from 'react';
import {
  ENABLE_EFFECT_LOGS,
  ENABLE_RENDER_LOGS,
  IDOS_URL,
  POPUP_TALE_HEIGHT,
  POPUP_TALE_INDENT,
} from '../conf.js';
import {
  getCenter,
  getLang,
  getPopup,
  getResolution,
  getRotation,
  getSize,
} from '../redux/selector.js';
import {getElementSize} from '../utils/dom.js';
import {getPixelFromCoordinate} from '../utils/map.js';
import {hot} from 'react-hot-loader';
import {unlistenByKey} from 'ol/events';
import {useDispatch, useSelector} from 'react-redux';
import {wrapText} from '../style/style.js';

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
  const {positionInCoords, offsetX, offsetY, content, hideResolution, visible} =
    useSelector(getPopup);
  const resolution = useSelector(getResolution);
  const size = useSelector(getSize);
  const rotation = useSelector(getRotation);
  const center = useSelector(getCenter);
  const lang = useSelector(getLang);
  const dispatch = useDispatch();

  const popupElRef = useRef(null);
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
      if (!munimap_range.contains(hideResolution, resolution)) {
        closePopup();
      }
    }
  }, [hideResolution, resolution]);

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
      <div className="munimap-content">
        {content &&
          content.map(({title, text, textUrl, titleUrl, pubTran}, idx) => {
            const _title = pubTran ? pubTran : title && wrapText(title);
            let textComp;
            if (pubTran) {
              const fromQuery = new URLSearchParams(`?t=${pubTran}`);
              const toQuery = new URLSearchParams(`?f=${pubTran}`);
              textComp = (
                <div>
                  {`${munimap_lang.getMsg(
                    munimap_lang.Translations.FIND_CONNECTION,
                    lang
                  )}: `}
                  <a
                    href={`${IDOS_URL}?${fromQuery.toString()}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {munimap_lang.getMsg(
                      munimap_lang.Translations.CONNECTION_TO,
                      lang
                    )}
                  </a>
                  {' / '}
                  <a
                    href={`${IDOS_URL}?${toQuery.toString()}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {munimap_lang.getMsg(
                      munimap_lang.Translations.CONNECTION_FROM,
                      lang
                    )}
                  </a>
                </div>
              );
            } else {
              const _text = text.replace(/(?:\s)?,(?:\s)?/g, '\n');
              textComp = text && text.length > 0 && (
                <div className="munimap-bubble-text">
                  {textUrl ? (
                    <a href={textUrl} rel="noreferrer" target="_blank">
                      {_text}
                    </a>
                  ) : (
                    _text
                  )}
                </div>
              );
            }
            const titleComp = _title && _title.length > 0 && (
              <div
                className={pubTran ? 'munimap-title' : 'munimap-bubble-title'}
              >
                {titleUrl ? (
                  <a href={titleUrl} rel="noreferrer" target="_blank">
                    {_title}
                  </a>
                ) : (
                  _title
                )}
              </div>
            );

            return (
              <React.Fragment key={idx}>
                {titleComp}
                {textComp}
              </React.Fragment>
            );
          })}
      </div>
    </div>
  );
};

export default hot(module)(PopupComponent);
