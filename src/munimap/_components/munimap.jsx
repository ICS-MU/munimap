import * as actions from '../redux/action.js';
import * as mm_range from '../utils/range.js';
import * as mm_view from '../view/view.js';
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
import {CREATED_MAPS, GET_MAIN_FEATURE_AT_PIXEL_STORE} from '../constants.js';
import {
  FLOOR_RESOLUTION,
  POI_RESOLUTION,
  PoiPurpose,
} from '../feature/constants.js';
import {MUNIMAP_PROPS_ID} from '../constants.js';
import {Map} from 'ol';
import {calculateParameters} from '../view/tooltip.js';
import {
  getMainFeatureAtPixel,
  isSuitableForTooltip,
} from '../feature/feature.js';
import {getUid} from 'ol';
import {hot} from 'react-hot-loader';
import {unlistenByKey} from 'ol/events';
import {useDispatch, useSelector} from 'react-redux';

/**
 * @typedef {import("../constants.js").MapProps} MapProps
 * @typedef {import('../conf.js').RequiredOptions} RequiredOptions
 * @typedef {import("ol").Map} ol.Map
 * @typedef {import("ol").Feature} ol.Feature
 * @typedef {import("react").MutableRefObject<Map>} MapRefObject
 * @typedef {import("react").Dispatch<import("react").SetStateAction<Map>>} MapStateAction
 * @typedef {Array<MapRefObject, MapStateAction>} MapRefUseState
 * @typedef {import("../view/tooltip.js").TooltipParams} TooltipParams
 * @typedef {import("react").Dispatch<TooltipParams>} DispatchTooltipParams
 * @typedef {import("ol").MapBrowserEvent} MapBrowserEvent
 */

/**
 * @typedef {Object} EnsureTooltipOptions
 * @property {string} selectedFeature selected feature
 * @property {string} lang language
 * @property {string} tooltipProps selected feature
 * @property {DispatchTooltipParams} setTooltipProps selected feature
 * @property {RequiredOptions} requiredOpts options
 */

/**
 * @type {Object<string, number>}
 */
const TIMEOUT_STORE = {};

/**
 * @param {ol.Feature} feature feature
 * @param {number} resolution resolution
 * @param {string} [selectedFeature] selectedFeature
 * @return {boolean} whether is map resolution in tooltip resolution range
 */
const inTooltipResolutionRange = (feature, resolution, selectedFeature) => {
  const title = feature.get('typ');
  return title === PoiPurpose.COMPLEX_ENTRANCE ||
    title === PoiPurpose.BUILDING_COMPLEX_ENTRANCE
    ? mm_range.contains(POI_RESOLUTION, resolution)
    : !!selectedFeature && mm_range.contains(FLOOR_RESOLUTION, resolution);
};

/**
 * @param {MapBrowserEvent} evt event
 * @param {EnsureTooltipOptions} options options
 */
const ensureTooltip = (evt, options) => {
  const {selectedFeature, lang, tooltipProps, setTooltipProps} = options;
  const {
    targetId,
    getMainFeatureAtPixelId,
    tooltips: tooltipsEnabled,
    locationCodes,
  } = options.requiredOpts;
  const map = evt.map;
  const resolution = map.getView().getResolution();
  const pixel = map.getEventPixel(evt.originalEvent);
  const getMainFeatureAtPixelFn = getMainFeatureAtPixelId
    ? GET_MAIN_FEATURE_AT_PIXEL_STORE[getMainFeatureAtPixelId]
    : getMainFeatureAtPixel;

  const featureWithLayer = getMainFeatureAtPixelFn(map, pixel);
  if (featureWithLayer) {
    const feature = featureWithLayer.feature;
    const inTooltipResolutionRange_ = inTooltipResolutionRange(
      feature,
      resolution,
      selectedFeature
    );
    if (tooltipsEnabled && inTooltipResolutionRange_) {
      if (TIMEOUT_STORE[targetId]) {
        clearTimeout(TIMEOUT_STORE[targetId]);
        delete TIMEOUT_STORE[targetId];
        if (tooltipProps) {
          setTooltipProps(null);
        }
      }

      if (isSuitableForTooltip(feature)) {
        const opts = {
          title: feature.get('typ'),
          featureUid: getUid(feature),
          pixelInCoords: map.getCoordinateFromPixel(pixel),
          purposeTitle: feature.get('ucel_nazev'),
          purposeGis: feature.get('ucel_gis'),
          resolution,
          lang,
          locationCodes,
          targetId,
        };
        TIMEOUT_STORE[targetId] = setTimeout(
          () => setTooltipProps(calculateParameters(opts)),
          750
        );
      }
    } else if (!inTooltipResolutionRange_ && tooltipProps) {
      setTooltipProps(null);
    }
  } else {
    if (TIMEOUT_STORE[targetId]) {
      clearTimeout(TIMEOUT_STORE[targetId]);
      delete TIMEOUT_STORE[targetId];
    }
    if (tooltipProps) {
      setTooltipProps(null);
    }
  }
};

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
    const eventKeys = mm_view.attachDependentMapListeners(map, dispatch, {
      requiredOpts,
      selectedFeature,
      isIdentifyEnabled,
    });
    return () => eventKeys.forEach((k) => unlistenByKey(k));
  }, [map, requiredOpts, selectedFeature, isIdentifyEnabled]);

  useEffect(() => {
    if (areMarkersLoaded && areZoomToLoaded) {
      mm_view.ensureLayers(map, {
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
    mm_view.ensureClusterUpdate(map, {
      targetId: requiredOpts.targetId,
      labels: requiredOpts.labels,
      buildingsCount,
    });
  }, [map, requiredOpts, buildingsCount]);

  useEffect(() => {
    mm_view.ensureBaseMap(map, basemapLayer);
  }, [map, basemapLayer]);

  useEffect(() => {
    mm_view.refreshStyles(map, allStyleFunctions, requiredOpts.pubTran);
  }, [map, allStyleFunctions, requiredOpts]);

  useEffect(() => {
    mm_view.refreshVisibility(map, {
      isIdentifyEnabled,
      identifyVisibled,
    });
  }, [map, isIdentifyEnabled, identifyVisibled]);

  useEffect(() => {
    const callback =
      resetTimestamp === 0
        ? () => dispatch(actions.animationFinishedAfterReset())
        : undefined;
    mm_view.animate(map, animationRequest, callback);
  }, [map, animationRequest]);

  useEffect(() => {
    if (mapInitialized) {
      afterInit(map);
    }
  }, [map, mapInitialized]);

  useEffect(() => {
    if (map) {
      const key = map.on('pointermove', (evt) => {
        ensureTooltip(evt, {
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
        mm_view.attachIndependentMapListeners(_map, dispatch);
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
