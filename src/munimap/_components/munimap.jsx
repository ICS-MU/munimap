import * as actions from '../redux/action.js';
import * as munimap_view from '../view/view.js';
import * as slctr from '../redux/selector.js';
import Controls from './controls/controls.jsx';
import ErrorMessage from './errormessage.jsx';
import InfoBubble from './infobubble.jsx';
import LoadingMessage from './loadingmessage.jsx';
import MapContext from '../_contexts/mapcontext.jsx';
import Popup from './popup.jsx';
import PropTypes from 'prop-types';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import Tooltip from './tooltip.jsx';
import {CREATED_MAPS} from '../create.js';
import {ENABLE_EFFECT_LOGS, ENABLE_RENDER_LOGS} from '../conf.js';
import {MUNIMAP_PROPS_ID} from '../conf.js';
import {Map} from 'ol';
import {hot} from 'react-hot-loader';
import {unlistenByKey} from 'ol/events';
import {useDispatch, useSelector} from 'react-redux';

/**
 * @typedef {import("../conf.js").MapProps} MapProps
 * @typedef {import("ol").Map} ol.Map
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
  const addMsg = useSelector(slctr.toggleLoadingMessage);
  const areMarkersLoaded = useSelector(slctr.areMarkersLoaded);
  const areZoomToLoaded = useSelector(slctr.areZoomToLoaded);
  const basemapLayer = useSelector(slctr.getBasemapLayer);
  const markers = useSelector(slctr.getInitMarkers);
  const requiredView = useSelector(slctr.calculateView);
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
  const allStyleFunctions = useSelector(slctr.getAllStyleFunctions);
  const identifyVisibled = useSelector(slctr.isIdentifyLayerVisible);
  const isIdentifyEnabled = useSelector(slctr.isIdentifyEnabled);
  const lang = useSelector(slctr.getLang);
  const resetTimestamp = useSelector(slctr.getResetTimestamp);

  const [tooltipProps, setTooltipProps] = useState(null);

  const hasInvalidCodes = invalidCodes && invalidCodes.length > 0;
  const shouldBlockMap = !simpleScroll;

  const dispatch = useDispatch();

  const munimapTargetElRef = useRef(null);
  const munimapElRef = useRef(null);
  const mapRef = useRef(null);
  const map = /** @type {ol.Map}*/ (mapRef && mapRef.current);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-depListeners');
    }
    const eventKeys = munimap_view.attachDependentMapListeners(map, dispatch, {
      requiredOpts,
      selectedFeature,
      isIdentifyEnabled,
    });
    return () => eventKeys.forEach((k) => unlistenByKey(k));
  }, [map, requiredOpts, selectedFeature, isIdentifyEnabled]);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-addLayers');
    }
    if (areMarkersLoaded && areZoomToLoaded) {
      munimap_view.ensureLayers(map, {
        markers,
        muAttrs,
        clusterResolution,
        requiredOpts,
        isIdentifyEnabled,
      });
    }
  }, [
    map,
    markers,
    muAttrs,
    clusterResolution,
    requiredOpts,
    areMarkersLoaded,
    areZoomToLoaded,
    isIdentifyEnabled,
  ]);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-clusterUpdate');
    }
    munimap_view.ensureClusterUpdate(map, {
      targetId: requiredOpts.targetId,
      labels: requiredOpts.labels,
      buildingsCount,
    });
  }, [map, requiredOpts, buildingsCount]);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-ensureBasemap');
    }
    munimap_view.ensureBaseMap(map, basemapLayer);
  }, [map, basemapLayer]);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-refreshStyles');
    }
    munimap_view.refreshStyles(map, allStyleFunctions, requiredOpts.pubTran);
  }, [map, allStyleFunctions, requiredOpts]);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-refreshVisibility');
    }
    munimap_view.refreshVisibility(map, {
      isIdentifyEnabled,
      identifyVisibled,
    });
  }, [map, isIdentifyEnabled, identifyVisibled]);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-animate');
    }
    const callback =
      resetTimestamp === 0 ? () => dispatch(actions.resetDone()) : undefined;
    munimap_view.animate(map, animationRequest, callback);
  }, [map, animationRequest]);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useEffect-afterInit');
    }
    if (mapInitialized) {
      afterInit(map);
    }
  }, [map, mapInitialized]);

  useEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-tooltip');
    }

    if (map) {
      const key = map.on('pointermove', (evt) => {
        munimap_view.ensureTooltip(evt, {
          selectedFeature,
          lang,
          tooltipProps,
          setTooltipProps,
          requiredOpts,
        });
      });

      return () => unlistenByKey(key);
    }
  }, [map, tooltipProps, selectedFeature, requiredOpts]);

  useLayoutEffect(() => {
    if (ENABLE_EFFECT_LOGS) {
      console.log('########## MUNIMAP-useLayoutEffect');
    }

    if (areMarkersLoaded && areZoomToLoaded) {
      if (!mapRef.current) {
        const _map = new Map({
          controls: defaultControls,
          target: munimapTargetElRef.current,
          layers: [basemapLayer],
          view: requiredView,
        });
        mapRef.current = _map;

        const mapProps = /**@type {MapProps}*/ ({
          currentRes: requiredView.getResolution(),
          buildingsCount,
        });
        _map.set(MUNIMAP_PROPS_ID, mapProps);
        CREATED_MAPS[requiredOpts.targetId] = _map;
        munimap_view.attachIndependentMapListeners(_map, dispatch);
      }
    }
  }, [areMarkersLoaded, areZoomToLoaded, requiredView]);

  const onErrorClick = () => {
    if (munimapElRef.current) {
      munimapElRef.current.focus();
      dispatch(actions.target_focused());
    }
  };

  const onBlur = (e) => {
    if ((hasInvalidCodes || shouldBlockMap) && munimapElRef.current) {
      if (munimapElRef.current.contains(e.relatedTarget)) {
        e.stopPropagation();
      } else {
        munimapElRef.current.blur();
        dispatch(actions.target_blurred());
      }
    }
  };

  if (ENABLE_RENDER_LOGS) {
    console.log('########## MUNIMAP-render');
  }

  return (
    <>
      <MapContext.Provider value={mapRef}>
        {addMsg && !map && <LoadingMessage />}
        <div
          className="munimap"
          onBlur={onBlur}
          tabIndex={hasInvalidCodes || shouldBlockMap ? 0 : undefined}
          ref={munimapElRef}
        >
          <div ref={munimapTargetElRef} className="map-target">
            {tooltipProps && (
              <Tooltip
                title={tooltipProps.title}
                positionInCoords={tooltipProps.positionInCoords}
              />
            )}
            <InfoBubble />
            <Popup />
            {map && <Controls />}
          </div>
        </div>
        {areMarkersLoaded && areZoomToLoaded && (
          <ErrorMessage onClick={onErrorClick} />
        )}
      </MapContext.Provider>
    </>
  );
};

MunimapComponent.propTypes = {
  afterInit: PropTypes.func.isRequired,
};

export default hot(module)(MunimapComponent);
