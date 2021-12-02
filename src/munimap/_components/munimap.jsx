import * as actions from '../redux/action.js';
import * as munimap_view from '../view/view.js';
import * as slctr from '../redux/selector.js';
import Controls from './controls/controls.jsx';
import ErrorMessage from './errormessage.jsx';
import InfoBubbleComponent from './infobubble.jsx';
import LoadingMessage from './loadingmessage.jsx';
import MapContext from '../_contexts/mapcontext.jsx';
import PropTypes from 'prop-types';
import React, {useEffect, useLayoutEffect, useRef} from 'react';
import {CREATED_MAPS} from '../create.js';
import {ENABLE_EFFECT_LOGS, ENABLE_RENDER_LOGS} from '../conf.js';
import {MUNIMAP_PROPS_ID} from '../conf.js';
import {Map} from 'ol';
import {hot} from 'react-hot-loader';
import {unlistenByKey} from 'ol/events';
import {useDispatch, useSelector} from 'react-redux';

/**
 * @typedef {import("../conf.js").MapProps} MapProps
 * @typedef {import("react").MutableRefObject<Map>} MapRefObject
 * @typedef {import("react").Dispatch<import("react").SetStateAction<Map>>} MapStateAction
 * @typedef {Array<MapRefObject, MapStateAction>} MapRefUseState
 */

/**
 * @type {React.FC<{afterInit: Function}>}
 * @param {React.PropsWithChildren<{afterInit: Function}>} props props
 * @return {React.ReactElement} React element
 */
const MunimapComponent = (props) => {
  const {afterInit} = props;
  const areMarkersLoaded = useSelector(slctr.areMarkersLoaded);
  const areZoomToLoaded = useSelector(slctr.areZoomToLoaded);
  const basemapLayer = useSelector(slctr.getBasemapLayer);
  const markers = useSelector(slctr.getInitMarkers);
  const view = useSelector(slctr.calculateView);
  const defaultControls = useSelector(slctr.getDefaultControls);
  const buildingsCount = useSelector(slctr.getLoadedBuildingsCount);
  const requiredOpts = useSelector(slctr.getRequiredOpts);
  const clusterResolution = useSelector(slctr.getClusterResolution);
  const muAttrs = useSelector(slctr.getMuAttrs);
  const selectedFeature = useSelector(slctr.getSelectedFeature);
  const animationRequest = useSelector(slctr.getAnimationRequest);
  const mapInitialized = useSelector(slctr.isMapInitialized);
  const invalidCodes = useSelector(slctr.getInvalidCodes);
  const simpleScroll = useSelector(slctr.getRequiredSimpleScroll);
  const areInitialLayersAdded = useSelector(slctr.areInitialLayersAdded);
  const allStyleFunctions = useSelector(slctr.getAllStyleFunctions);

  const hasInvalidCodes = invalidCodes && invalidCodes.length > 0;
  const shouldBlockMap = !simpleScroll;

  const dispatch = useDispatch();

  const munimapElRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-depListeners');
    }
    const eventKeys = munimap_view.attachDependentMapListeners(
      mapRef.current,
      dispatch,
      {
        requiredOpts,
        selectedFeature,
      }
    );
    return () => eventKeys.forEach((k) => unlistenByKey(k));
  }, [requiredOpts, selectedFeature]);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-addLayers');
    }
    if (areMarkersLoaded && areZoomToLoaded && !areInitialLayersAdded) {
      munimap_view.addLayers(mapRef.current, dispatch, {
        markers,
        muAttrs,
        clusterResolution,
        requiredOpts,
      });
    }
  }, [
    markers,
    muAttrs,
    clusterResolution,
    requiredOpts,
    areInitialLayersAdded,
    areMarkersLoaded,
    areZoomToLoaded,
  ]);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-clusterUpdate');
    }
    munimap_view.ensureClusterUpdate(mapRef.current, {
      labels: requiredOpts.labels,
      buildingsCount,
    });
  }, [requiredOpts, buildingsCount]);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-ensureBasemap');
    }
    munimap_view.ensureBaseMap(mapRef.current, basemapLayer);
  }, [basemapLayer]);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-refreshStyles');
    }
    munimap_view.refreshStyles(
      mapRef.current,
      allStyleFunctions,
      requiredOpts.pubTran
    );
  }, [allStyleFunctions, requiredOpts]);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-animate');
    }
    munimap_view.animate(mapRef.current, animationRequest);
  }, [animationRequest]);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-afterInit');
    }
    if (mapInitialized) {
      afterInit(mapRef.current);
    }
  }, [mapInitialized]);

  useLayoutEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useLayoutEffect');
    }

    if (areMarkersLoaded && areZoomToLoaded) {
      if (!mapRef.current) {
        const _map = new Map({
          controls: defaultControls,
          target: munimapElRef.current,
          layers: [basemapLayer],
          view,
        });
        mapRef.current = _map;

        const mapProps = /**@type {MapProps}*/ ({
          currentRes: view.getResolution(),
          buildingsCount,
        });
        _map.set(MUNIMAP_PROPS_ID, mapProps);
        CREATED_MAPS[requiredOpts.targetId] = _map;
        munimap_view.attachIndependentMapListeners(_map, dispatch);
      }
    }
  }, [areMarkersLoaded, areZoomToLoaded]);

  const onErrorClick = () => {
    if (munimapElRef.current) {
      munimapElRef.current.focus();
      dispatch(actions.target_focused({render: false, withMessage: false}));
    }
  };

  const onBlur = () => {
    if ((hasInvalidCodes || shouldBlockMap) && munimapElRef.current) {
      munimapElRef.current.blur();
      dispatch(
        actions.target_blurred({
          render: hasInvalidCodes && !shouldBlockMap ? false : true,
          withMessage: false,
        })
      );
    }
  };

  if (ENABLE_RENDER_LOGS) {
    console.log('########## MUNIMAP-render');
  }

  return (
    <>
      <MapContext.Provider value={mapRef}>
        <LoadingMessage />
        <div className="munimap">
          <div
            onBlur={onBlur}
            tabIndex={hasInvalidCodes || shouldBlockMap ? 0 : undefined}
            ref={munimapElRef}
            className="map-target"
          ></div>
          <InfoBubbleComponent />
          <Controls />
        </div>
        <ErrorMessage onClick={onErrorClick} />
      </MapContext.Provider>
    </>
  );
};

MunimapComponent.propTypes = {
  afterInit: PropTypes.func.isRequired,
};

export default hot(module)(MunimapComponent);
