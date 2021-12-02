import * as actions from '../../redux/action.js';
import * as munimap_lang from '../../lang/lang.js';
import * as slctr from '../../redux/selector.js';
import React, {useContext, useEffect, useRef} from 'react';
import {Control} from 'ol/control';
import {MyContext} from '../../_contexts/context.jsx';
import {get as getProjection, transform} from 'ol/proj';
import {useDispatch, useSelector} from 'react-redux';

/**
 * @type {string}
 * @const
 */
const SEZNAM_IMG_PATH = APP_PATH + 'img/seznam.png';

/**
 * @type {string}
 * @const
 */
const GOOGLE_IMG_PATH = APP_PATH + 'img/google.png';

/**
 * Limit of map size to under which the map tools are hidden.
 * @type number
 * @const
 */
const MAP_SIZE_LIMIT = 'ontouchstart' in window ? 205 : 170;

const MapLinksComponent = (props) => {
  const lang = useSelector(slctr.getLang);
  const resolution = useSelector(slctr.getResolution);
  const center = useSelector(slctr.getCenter);
  const {mapLinks, markerIds} = useSelector(slctr.getRequiredOpts);
  const dispatch = useDispatch();

  const mapRef = useContext(MyContext);
  const map = mapRef && mapRef.current;

  const mapLinksRef = useRef(null);

  const onClick = React.useCallback(
    (path) => {
      const zoomLevel = map.getView().getZoomForResolution(resolution);
      const [y, x] = transform(
        center,
        getProjection('EPSG:3857'),
        getProjection('EPSG:4326')
      ).map((coord) => coord.toString());

      let matomoAction;
      if (path === SEZNAM_IMG_PATH) {
        matomoAction = 'mapy.cz';
        if (markerIds.length === 1) {
          window.open(
            `https://mapy.cz/zakladni?x=${y}&y=${x}&z=${zoomLevel}&source=coor&` +
              `id=${y}%2C${x}`
          );
        } else {
          window.open(`https://mapy.cz/zakladni?x=${zoomLevel}&y=${x}&z=${y}`);
        }
      } else {
        matomoAction = 'maps.google.com';
        if (markerIds.length === 1) {
          window.open(
            `http://www.google.com/maps/place/${x},` +
              `${y}/@${x},${y},${zoomLevel}z`
          );
        } else {
          window.open(`http://www.google.com/maps/@${x},${y},${zoomLevel}z`);
        }
      }

      dispatch(
        actions.log_action_happened({
          category: 'mapLinks',
          action: matomoAction,
        })
      );
    },
    [map]
  );

  useEffect(() => {
    let control;
    if (mapLinks && mapLinksRef.current && map) {
      // rendered by react => not added to map
      control = new Control({element: mapLinksRef.current});
    }
    return () => {
      if (control) {
        control = undefined;
      }
    };
  }, [mapLinks, map]);

  useEffect(() => {
    if (mapLinks && map && map.getSize()[1] < MAP_SIZE_LIMIT) {
      mapLinksRef.current.style.display = 'none';
      // eslint-disable-next-line no-console
      console.error('The map is too small. Map Links have to be hidden');
    } else if (mapLinks && map) {
      mapLinksRef.current.style.display = '';
    }
  }, [mapLinks, map]);

  if (mapLinks) {
    return (
      <div ref={mapLinksRef} className="munimap-link">
        <div
          className="munimap-link-item"
          style={{backgroundImage: `url(${SEZNAM_IMG_PATH})`}}
          title={munimap_lang.getMsg(
            munimap_lang.Translations.SEZNAM_MAP,
            lang
          )}
          onClick={() => onClick(SEZNAM_IMG_PATH)}
        ></div>
        <div
          className="munimap-link-item"
          style={{backgroundImage: `url(${GOOGLE_IMG_PATH})`}}
          title={munimap_lang.getMsg(
            munimap_lang.Translations.GOOGLE_MAP,
            lang
          )}
          onClick={() => onClick(GOOGLE_IMG_PATH)}
        ></div>
      </div>
    );
  }
  return null;
};

MapLinksComponent.displayName = 'MapLinksComponent';

export default MapLinksComponent;
