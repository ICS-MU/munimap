import * as actions from '../redux/action.js';
import * as mm_lang from '../lang.js';
import * as slctr from '../redux/selector/selector.js';
import PropTypes from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import {useLayoutEffect, useRef} from 'react';

/**
 * @typedef {import("ol/Map").default} ol.Map
 */

/**
 * @typedef {object} InvalidCodeOptions
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
 * @param {Array<string>} noGeomCodes no geom codes
 * @param {boolean} simpleScroll simple scroll
 * @param {string} lang language
 * @return {string|undefined} message
 */
const createInnerText = (invalidCodes, noGeomCodes, simpleScroll, lang) => {
  const hasInvalidCodes = invalidCodes && invalidCodes.length > 0;
  const hasNoGeomCodes = noGeomCodes && noGeomCodes.length > 0;
  const shouldBlockMap = !simpleScroll;
  let msg;
  if (hasInvalidCodes) {
    msg =
      mm_lang.getMsg(mm_lang.Translations.ACTIVATE_MAP, lang) +
      '\n' +
      mm_lang.getMsg(mm_lang.Translations.NOT_FOUND, lang) +
      ':\n' +
      invalidCodes.join(', ');
  } else if (shouldBlockMap || hasNoGeomCodes) {
    msg = mm_lang.getMsg(mm_lang.Translations.ACTIVATE_MAP, lang);
  }

  if (hasNoGeomCodes) {
    msg = msg ? msg + '\n' : '';
    msg +=
      mm_lang.getMsg(mm_lang.Translations.NO_GEOMETRY, lang) +
      ': ' +
      noGeomCodes.join(', ');
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
  const invalidCodes = useSelector(slctr.getInvalidCodes);
  const noGeomCodes = useSelector(slctr.getNoGeomCodes);
  const simpleScroll = useSelector(slctr.getRequiredSimpleScroll);
  const errorMessage = useSelector(slctr.getErrorMessageState);
  const lang = useSelector(slctr.getLang);
  const dispatch = useDispatch();

  const hasInvalidCodes = invalidCodes && invalidCodes.length > 0;
  const hasNoGeomCodes = noGeomCodes && noGeomCodes.length > 0;
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

  const msg = createInnerText(invalidCodes, noGeomCodes, simpleScroll, lang);
  useLayoutEffect(() => {
    if (
      withMessage === true ||
      (hasInvalidCodes && withMessage === null) ||
      (hasNoGeomCodes && withMessage === null)
    ) {
      if (msg) {
        const {size, lineHeight} = getErrorMessageStyle(errElRef.current);
        msgElRef.current.innerText = msg;
        msgElRef.current.style.lineHeight = `${lineHeight}px`;
        msgElRef.current.style.fontSize = `${size}px`;
        errElRef.current.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      }
    }
  }, [withMessage, hasInvalidCodes, hasNoGeomCodes, msg]);

  if (
    (hasInvalidCodes || shouldBlockMap || hasNoGeomCodes) &&
    render !== false
  ) {
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
  return null;
};

ErrorMessageComponent.propTypes = {
  onClick: PropTypes.func,
};

export default ErrorMessageComponent;
