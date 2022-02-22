import * as actions from '../../redux/action.js';
import * as munimap_lang from '../../lang/lang.js';
import * as slctr from '../../redux/selector.js';
import MapContext from '../../_contexts/mapcontext.jsx';
import React, {useContext, useEffect, useRef} from 'react';
import {Control} from 'ol/control';
import {ENABLE_EFFECT_LOGS, ENABLE_RENDER_LOGS} from '../../conf.js';
import {hot} from 'react-hot-loader';
import {useDispatch, useSelector} from 'react-redux';

/**
 * @type {string}
 * @const
 */
const RESET_CONTROL_ID = 'reset-identify';

/**
 * @type {React.FC}
 * @param {React.PropsWithChildren<{}>} props props
 * @return {React.ReactElement} React element
 */
const IdentifyComponent = (props) => {
  const enabled = useSelector(slctr.isIdentifyControlEnabled);
  const lang = useSelector(slctr.getLang);
  const dispatch = useDispatch();

  const mapRef = useContext(MapContext);
  const map = mapRef && mapRef.current;

  const resetElRef = useRef(null);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## IDENTIFY-useEffect-control');
    }
    let control;
    if (map && resetElRef.current) {
      control = new Control({
        element: resetElRef.current,
      });
      control.set('id', RESET_CONTROL_ID);
    }
    return () => {
      if (control) {
        control = undefined;
      }
    };
  }, [map]);

  const onReset = React.useCallback(() => {
    dispatch(actions.identifyReseted());
  }, []);

  if (ENABLE_RENDER_LOGS) {
    console.log('########## IDENTIFY-render');
  }

  return (
    <div
      id="muni-identify"
      className="munimap-identify"
      title={munimap_lang.getMsg(
        munimap_lang.Translations.RESET_IDENTIFICATION,
        lang
      )}
      ref={resetElRef}
      onClick={enabled ? onReset : undefined}
    >
      <i
        id="munimap-reset-icon"
        className={`munimap-reset-icon${enabled ? '' : ' disabled'}`}
      >
        &#x1f6ab;
      </i>
    </div>
  );
};

export default hot(module)(IdentifyComponent);
