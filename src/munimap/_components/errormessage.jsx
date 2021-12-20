import * as actions from '../redux/action.js';
import * as munimap_lang from '../lang/lang.js';
import * as slctr from '../redux/selector.js';
import PropTypes from 'prop-types';
import React, {useLayoutEffect, useRef} from 'react';
import {ENABLE_EFFECT_LOGS, ENABLE_RENDER_LOGS} from '../conf.js';
import {hot} from 'react-hot-loader';
import {useDispatch, useSelector} from 'react-redux';

/**
 * @typedef {import("ol/Map").default} ol.Map
 */

/**
 * @typedef {Object} InvalidCodeOptions
 * @property {Array<string>} invalidCodes invalid codes
 * @property {string} lang language
 * @property {ol.Map} map map
 */

/**
 * @param {HTMLElement} errEl element
 * @return {{size: number, lineHeight: number}} result
 */
const getErrorMessageStyle = (errEl) => {
  const dpr = window.devicePixelRatio || 1;
  let size;
  let lineHeight;
  if (errEl.offsetWidth < 500) {
    size = 22 * dpr;
    lineHeight = 26 * dpr;
  } else {
    size = 30 * dpr;
    lineHeight = 35 * dpr;
  }
  return {size, lineHeight};
};

/**
 * @param {Array<string>} invalidCodes invalid codes
 * @param {boolean} simpleScroll simple scroll
 * @param {string} lang language
 * @return {string|undefined} message
 */
const createInnerText = (invalidCodes, simpleScroll, lang) => {
  const hasInvalidCodes = invalidCodes && invalidCodes.length > 0;
  const shouldBlockMap = !simpleScroll;
  let msg;
  if (hasInvalidCodes) {
    msg =
      munimap_lang.getMsg(munimap_lang.Translations.ACTIVATE_MAP, lang) +
      '\n' +
      munimap_lang.getMsg(munimap_lang.Translations.NOT_FOUND, lang) +
      ':\n' +
      invalidCodes.join(', ');
  } else if (shouldBlockMap) {
    msg = munimap_lang.getMsg(munimap_lang.Translations.ACTIVATE_MAP, lang);
  }
  return msg;
};

/**
 * @type {React.FC<{
 *  onClick: React.MouseEventHandler<HTMLDivElement>
 * }>}
 * @param {React.PropsWithChildren<{
 *  onClick: React.MouseEventHandler<HTMLDivElement>
 * }>} props props
 * @return {React.ReactElement} React element
 */
const ErrorMessageComponent = (props) => {
  const targetId = useSelector(slctr.getTargetId);
  const areMarkersLoaded = useSelector(slctr.areMarkersLoaded);
  const areZoomToLoaded = useSelector(slctr.areZoomToLoaded);
  const invalidCodes = useSelector(slctr.getInvalidCodes);
  const simpleScroll = useSelector(slctr.getRequiredSimpleScroll);
  const errorMessage = useSelector(slctr.getErrorMessageState);
  const lang = useSelector(slctr.getLang);
  const dispatch = useDispatch();

  const hasInvalidCodes = invalidCodes && invalidCodes.length > 0;
  const shouldBlockMap = !simpleScroll;
  const {render, withMessage} = errorMessage;

  const errElRef = useRef(null);
  const msgElRef = useRef(null);

  const onWheel = () => {
    if (shouldBlockMap && render !== false) {
      dispatch(
        actions.target_wheeled(document.activeElement !== errElRef.current)
      );
    }
  };

  const onTouchMove = () => {
    if (shouldBlockMap && render !== false) {
      dispatch(
        actions.target_touchmoved(document.activeElement !== errElRef.current)
      );
    }
  };

  const msg = createInnerText(invalidCodes, simpleScroll, lang);
  useLayoutEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## ERRORMSG-useLayoutEffect');
    }
    if (areMarkersLoaded && areZoomToLoaded) {
      if (withMessage === true || (hasInvalidCodes && withMessage === null)) {
        if (msg) {
          const {size, lineHeight} = getErrorMessageStyle(errElRef.current);
          msgElRef.current.innerText = msg;
          msgElRef.current.style.lineHeight = `${lineHeight}px`;
          msgElRef.current.style.fontSize = `${size}px`;
          errElRef.current.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        }
      }
    }
  }, [areMarkersLoaded, areZoomToLoaded, withMessage, hasInvalidCodes, msg]);

  if (ENABLE_RENDER_LOGS) {
    console.log('########## ERRORMSG-render');
  }

  if (areMarkersLoaded && areZoomToLoaded) {
    if ((hasInvalidCodes || shouldBlockMap) && render !== false) {
      return (
        <div
          id={`munimap-error_${targetId}`}
          className="munimap-error"
          onClick={props.onClick}
          ref={errElRef}
          onWheel={onWheel}
          onTouchMove={onTouchMove}
        >
          <div ref={msgElRef}></div>
        </div>
      );
    }
  }
  return null;
};

ErrorMessageComponent.propTypes = {
  onClick: PropTypes.func,
};

export default hot(module)(ErrorMessageComponent);
