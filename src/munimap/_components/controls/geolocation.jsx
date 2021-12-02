import * as actions from '../../redux/action.js';
import * as munimap_lang from '../../lang/lang.js';
import * as ol_extent from 'ol/extent';
import * as slctr from '../../redux/selector.js';
import MapContext from '../../_contexts/mapcontext.jsx';
import React, {useContext, useEffect, useRef} from 'react';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Circle, Fill, Stroke, Style} from 'ol/style';
import {Control} from 'ol/control';
import {ENABLE_EFFECT_LOGS, ENABLE_RENDER_LOGS} from '../../conf.js';
import {Feature, Geolocation} from 'ol';
import {Point} from 'ol/geom';
import {getAnimationDuration} from '../../utils/animation.js';
import {useDispatch, useSelector} from 'react-redux';

/**
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol/coordinate").Coordinate} ol.coordinate.Coordinate
 * @typedef {import("redux").Store} redux.Store
 * @typedef {import("redux").Dispatch} redux.Dispatch
 * @typedef {import("../../conf.js").AnimationRequestState} AnimationRequestState
 */

/**
 * @param {ol.Map} map map
 * @param {ol.coordinate.Coordinate} position center
 * @return {AnimationRequestState} request state
 */
const createAnimationRequest = (map, position) => {
  const center = position || null;
  const view = map.getView();
  const currExt = view.calculateExtent(map.getSize());
  const res = view.getResolution();
  const buffExt = ol_extent.buffer(currExt, res * 100, currExt);
  const extent = ol_extent.boundingExtent([center, view.getCenter()]);
  const targetExtent = ol_extent.boundingExtent([center]);
  const duration = getAnimationDuration(currExt, targetExtent);
  const resolution = view.getResolutionForExtent(extent);

  //TODO: multiple request

  if (ol_extent.intersects(buffExt, targetExtent)) {
    return {center, duration, resolution};
  } else {
    return {
      center,
      duration,
      resolution: view.getResolutionForZoom(18),
    };
  }
};

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
        const positionLayer = /** @type {VectorLayer}*/ (
          map
            .getLayers()
            .getArray()
            .find((l) => l.get('id') === 'geolocate')
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

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## GEOLOCATION-useEffect-layer');
    }
    let layer;
    if ((window.location.protocol === 'https:' || !PRODUCTION) && map) {
      const positionFeature = new Feature();
      positionFeature.setStyle(
        new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({
              color: '#0000dc',
            }),
            stroke: new Stroke({
              color: 'rgba(0,39,118,0.25)',
              width: 30,
            }),
          }),
        })
      );

      layer = new VectorLayer({
        source: new VectorSource({
          features: [positionFeature],
        }),
      });
      layer.set('id', 'geolocate');

      map.addLayer(layer);
    }
    return () => {
      if (map && layer) {
        geolocRef.current.setTracking(false);
        map.removeLayer(layer);
        layer = undefined;
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
      dispatch(
        actions.view_animation_requested(createAnimationRequest(map, position))
      );
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
        className="munimap-geolocate"
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

GeolocationComponent.displayName = 'GeolocationComponent';

export default GeolocationComponent;
