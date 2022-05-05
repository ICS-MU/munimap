import * as slctr from '../../redux/selector/selector.js';
import GeolocationComponent from './geolocation.jsx';
import IdentifyComponent from './identify.jsx';
import MapLinks from './maplinks.jsx';
import MapToolsComponent from './maptools.jsx';
import React from 'react';
import {useSelector} from 'react-redux';

/**
 * @type {React.FC}
 * @param {React.PropsWithChildren<{}>} props props
 * @return {React.ReactElement} React element
 */
const ControlsComponent = (props) => {
  const mapLinks = useSelector(slctr.getRequiredMapLinks);
  const isIdentifyEnabled = useSelector(slctr.isIdentifyEnabled);

  return (
    <>
      {mapLinks && <MapLinks />}
      {isIdentifyEnabled && <IdentifyComponent />}
      <GeolocationComponent />
      <MapToolsComponent />
    </>
  );
};

export default ControlsComponent;
