import * as actions from '../../redux/action.js';
import * as munimap_lang from '../../lang/lang.js';
import * as slctr from '../../redux/selector.js';
import MapContext from '../../_contexts/mapcontext.jsx';
import React, {useContext, useEffect, useRef} from 'react';
import {Control} from 'ol/control';
import {ENABLE_EFFECT_LOGS, ENABLE_RENDER_LOGS} from '../../conf.js';
import {Geolocation} from 'ol';
import {Point} from 'ol/geom';
import {isLayer} from '../../layer/geolocation.js';
import {useDispatch, useSelector} from 'react-redux';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("ol/layer").Vector} ol.layer.Vector
 * @typedef {import("redux").Store} redux.Store
 * @typedef {import("redux").Dispatch} redux.Dispatch
 */

/**
 * @type {React.FC}
 * @param {React.PropsWithChildren<{}>} props props
 * @return {React.ReactElement} React element
 */
const GeolocationComponent = (props) => {
  const lang = useSelector(slctr.getLang);

  const dispatch = useDispatch();

  const mapRef = useContext(MapContext);
  const map = mapRef && mapRef.current;

  const geolocElRef = useRef(null);
  const geolocRef = useRef(null);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## GEOLOCATION-useEffect-log');
    }
    if (!(window.location.protocol === 'https:' || !PRODUCTION)) {
      dispatch(
        actions.log_action_happened({
          category: 'geolocation',
          action: 'http_hidden',
        })
      );
    }
  }, []);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## GEOLOCATION-useEffect-geolocation');
    }
    let control;
    if (map && geolocElRef.current) {
      const geolocation = new Geolocation({
        projection: map.getView().getProjection(),
      });
      geolocation.on('change:position', () => {
        const coordinates = geolocation.getPosition();
        const positionLayer = /** @type {ol.layer.Vector}*/ (
          map
            .getLayers()
            .getArray()
            .find((l) => isLayer(l))
        );

        if (positionLayer) {
          const positionFeature = positionLayer.getSource().getFeatures()[0];
          positionFeature.setGeometry(
            coordinates ? new Point(coordinates) : null
          );
        }
      });
      geolocRef.current = geolocation;
      control = new Control({element: geolocElRef.current});
    }
    return () => {
      if (control) {
        control = undefined;
      }
    };
  }, [map]);

  const onGeolocate = React.useCallback(() => {
    dispatch(
      actions.log_action_happened({
        category: 'geolocation',
        action: 'click',
      })
    );

    const callback = () => {
      const position = geolocRef.current.getPosition();
      dispatch(actions.geolocationClicked(position));
    };

    if (geolocRef.current && !geolocRef.current.getTracking()) {
      geolocRef.current.setTracking(true);
      geolocRef.current.once('change', callback);
    } else if (geolocRef.current && geolocRef.current.getTracking()) {
      callback();
    }
  }, [map]);

  if (ENABLE_RENDER_LOGS) {
    console.log('########## GEOLOCATION-render');
  }

  if (window.location.protocol === 'https:' || !PRODUCTION) {
    return (
      <div
        id="muni-locate"
        className={
          'ontouchstart' in window
            ? 'ol-touch munimap-geolocate'
            : 'munimap-geolocate'
        }
        title={munimap_lang.getMsg(munimap_lang.Translations.FIND_ME, lang)}
        ref={geolocElRef}
        onClick={onGeolocate}
      >
        <i className="munimap-crosshairs">&#xe807;</i>
      </div>
    );
  }
  return null;
};

export default GeolocationComponent;
