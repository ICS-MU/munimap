import GeolocationComponent from './geolocation.jsx';
import MapLinks from './maplinks.jsx';
import MapToolsComponent from './maptools.jsx';
import React from 'react';
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
  return (
    <>
      <MapLinks />
      <GeolocationComponent />
      <MapToolsComponent />
    </>
  );
};

export default hot(module)(ControlsComponent);
