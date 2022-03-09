/**
 * @module feature/optpoi
 */
import {Ids, UID_PREFIX} from './optpoi.constants.js';
import {isString} from '../utils/utils.js';

/**
 * @typedef {import("./feature.js").TypeOptions} TypeOptions
 * @typedef {import("ol/Feature").default} ol.Feature
 */

/**
 * @param {string|ol.Feature} maybeCtgUid uid
 * @return {boolean} whether is ctg uid
 */
const isCtgUid = (maybeCtgUid) => {
  if (!isString(maybeCtgUid)) {
    return false;
  }
  maybeCtgUid = maybeCtgUid.toString();
  const parts = maybeCtgUid.split(':');
  return (
    parts.length === 2 &&
    parts[0] === UID_PREFIX &&
    Object.values(Ids).includes(parts[1])
  );
};

export {isCtgUid};
