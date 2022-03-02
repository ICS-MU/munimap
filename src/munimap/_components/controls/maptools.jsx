import * as actions from '../../redux/action.js';
import * as munimap_lang from '../../lang/lang.js';
import * as slctr from '../../redux/selector.js';
import MapContext from '../../_contexts/mapcontext.jsx';
import React, {useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import ToolbarComponent from './toolbar.jsx';
import {Control} from 'ol/control';
import {ENABLE_EFFECT_LOGS, ENABLE_RENDER_LOGS} from '../../conf.js';
import {hot} from 'react-hot-loader';
import {useDispatch, useSelector} from 'react-redux';

/**
 * Size of a control.
 * @type number
 * @const
 */
const CONTROL_SIZE = 'ontouchstart' in window ? 33 : 30;

/**
 * Size of Zoom in/out control.
 * @type number
 * @const
 */
const ZOOM_IN_OUT_SIZE = 'ontouchstart' in window ? 83 : 70;

/**
 * Size of Map Links control.
 * @type number
 * @const
 */
const MAP_LINKS_SIZE = 'ontouchstart' in window ? 83 : 70;

/**
 * @type {React.FC}
 * @param {React.PropsWithChildren<{}>} props props
 * @return {React.ReactElement} React element
 */
const MapToolsComponent = (props) => {
  const lang = useSelector(slctr.getLang);
  const size = useSelector(slctr.getSize);
  const {mapLinks} = useSelector(slctr.getRequiredOpts);

  const mapRef = useContext(MapContext);
  const map = mapRef && mapRef.current;

  const toolBarElRef = useRef(null);
  const mapToolsElRef = useRef(null);

  const [toolbarVisible, setToolbarVisible] = useState(false);
  const dispatch = useDispatch();

  let collapsed = false;
  if (map && toolBarElRef && toolBarElRef.current) {
    const totalControls = toolBarElRef.current.children.length;
    let totalSize = totalControls * CONTROL_SIZE;
    if (mapLinks) {
      totalSize += MAP_LINKS_SIZE;
    }
    const remainingSpace = size[1] - totalSize - ZOOM_IN_OUT_SIZE;
    collapsed = remainingSpace < 0;
  }

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MAPTOOLS-useEffect-control');
    }
    let toolBarControl;
    let mapToolsControl;
    if (map && toolBarElRef.current && mapToolsElRef.current && collapsed) {
      toolBarControl = new Control({
        element: toolBarElRef.current,
        target: mapToolsElRef.current,
      });
      mapToolsControl = new Control({
        element: mapToolsElRef.current,
      });
      map.addControl(toolBarControl);
      dispatch(
        actions.log_action_happened({
          category: 'mapTools',
          action: 'create',
        })
      );
    }

    return () => {
      if (toolBarControl) {
        map.removeControl(toolBarControl);
        toolBarControl = undefined;
      }
      if (mapToolsControl) {
        mapToolsControl = undefined;
      }
    };
  }, [map]);

  const toolbarComp = (
    <ToolbarComponent
      ref={toolBarElRef}
      visible={collapsed ? toolbarVisible : true}
      horizontal={!collapsed}
    />
  );

  if (ENABLE_RENDER_LOGS) {
    console.log('########## MAPTOOLS-render');
  }

  if (collapsed) {
    const className =
      'ontouchstart' in window
        ? 'ol-touch munimap-map-tools'
        : 'munimap-map-tools';

    return (
      <div
        id="muni-map-tools"
        className={`${className}${toolbarVisible ? '' : ' collapsed'}`}
        ref={mapToolsElRef}
        style={{display: collapsed ? '' : 'none'}}
      >
        <div
          className="munimap-map-tools-button"
          title={munimap_lang.getMsg(
            toolbarVisible
              ? munimap_lang.Translations.MAP_TOOLS_CLOSE
              : munimap_lang.Translations.MAP_TOOLS_OPEN,
            lang
          )}
          onClick={() => setToolbarVisible(!toolbarVisible)}
        >
          <i className="munimap-map-tools-icon">
            {toolbarVisible ? <span>&#xe802;</span> : <span>&#xe804;</span>}
          </i>
        </div>
        {toolbarComp}
      </div>
    );
  } else {
    return toolbarComp;
  }
};

export default hot(module)(MapToolsComponent);
