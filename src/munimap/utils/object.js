/**
 * Get property from object. Suited for nested objects, e.g. from JSON.
 * @param {function(): T} fn fn
 * @param {S} defaultValue default value
 * @template T
 * @template S
 * @return {T|S} prop
 */
const getPropertySafe = (fn, defaultValue) => {
  try {
    return fn();
  } catch (e) {
    return defaultValue;
  }
};

export {getPropertySafe};
