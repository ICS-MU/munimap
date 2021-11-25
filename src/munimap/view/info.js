/**
 * @module view/info
 */

import * as actions from '../redux/action.js';
import * as munimap_lang from '../lang/lang.js';
import * as munimap_utils from '../utils/utils.js';
import * as slctr from '../redux/selector.js';
import {POPUP_TALE_INDENT, getInfoBoxPosition} from '../ui/info.js';
import {TARGET_ELEMENTS_STORE} from '../create.js';
import {findSelectedFloorItem, getLabel, getLabelAbbr} from '../ui/info.js';
import {
  sort as floorSortFn,
  getFloorsByBuildingCode,
} from '../feature/floor.js';
import {getStore as getMarkerStore} from '../source/marker.js';

/**
 * @typedef {import("ol/Feature").default} ol.Feature
 * @typedef {import("ol/extent").Extent} ol.extent.Extent
 * @typedef {import("ol/Map").default} ol.Map
 * @typedef {import("redux").AnyAction} redux.AnyAction
 * @typedef {import('../conf.js').State} State
 */

/**
 * @typedef {Object} BuildingTitleOptions
 * @property {string} title title
 * @property {string} complexTitle complex title
 */

/**
 * @typedef {Object} PopupPositionOptions
 * @property {boolean} hideTale hide tale
 * @property {Array<number>} [coordinate]
 * @property {Array<number>} [position]
 */

const createDropdown = (floors, element, lang, onClickItem) => {
  const buttonEl = document.createElement('button');
  buttonEl.addEventListener('click', () => {
    const menuEl = buttonEl.nextElementSibling;
    menuEl.classList.toggle('show');

    const captionEl = /**@type {HTMLDivElement}*/ (
      buttonEl.getElementsByClassName('munimap-floor-select-caption')[0]
    );
    Array.from(menuEl.children).forEach((el) => {
      if (el.textContent === captionEl.textContent) {
        el.classList.add('hover');
      }
    });
  });
  buttonEl.className = 'munimap-floor-select-button';
  const innerDiv = document.createElement('div');
  innerDiv.className = 'munimap-floor-select-menu';

  const captionEl = document.createElement('div');
  captionEl.className = 'munimap-floor-select-caption';
  buttonEl.appendChild(captionEl);
  const arrowEl = document.createElement('div');
  arrowEl.className = 'munimap-floor-select-arrow';
  arrowEl.innerHTML = ' ';
  buttonEl.appendChild(arrowEl);

  element.appendChild(buttonEl);
  element.appendChild(innerDiv);

  floors.forEach((floor) => {
    const locCode = /**@type {string}*/ (floor.get('polohKod'));
    const floorCode = locCode.substr(5, 8);
    const floorLabel = getLabelAbbr(floorCode, lang);
    const floorDivEl = document.createElement('div');
    floorDivEl.textContent = floorLabel;
    floorDivEl.className = 'munimap-floor-select-item';
    floorDivEl.title = getLabel(floorCode, lang);
    floorDivEl.setAttribute('data-lc', locCode);

    floorDivEl.addEventListener('mouseover', () => {
      Array.from(innerDiv.children).forEach((i) => i.classList.remove('hover'));
      floorDivEl.classList.add('hover');
    });

    floorDivEl.addEventListener('mouseout', () => {
      floorDivEl.classList.remove('hover');
    });

    floorDivEl.addEventListener('click', (e) => {
      const selectItem = /**@type {HTMLDivElement}*/ (e.target);
      const value = selectItem.getAttribute('data-lc');
      selectItem.parentElement.classList.remove('show');
      onClickItem(actions.selected_feature_changed, value);
    });

    innerDiv.appendChild(floorDivEl);
  });

  return element;
};

/**
 * Highlight floors with marker in info bubble
 * @param {HTMLDivElement} customFloorSelect floorSelect
 * @param {string} buildingCode buildingCode
 * @param {string} lang lang
 */
