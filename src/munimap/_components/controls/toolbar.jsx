import FullScreenComponent from './fullscreen.jsx';
import InitExtentComponent from './initextent.jsx';
import MapContext from '../../_contexts/mapcontext.jsx';
import PropTypes from 'prop-types';
import React, {forwardRef, useContext, useEffect} from 'react';
import {Control} from 'ol/control';
import {ENABLE_EFFECT_LOGS, ENABLE_RENDER_LOGS} from '../../conf.js';

/**
 * @type {React.ForwardRefExoticComponent<
 *  React.PropsWithoutRef<{visible: boolean, horizontal: boolean}> &
 *  React.RefAttributes<HTMLDivElement>>}
 */
const ToolbarComponent = forwardRef((props, ref) => {
  const {visible, horizontal} = props;

  const mapRef = useContext(MapContext);
  const map = mapRef && mapRef.current;
  //ForwardRefRenderFunction<T, P>
  const toolBarEl =
    ref && /** @type {React.MutableRefObject<HTMLDivElement>}*/ (ref).current;

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## TOOLBAR-useEffect-control');
    }
    let toolBarControl;
    if (map && toolBarEl && horizontal) {
      toolBarControl = new Control({
        element: toolBarEl,
      });
    }

    return () => {
      if (toolBarControl) {
        toolBarControl = undefined;
      }
    };
  }, [map, horizontal, toolBarEl]);

  if (ENABLE_RENDER_LOGS) {
    console.log('########## TOOLBAR-render');
  }

  return (
    <div
      id="muni-tool-bar"
      className={`munimap-tool-bar${horizontal ? ' default' : ' nested'}`}
      ref={ref}
      style={{display: visible ? '' : 'none'}}
    >
      <FullScreenComponent ref={ref} />
      <InitExtentComponent ref={ref} />
    </div>
  );
});

ToolbarComponent.displayName = 'ToolbarComponent';

ToolbarComponent.propTypes = {
  visible: PropTypes.bool.isRequired,
  horizontal: PropTypes.bool.isRequired,
};

export default ToolbarComponent;
