import * as mm_lang from '../lang.js';
import * as slctr from '../redux/selector/selector.js';
import {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';

/**
 * @type {React.FC}
 * @param {React.PropsWithChildren<{}>} props props
 * @return {React.ReactElement} React element
 */
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
          ' position: relative; top: 0; left: 0; width: 100%;' +
          ' height: 100%; text-align: center; z-index: 1;'
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
            {mm_lang.getMsg(mm_lang.Translations.LOADING_MAP, lang)}
          </p>
        </div>
      </div>
    </>
  );
};

export default LoadingMessageComponent;