const highlightFloors = (customFloorSelect, buildingCode, lang) => {
  const markers = getMarkerStore().getFeatures();
  markers.forEach((feature) => {
    const locCode = /**@type {string}*/ (feature.get('polohKod'));
    if (locCode && locCode.length > 5) {
      const markerCode = locCode.substr(0, 5);
      const floorCode = locCode.substr(5, 3);
      if (markerCode === buildingCode) {
        const floorLabel = getLabelAbbr(floorCode, lang);

        const menuEl =
          customFloorSelect.getElementsByClassName('munimap-floor-select-menu')[0];
        const children = menuEl.children;

        Array.from(children).find((child) => {
          if (floorLabel === /**@type {HTMLOptionElement}*/ (child).innerHTML) {
            child.classList.add('munimap-marker-floor');
            const title = child.getAttribute('title');
            const addTitle = munimap_lang.getMsg(
              munimap_lang.Translations.INFOBOX_MARKED,
              lang
            );
            if (title.indexOf(addTitle) === -1) {
              /**@type {HTMLOptionElement}*/ (child).title =
                title + '\n' + addTitle;
            }
          }
        });
      }
    }
  });
};

/**
 * @param {HTMLDivElement} infoEl info element
 * @param {string} selectedFeature selected feature code
 * @param {string} lang language
 * @param {function(redux.AnyAction, *): void} onClickItem onClickItem function
 */
const refreshFloorSelect = (infoEl, selectedFeature, lang, onClickItem) => {
  if (!selectedFeature || !infoEl) {
    return;
  }

  const customFloorSelect = /**@type {HTMLDivElement}*/ (
    infoEl.getElementsByClassName('munimap-floor-select')[0]
  );

  while (customFloorSelect.firstChild) {
    customFloorSelect.firstChild.remove();
  }

  const floors = getFloorsByBuildingCode(selectedFeature.substr(0, 5));
  if (floors) {
    floors.sort(floorSortFn);

    createDropdown(floors, customFloorSelect, lang, onClickItem);
    const selectedFloorOption = findSelectedFloorItem(
      customFloorSelect,
      selectedFeature
    );
    if (selectedFloorOption) {
      const captionEl = customFloorSelect.getElementsByClassName('munimap-floor-select-caption')[0];
      captionEl.textContent = selectedFloorOption.textContent;
    } else {
      const text = munimap_lang.getMsg(
        munimap_lang.Translations.INFOBOX_CHOOSE,
        lang
      );
      const captionEl = customFloorSelect.getElementsByClassName('munimap-floor-select-caption')[0];
      captionEl.textContent = text;
    }
    highlightFloors(customFloorSelect, selectedFeature.substr(0, 5), lang);
  }
};

/**
 * @param {ol.Map} map map
 * @param {HTMLElement} infoEl info element
 * @param {State} state state
 */
const refreshElementPosition = (map, infoEl, state) => {
  const opts = {
    extent: slctr.getExtent(state),
    resolution: slctr.getResolution(state),
    selectedFeature: slctr.getSelectedFeature(state),
  };
  const positionInfo = getInfoBoxPosition(infoEl, opts);
  if (positionInfo) {
    const position = positionInfo.coordinate
      ? map.getPixelFromCoordinate(positionInfo.coordinate)
      : positionInfo.position;

    if (position && position.length > 0) {
      const left = !positionInfo.hideTale
        ? (position[0] -= POPUP_TALE_INDENT)
        : position[0];

      infoEl.style.left = left + 'px';
      infoEl.style.top = position[1] + 'px';
      positionInfo.hideTale
        ? infoEl.classList.add('munimap-hide-tale')
        : infoEl.classList.remove('munimap-hide-tale');
    }
  }
};

/**
 * @param {HTMLElement} infoEl info element
 * @param {State} state state
 */
const refreshElementVisibility = (infoEl, state) => {
  infoEl.style.display = slctr.showInfoEl(state) ? '' : 'none';
};

/**
 * @param {string} targetId target id
 * @param {Object} options options
 * @param {string} options.title title
 * @param {string} options.complexTitle complex title
 */
const setBuildingTitle = (targetId, {title, complexTitle}) => {
  const targetEl = TARGET_ELEMENTS_STORE[targetId];
  const infoEl = targetEl.getElementsByClassName('ol-popup munimap-info')[0];
  const complexEl = infoEl.getElementsByClassName('munimap-complex')[0];
  const bel = infoEl.getElementsByClassName('munimap-building')[0];
  complexEl.innerHTML = title;
  bel.innerHTML = complexTitle;
};

export {
  refreshElementPosition,
  refreshElementVisibility,
  refreshFloorSelect,
  setBuildingTitle,
};
