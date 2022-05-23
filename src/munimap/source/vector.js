// @ts-nocheck

import VectorSource, {VectorSourceEvent} from 'ol/source/Vector';
import {VOID} from 'ol/functions';

/**
 * @typedef {import("ol/source/Vector").Options} Options
 * @typedef {import("ol/events").EventsKey} EventsKey
 * @typedef {import("ol/geom/Geometry").default} Geometry
 */

/**
 * @template Return
 * @typedef {import("ol/Observable").OnSignature<CustomVectorEventTypes, VectorSourceEvent, Return> &
 *  import("ol/source/Vector").VectorSourceOnSignature<EventsKey>} CustomVectorSourceOnSignature
 */

/**
 * @typedef {'mm:tilesloadstart'|'mm:tilesloadend'|'mm:featuresadded'} CustomVectorEventTypes
 */

/**
 * @type {{
 *    MMTILESLOADSTART: CustomVectorEventTypes,
 *    MMTILESLOADEND: CustomVectorEventTypes,
 *    MMFEATURESADDED: CustomVectorEventTypes
 * }}
 */
const CustomVectorEventType = {
  MMTILESLOADSTART: 'mm:tilesloadstart',
  MMTILESLOADEND: 'mm:tilesloadend',
  MMFEATURESADDED: 'mm:featuresadded',
};

/**
 * Enhanced vector source class.
 */
class EnhancedVectorSource extends VectorSource {
  /**
   * @param {Options} [opt_options] options
   */
  constructor(opt_options) {
    super(opt_options);

    /**
     * @type {number} loading counter
     * @private
     */
    this.loadingCounter_ = 0;

    /**
     * @type {CustomVectorSourceOnSignature<EventsKey>}
     */
    this.on;

    /**
     * @type {CustomVectorSourceOnSignature<EventsKey>}
     */
    this.once;

    if (this.loader_ != VOID) {
      this.attachCustomListeners_();
    }
  }

  /**
   * Attach custom listeners -
   *    dispatch custom start/end events when all features are loaded
   *    event if loadstrategy is set to 'tile'
   */
  attachCustomListeners_() {
    this.on('featuresloadstart', (evt) => {
      if (this.loadingCounter_ === 0) {
        this.dispatchEvent(
          new VectorSourceEvent(CustomVectorEventType.MMTILESLOADSTART)
        );
      }
      this.loadingCounter_ += 1;
    });

    this.on(['featuresloadend', 'featuresloaderror'], (evt) => {
      this.loadingCounter_ -= 1;

      if (this.loadingCounter_ === 0) {
        this.dispatchEvent(
          new VectorSourceEvent(CustomVectorEventType.MMTILESLOADEND)
        );
      }
    });
  }

  /**
   * Add a batch of features to the source.
   * @param {Array<import("ol/Feature").default<Geometry>>} features Features to add.
   */
  addFeatures(features) {
    super.addFeatures(features);
    this.dispatchEvent(
      new VectorSourceEvent(CustomVectorEventType.MMFEATURESADDED)
    );
  }

  /**
   * Set the new loader of the source. The next render cycle will use the
   * new loader.
   * @param {import("ol/featureloader").FeatureLoader} loader The loader to set.
   */
  setLoader(loader) {
    if (this.loader_ != VOID) {
      this.attachCustomListeners_();
    }
    super.setLoader(loader);
  }
}

export default EnhancedVectorSource;
export {CustomVectorEventType};
