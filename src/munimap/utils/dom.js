/**
 * @module utils/dom
 */

/**
 * @param {HTMLElement} element element
 * @return {object} size
 *
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */
export const getElementSize = (element) => {
  let result;
  if (element.style.display === 'none') {
    const style = element.style;
    const origDisplay = style.display;
    const origVisibility = style.visibility;
    const origPosition = style.position;

    style.visibility = 'hidden';
    style.position = 'absolute';
    style.display = 'inline';

    result = {width: element.offsetWidth, height: element.offsetHeight};

    style.display = origDisplay;
    style.position = origPosition;
    style.visibility = origVisibility;
  } else {
    result = {width: element.offsetWidth, height: element.offsetHeight};
  }

  return result;
};
