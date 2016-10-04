goog.require('example.module.dialog.Controller');
goog.require('jpad');
goog.require('jpad.module');

/**
 * Init for TECH module.
 * This is called by goog.module.* when the model should be loaded
 * @fileoverview
 */
(function() {
  goog.asserts.assert(jpad.ENABLE_MODULES);
  var moduleInfo = example.module.indexcfg.INFOS.DIALOG;
  var controller = example.module.dialog.Controller.getInstance();
  moduleInfo.controller = controller;
  controller.init(function() {
    jpad.module.setLoaded(moduleInfo);
  });
})();
