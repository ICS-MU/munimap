import * as munimap_lang from '../lang/lang.js';
import * as slctr from '../redux/selector.js';
import React, {useEffect, useRef} from 'react';
import {ENABLE_EFFECT_LOGS, ENABLE_RENDER_LOGS} from '../conf.js';
import {hot} from 'react-hot-loader';
import {useSelector} from 'react-redux';

/**
 * @type {React.FC}
 * @param {React.PropsWithChildren<{}>} props props
 * @return {React.ReactElement} React element
 */
const LoadingMessageComponent = (props) => {
  const targetId = useSelector(slctr.getTargetId);
  const lang = useSelector(slctr.getLang);
  const addMsg = useSelector(slctr.toggleLoadingMessage);

  const msgEl = useRef(null);
  const innerEl = useRef(null);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## LOADINGMESSAGE-useEffect-depListeners');
    }
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

  if (ENABLE_RENDER_LOGS) {
    console.log('########## LOADINGMESSAGE-render');
  }

  if (addMsg) {
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
  }
  return null;
};

export default hot(module)(LoadingMessageComponent);
