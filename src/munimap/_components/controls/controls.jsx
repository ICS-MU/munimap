import * as slctr from '../../redux/selector.js';
import GeolocationComponent from './geolocation.jsx';
import MapLinks from './maplinks.jsx';
import MapToolsComponent from './maptools.jsx';
import React from 'react';
import {ENABLE_RENDER_LOGS} from '../../conf.js';
import {hot} from 'react-hot-loader';
import {useSelector} from 'react-redux';

/**
 * @type {React.FC}
 * @param {React.PropsWithChildren<{}>} props props
 * @return {React.ReactElement} React element
 */
const ControlsComponent = (props) => {
  const mapLinks = useSelector(slctr.getRequiredMapLinks);

  if (ENABLE_RENDER_LOGS) {
    console.log('########## CONTROLS-render');
  }

  return (
    <>
      {mapLinks && <MapLinks />}
      <GeolocationComponent />
      <MapToolsComponent />
    </>
  );
};

export default hot(module)(ControlsComponent);
