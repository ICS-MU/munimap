goog.provide('jpad.module.Manager');

goog.require('goog.events.EventTarget');
goog.require('goog.module.ModuleManager');
goog.require('jpad');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
jpad.module.Manager = function() {
  goog.events.EventTarget.call(this);

  /**
   * Used only if jpad.ENABLE_MODULES is false.
   * Needed to ensure that controlle.init is called only once.
   * @type {Array<jpad.module.Info>}
   * @private
   */
  this.loadedModules_;
  if (!jpad.ENABLE_MODULES) {
    this.loadedModules_ = [];
  }
};
goog.inherits(jpad.module.Manager, goog.events.EventTarget);
goog.addSingletonGetter(jpad.module.Manager);


/**
 * Return true if module was already loaded and controller.init() called.
 * @param {jpad.module.Info} module
 * @return {boolean}
 */
jpad.module.Manager.prototype.isLoaded = function(module) {
  if (jpad.ENABLE_MODULES) {
    var moduleManager = goog.module.ModuleManager.getInstance();
    var info = moduleManager.getModuleInfo(module.id);
    return info.isLoaded();
  } else {
    return goog.array.contains(this.loadedModules_, module);
  }
};


/**
 * @param {jpad.module.Info} module
 */
jpad.module.Manager.prototype.setLoaded = function(module) {
  if (jpad.ENABLE_MODULES) {
    var moduleManager = goog.module.ModuleManager.getInstance();
    moduleManager.setLoaded(module.id);
  } else {
    this.loadedModules_.push(module);
  }
};


/**
 * @param {jpad.module.Info} module A module info.
 * @param {Function=} opt_fn Function to execute when the module has loaded.
 * @param {Object=} opt_handler Optional handler under whose scope to execute
 *     the callback. */
jpad.module.Manager.prototype.execOnLoad =
    function(module, opt_fn, opt_handler) {
  if (jpad.ENABLE_MODULES) {
    var moduleManager = goog.module.ModuleManager.getInstance();
    moduleManager.execOnLoad(module.id, opt_fn || null, opt_handler);
  } else {
    if (!this.isLoaded(module)) {
      var c = module.controller;
      goog.asserts.assert(!!c, 'Controller of jpad.module "' + module.id +
          '" not yet set.');
      c.init(function() {
        jpad.module.setLoaded(module);
        if (opt_fn) {
          opt_fn.call(opt_handler);
        }
      });
    } else if (opt_fn) {
      opt_fn.call(opt_handler);
    }
  }
};
