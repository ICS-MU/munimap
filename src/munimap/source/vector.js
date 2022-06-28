import VectorSource, {VectorSourceEvent} from 'ol/source/Vector.js';

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
 * @typedef {'mm:loadstart'|'mm:loadend'|'mm:featuresadded'} CustomVectorEventTypes
 */

/**
 * @type {{
 *    MMLOADSTART: CustomVectorEventTypes,
 *    MMLOADEND: CustomVectorEventTypes,
 *    MMFEATURESADDED: CustomVectorEventTypes
 * }}
 */
const CustomVectorEventType = {
  MMLOADSTART: 'mm:loadstart',
  MMLOADEND: 'mm:loadend',
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

    if (opt_options && (opt_options.loader || opt_options.url)) {
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
          new VectorSourceEvent(CustomVectorEventType.MMLOADSTART)
        );
      }
      this.loadingCounter_ += 1;
    });

    this.on(['featuresloadend', 'featuresloaderror'], (evt) => {
      this.loadingCounter_ -= 1;

      if (this.loadingCounter_ === 0) {
        this.dispatchEvent(
          new VectorSourceEvent(CustomVectorEventType.MMLOADEND)
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
    this.attachCustomListeners_();
    super.setLoader(loader);
  }

  /**
   * @return {boolean} whether is source still loading
   */
  isLoading() {
    return this.loadingCounter_ > 0;
  }
}

export default EnhancedVectorSource;
export {CustomVectorEventType};
