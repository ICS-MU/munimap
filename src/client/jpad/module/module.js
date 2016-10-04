goog.provide('jpad.module');
goog.provide('jpad.module.ControllerGetter');
goog.provide('jpad.module.Info');

goog.require('jpad.module.Manager');


/**
 * @typedef {function(): jpad.module.IController}
 */
jpad.module.ControllerGetter;


/**
 * @typedef {{
 *   id: string,
 *   controller: (undefined|jpad.module.IController)
 * }}
 */
jpad.module.Info;


/**
 * Return true if module was already loaded and controller.init() called.
 * @param {jpad.module.Info} module
 * @return {boolean}
 */
jpad.module.isLoaded = function(module) {
  return jpad.module.Manager.getInstance().isLoaded(module);
};


/**
 * Make sense to use it only if jpad.ENABLE_MODULES is true.
 * @param {jpad.module.Info} module
 */
jpad.module.setLoaded = function(module) {
  jpad.module.Manager.getInstance().setLoaded(module);
};


/**
 * @param {jpad.module.Info} module A module info.
 * @param {Function=} opt_fn Function to execute when the module has loaded.
 * @param {Object=} opt_handler Optional handler under whose scope to execute
 *     the callback. */
jpad.module.execOnLoad = function(module, opt_fn, opt_handler) {
  jpad.module.Manager.getInstance().execOnLoad(module, opt_fn, opt_handler);
};

