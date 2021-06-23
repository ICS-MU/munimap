/**
 * @module controls
 */

import * as munimap_lang from '../lang/lang.js';
import * as munimap_matomo from '../matomo/matomo.js';
import * as munimap_utils from '../utils/utils.js';
import Control from 'ol/control/Control';
import FullScreen from 'ol/control/FullScreen';
import createGeolocation from '../control/geolocate.js';
import createMapLinks from '../control/maplinks.js';

/**
 * @typedef {Object} ToolbarOptions
 * @property {!HTMLElement} mapTools
 * @property {!HTMLElement} toolBar
 * @property {!HTMLElement} button
 * @property {!HTMLElement} icon
 * @property {string} lang
 */

/**
 * @typedef {import("../create.js").Options} CreateOptions
 */

/**
 * Limit of map size to under which the map tools are hidden.
 * @type number
 * @const
 */
const MAP_SIZE_LIMIT = 'ontouchstart' in window ? 205 : 170;

/**
 * Size of a control.
 * @type number
 * @const
 */
const CONTROL_SIZE = 'ontouchstart' in window ? 33 : 30;

/**
 * Size of Zoom in/out control.
 * @type number
 * @const
 */
const ZOOM_IN_OUT_SIZE = 'ontouchstart' in window ? 83 : 70;

/**
 * Size of Map Links control.
 * @type number
 * @const
 */
const MAP_LINKS_SIZE = 'ontouchstart' in window ? 83 : 70;

/**
 * Creates element for Tool Bar
 * @returns {HTMLElement} element
 */
const createToolBarEl = () => {
  const toolBarEl = document.createElement('div');
  toolBarEl.className += ' munimap-tool-bar';
  toolBarEl.id = 'muni-tool-bar';
  return toolBarEl;
};

/**
 * Creates element for Map Tools
 * @returns {HTMLElement} element
 */
const createMapToolsEl = () => {
  const mapToolsEl = document.createElement('div'); // arrows
  mapToolsEl.className += ' munimap-map-tools collapsed';
  mapToolsEl.id = 'muni-map-tools';
  return mapToolsEl;
};

const addMatomoClickEvent = (parentEl) => {
  const el = parentEl.getElementsByClassName('ol-full-screen')[0];
  el.addEventListener('click', () => {
    munimap_matomo.sendEvent('full-screen', 'click');
  });
};

/**
 * @return {HTMLElement} element
 */
const getVerticalLineEl = () => {
  const verticalLineEl = document.createElement('div');
  verticalLineEl.className += ' munimap-vertical-line';
  return verticalLineEl;
};

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
 * @param {ol.Map} map map
 * @param {HTMLElement} target target
 * @param {string} lang language
 * @return {Control} control
 * */
const createInitExtentControl = (map, target, lang) => {
  const divEl = document.createElement('div');
  divEl.className += ' munimap-initial-extent';
  divEl.id = 'muni-init-extent';
  divEl.title = munimap_lang.getMsg(
    munimap_lang.Translations.INITIAL_EXTENT,
    lang
  );
  const buttonEl = document.createElement('div');
  buttonEl.className += ' munimap-init-extent-button';
  buttonEl.title = munimap_lang.getMsg(
    munimap_lang.Translations.INITIAL_EXTENT,
    lang
  );
  const icon = document.createElement('i');
  icon.className += ' munimap-home';
  icon.innerHTML = '&#x2302;';
  divEl.appendChild(buttonEl);
  buttonEl.appendChild(icon);
  const result = new Control({
    element: divEl,
    target: target,
  });

  divEl.addEventListener('click', () => {
    zoomToInitExtent(map);
    munimap_matomo.sendEvent('initExtent', 'click');
  });
  return result;
};

/**
 * Adds controls to the map and returns their total size
 * @param {ol.Map} map map
 * @param {Array<Control>} controls controls
 * @returns {number} total size
 */
const addControls = (map, controls) => {
  const controlSize = CONTROL_SIZE;
  let totalSize = 0;
  let current = controls.pop();
  const addedControls = map.getControls().getArray();

  while (munimap_utils.isDef(current)) {
    if (!addedControls.includes(current)) {
      map.addControl(current);
    }
    totalSize += controlSize;
    current = controls.pop();
  }

  return totalSize;
};

/**
 * Expands or closes the bar with map tools.
 * @param {ToolbarOptions} options options
 */
const toggleMapToolBar = (options) => {
  const collapsed = options.toolBar.style.display === 'none';
  const symbol = collapsed ? '&#xe802;' : '&#xe804;';
  const msg = collapsed
    ? munimap_lang.Translations.MAP_TOOLS_CLOSE
    : munimap_lang.Translations.MAP_TOOLS_OPEN;
  options.icon.innerHTML = symbol;
  collapsed
    ? (options.toolBar.style.display = '')
    : (options.toolBar.style.display = 'none');

  options.mapTools.classList.toggle('collapsed');
  options.button.title = munimap_lang.getMsg(msg, options.lang);
};

/**
 * Toggles Tool Bar into Map Tools
 * @param {ol.Map} map map
 * @param {HTMLElement} toolBarEl toolbar element
 * @param {HTMLElement} mapToolsEl maptools element
 * @param {string} lang language
 * @param {number} sizeOfControls total count
 */
