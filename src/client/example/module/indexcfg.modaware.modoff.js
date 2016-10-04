goog.provide('example.module.indexcfg.modaware');

goog.require('example.module.dialog.Controller');
goog.require('example.module.indexcfg');


/**
 * @fileoverview If the app is compiled with modules DISABLED, then we need to
 * set controller of each module except main one.
 */
(function() {
  goog.asserts.assert(!jpad.ENABLE_MODULES);
  var infos = example.module.indexcfg.INFOS;
  infos.DIALOG.controller = example.module.dialog.Controller.getInstance();
})();
