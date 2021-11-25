import * as munimap_lang from '../lang/lang.js';
import * as slctr from '../redux/selector.js';
import React, {useEffect, useRef} from 'react';
import ReactDOM from "react-dom";
import {hot} from 'react-hot-loader';
import {useSelector} from 'react-redux';

const LoadingMessageComponent = (props) => {
  const targetId = useSelector(slctr.getTargetId);
  const lang = useSelector(slctr.getLang);

  const msgEl = useRef(null);
  const innerEl = useRef(null);

  useEffect(() => {
    if (msgEl.current) {
      msgEl.current.setAttribute(
        'style',
        'color: #999; font-size: 30px;' +
          ' font-weight: bold; vertical-align: middle; ' +
          ' font-family: Arial, Helvetica, sans-serif; ' +
          ' position: absolute; top: 0; left: 0; width: 100%;' +
          ' height: 100%; text-align: center;'
      );
    }

    if (innerEl.current) {
      innerEl.current.setAttribute(
        'style',
        'display:inline-block; vertical-align: middle; position: relative;'
      );
    }
  }, []);

  return (
    <>
      <style id={`message_${targetId}_style`}>
        {`#message_${targetId}` +
          `:before {box-sizing: inherit; content: \'\'; ` +
          `display: inline-block; height: 100%; vertical-align: middle; ` +
          `margin-right: -0.25em;}`}
      </style>
      <div id={`message_${targetId}`} className="loading-message" ref={msgEl}>
        <div className="inner" ref={innerEl}>
          <p className="text">
            {munimap_lang.getMsg(munimap_lang.Translations.LOADING_MAP, lang)}
          </p>
        </div>
      </div>
    </>
  );
};

export default hot(module)(LoadingMessageComponent);
