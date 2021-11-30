import * as actions from '../redux/action.js';
import * as munimap_view from '../view/view.js';
import * as slctr from '../redux/selector.js';
import ErrorMessage from './errormessage.jsx';
import InfoBubbleComponent from './infobubble.jsx';
import LoadingMessage from './loadingmessage.jsx';
import PropTypes from 'prop-types';
import React, {useLayoutEffect, useRef} from 'react';
import {CREATED_MAPS} from '../create.js';
import {MUNIMAP_PROPS_ID} from '../conf.js';
import {Map} from 'ol';
import {hot} from 'react-hot-loader';
import {useDispatch, useSelector, useStore} from 'react-redux';

/**
 * @typedef {import("../conf.js").MapProps} MapProps
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
  const bldgsCount = useSelector(slctr.getLoadedBuildingsCount);
  const mapInitialized = useSelector(slctr.isMapInitialized);
  const invalidCodes = useSelector(slctr.getInvalidCodes);
  const simpleScroll = useSelector(slctr.getRequiredSimpleScroll);

  const hasInvalidCodes = invalidCodes && invalidCodes.length > 0;
  const shouldBlockMap = !simpleScroll;

  const dispatch = useDispatch();
  const store = useStore();

  const munimapElRef = useRef(null);
  const mapRef = useRef(null);

  useLayoutEffect(() => {
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

        munimap_view.addCustomControls(_map, dispatch, requiredOpts);
        munimap_view.attachMapListeners(_map, dispatch, {
          requiredOpts,
          selectedFeature,
        });
        munimap_view.addLayers(_map, {
          markers,
          muAttrs,
          clusterResolution,
          requiredOpts,
        });
      }
      munimap_view.ensureClusterUpdate(mapRef.current, {
        labels: requiredOpts.labels,
        bldgsCount,
      });
      munimap_view.ensureBaseMap(mapRef.current, basemapLayer);
      munimap_view.refreshStyles(
        store.getState(), //pozor, neprekresli se pri zmene
        mapRef.current.getLayers().getArray()
      );
      munimap_view.animate(mapRef.current, animationRequest);

      if (mapInitialized) {
        afterInit(mapRef.current);
      }
    }
  });

  const onErrorClick = () => {
    munimapElRef.current.focus();
    dispatch(actions.target_focused({render: false, withMessage: false}));
  };

  const onBlur = () => {
    if (hasInvalidCodes || shouldBlockMap) {
      munimapElRef.current.blur();
      dispatch(
        actions.target_blurred({
          render: hasInvalidCodes && !shouldBlockMap ? false : true,
          withMessage: false,
        })
      );
    }
  };

  return (
    <>
      <LoadingMessage />
      <div
        className="munimap"
        ref={munimapElRef}
        onBlur={onBlur}
        tabIndex={hasInvalidCodes || shouldBlockMap ? 0 : undefined}
      >
        <InfoBubbleComponent
          getPixelFromCoordinate={
            mapRef.current &&
            mapRef.current.getPixelFromCoordinate.bind(mapRef.current)
          }
        />
      </div>
      <ErrorMessage onClick={onErrorClick} />
    </>
  );
};

MunimapComponent.propTypes = {
  afterInit: PropTypes.func.isRequired,
};

export default hot(module)(MunimapComponent);
