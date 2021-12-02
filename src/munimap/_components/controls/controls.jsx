import GeolocationComponent from './geolocation.jsx';
import MapLinks from './maplinks.jsx';
import MapToolsComponent from './maptools.jsx';
import React from 'react';
import {hot} from 'react-hot-loader';

const ControlsComponent = (props) => {
  return (
    <>
      <MapLinks />
      <GeolocationComponent />
      <MapToolsComponent />
    </>
  );
};

export default hot(module)(ControlsComponent);
