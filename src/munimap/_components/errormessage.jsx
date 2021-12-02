import * as actions from '../redux/action.js';
import * as slctr from '../redux/selector.js';
import PropTypes from 'prop-types';
import React, {useLayoutEffect, useRef} from 'react';
import {ENABLE_EFFECT_LOGS, ENABLE_RENDER_LOGS} from '../conf.js';
import {createInnerText, getErrorMessageStyle} from '../ui/interaction.js';
import {hot} from 'react-hot-loader';
import {useDispatch, useSelector} from 'react-redux';

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
        actions.target_wheeled({
          render: document.activeElement === errElRef.current ? false : true,
          withMessage: true,
        })
      );
    }
  };

  const onTouchMove = () => {
    if (shouldBlockMap && render !== false) {
      dispatch(
        actions.target_touchmoved({
          render: document.activeElement === errElRef.current ? false : true,
          withMessage: true,
        })
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