const toggleMapTools = (map, toolBarEl, mapToolsEl, lang, sizeOfControls) => {
  const remainingSpace = map.getSize()[1] - sizeOfControls - ZOOM_IN_OUT_SIZE;
  if (remainingSpace >= 0) {
    toolBarEl.classList.add('default');
    map.addControl(
      new Control({
        element: toolBarEl, // the map is big enough to show all the tools
      })
    );
  } else {
    const buttonEl = document.createElement('div');
    buttonEl.className += ' munimap-map-tools-button';
    buttonEl.title = munimap_lang.getMsg(
      munimap_lang.Translations.MAP_TOOLS_OPEN,
      lang
    );
    const icon = document.createElement('i');
    icon.className += ' munimap-map-tools-icon';
    icon.innerHTML = '&#xe804;';
    buttonEl.appendChild(icon);
    mapToolsEl.appendChild(buttonEl);
    toolBarEl.classList.add('nested');

    const children = toolBarEl.children;
    const len = children.length;
    for (let i = 0; i < len; i = i + 2) {
      munimap_utils.insertSiblingAfter(getVerticalLineEl(), children[i]);
    }

    map.addControl(
      new Control({
        element: toolBarEl,
        target: mapToolsEl,
      })
    );
    toolBarEl.style.display = 'none';

    const toolBarOptions = /**@type {ToolbarOptions}*/ ({
      mapTools: mapToolsEl,
      toolBar: toolBarEl,
      button: buttonEl,
      icon: icon,
      lang: lang,
    });

    munimap_matomo.sendEvent('mapTools', 'create');
    buttonEl.addEventListener('click', () => {
      toggleMapToolBar(toolBarOptions);
      munimap_matomo.sendEvent('mapTools', 'click');
    });
    map.addControl(
      new Control({
        element: mapToolsEl,
      })
    );
  }
};

/**
 *
 * @param {ol.Map} map map
 * @param {CreateOptions} options opts
 */
const toggleMapLinks = (map, options) => {
  const mapLinkEl = /**@type {HTMLElement}*/ (map
    .getTargetElement()
    .getElementsByClassName('munimap-link')[0]);
  if (options.mapLinks && map.getSize()[1] < MAP_SIZE_LIMIT) {
    mapLinkEl.style.display = 'none';
    console.error('The map is too small. Map Links have to be hidden');
  } else if (options.mapLinks) {
    mapLinkEl.style.display = '';
  }
};

/**
 * Checks whether the controls need to be changed depending on the height of map
 * @param {ol.Map} map map
 * @param {number} remainingSpace remaining space
 * @param {number} sizeOfControls total size
 * @returns {boolean} whether needs to change
 */
const needToChange = (map, remainingSpace, sizeOfControls) => {
  const newRemainingSpace =
    map.getSize()[1] - sizeOfControls - ZOOM_IN_OUT_SIZE;
  return (
    (remainingSpace >= 0 && newRemainingSpace < 0) ||
    (remainingSpace < 0 && newRemainingSpace >= 0)
  );
};

/**
 * Create additional map tools
 * @param {ol.Map} map map
 * @param {CreateOptions} options opts
 */
export default (map, options) => {
  const lang = options.lang;

  // if (jpad.func.isDef(options.identifyCallback)) {
  //   map.addControl(munimap.identify.createControl(map));
  // }
  if (options.mapLinks) {
    map.addControl(createMapLinks(map, options.markers, lang));
  }
  if (window.location.protocol === 'https:' || !PRODUCTION) {
    map.addControl(createGeolocation(map, lang));
  } else {
    munimap_matomo.sendEvent('geolocation', 'http_hidden');
  }

  let remainingSpace = 0;
  let sizeOfControls = options.mapLinks ? MAP_LINKS_SIZE : 0;
  let toolBarEl = createToolBarEl();
  let mapToolsEl = createMapToolsEl();

  const storeControls = (controlsToAdd) => {
    controlsToAdd.push(
      new FullScreen({
        tipLabel: munimap_lang.getMsg(
          munimap_lang.Translations.FULLSCREEN,
          lang
        ),
        target: toolBarEl,
      })
    );
    controlsToAdd.push(createInitExtentControl(map, toolBarEl, lang));
  };

  const addMapTools = () => {
    const controlsToAdd = [];
    storeControls(controlsToAdd);
    sizeOfControls += addControls(map, controlsToAdd);
    remainingSpace = map.getSize()[1] - sizeOfControls - ZOOM_IN_OUT_SIZE;
    toggleMapTools(map, toolBarEl, mapToolsEl, lang, sizeOfControls);
  };

  addMapTools();
  addMatomoClickEvent(toolBarEl);
  toggleMapLinks(map, options);

  map.on('change:size', () => {
    if (needToChange(map, remainingSpace, sizeOfControls)) {
      if (toolBarEl.classList.contains('default')) {
        toolBarEl.parentNode.removeChild(toolBarEl);
      } else if (toolBarEl.classList.contains('nested')) {
        mapToolsEl.parentNode.removeChild(mapToolsEl);
      }
      sizeOfControls = options.mapLinks ? MAP_LINKS_SIZE : 0;
      toolBarEl = createToolBarEl();
      mapToolsEl = createMapToolsEl();
      addMapTools();
      addMatomoClickEvent(toolBarEl);
    }
    toggleMapLinks(map, options);
  });
};
