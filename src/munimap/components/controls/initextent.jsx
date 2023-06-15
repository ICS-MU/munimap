import * as actions from '../../redux/action.js';
import * as mm_lang from '../../lang.js';
import * as slctr from '../../redux/selector/selector.js';
import MapContext from '../../contexts/mapcontext.jsx';
import React, {forwardRef, useContext, useEffect, useRef} from 'react';
import {Control} from 'ol/control.js';
import {useDispatch, useSelector} from 'react-redux';

/**
 * @typedef {import("ol").Map} ol.Map
 */

/**
 * @param {ol.Map} map map
 */
const zoomToInitExtent = (map) => {
  const view = map.getView();
  const initExtent = view.get('initExtentOpts');
  const {extent, size, center, zoom, resolution} = initExtent;
  if (size && !resolution) {
    view.fit(extent, {
      size: size,
    });
  } else {
    if (center && zoom) {
      view.setCenter(center);
      view.setZoom(zoom);
    } else {
      view.setCenter(center);
      if (resolution) {
        view.setResolution(resolution);
      }
    }
  }
};

/**
 * @type {React.ForwardRefExoticComponent<
 *  React.PropsWithoutRef<any> &
 *  React.RefAttributes<HTMLDivElement>>}
 */
const InitExtentComponent = forwardRef((props, ref) => {
  const lang = useSelector(slctr.getLang);
  const initExtentElRef = useRef(null);
  const dispatch = useDispatch();

  const mapRef = useContext(MapContext);
  const map = mapRef && mapRef.current;

  const parentEl = /** @type {React.MutableRefObject<HTMLDivElement>}*/ (ref)
    .current;

  const onInitExtentClick = React.useCallback(() => {
    zoomToInitExtent(map);
    dispatch(
      actions.log_action_happened({
        category: 'initExtent',
        action: 'click',
      })
    );
  }, [map]);

  useEffect(() => {
    let initExtentControl;
    if (map && initExtentElRef && initExtentElRef.current) {
      // initialize Control - render should be done by React not by
      // control.setMap() => means that it should not be added to map as control
      initExtentControl = new Control({
        element: initExtentElRef.current,
        target: parentEl,
      });

      return () => {
        if (initExtentControl) {
          initExtentControl = undefined;
        }
      };
    }
  }, [map, parentEl]);

  return (
    <div
      className="munimap-initial-extent ol-unselectable ol-control"
      title={mm_lang.getMsg(mm_lang.Translations.INITIAL_EXTENT, lang)}
      onClick={onInitExtentClick}
      ref={initExtentElRef}
    >
      <button title={mm_lang.getMsg(mm_lang.Translations.INITIAL_EXTENT, lang)}>
        <i className="munimap-home">&#x2302;</i>
      </button>
    </div>
  );
});

InitExtentComponent.displayName = 'InitExtentComponent';

export default InitExtentComponent;
