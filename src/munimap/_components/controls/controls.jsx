import GeolocationComponent from './geolocation.jsx';
import MapContext from '../../_contexts/mapcontext.jsx';
import MapLinks from './maplinks.jsx';
import MapToolsComponent from './maptools.jsx';
import React, {useContext} from 'react';
import {ENABLE_RENDER_LOGS} from '../../conf.js';
import {hot} from 'react-hot-loader';

/**
 * @type {React.FC}
 * @param {React.PropsWithChildren<{}>} props props
 * @return {React.ReactElement} React element
 */
const ControlsComponent = (props) => {
  if (ENABLE_RENDER_LOGS) {
    console.log('########## CONTROLS-render');
  }

  const mapRef = useContext(MapContext);
  const map = mapRef && mapRef.current;

  if (map) {
    return (
      <>
        <MapLinks />
        <GeolocationComponent />
        <MapToolsComponent />
      </>
    );
  }
  return null;
};

export default hot(module)(ControlsComponent);
