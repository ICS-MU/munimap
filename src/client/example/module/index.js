goog.provide('example.module.index');

goog.require('example.module.indexcfg');
goog.require('example.module.indexcfg.modaware');
goog.require('goog.Uri');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.module.ModuleLoader');
goog.require('goog.module.ModuleManager');
goog.require('jpad');
goog.require('jpad.module');


/**
 * The main function.
 */
example.module.index = function() {

  var moduleInfos = example.module.indexcfg.INFOS;

  //setup goog.module.* as usual
  if (jpad.ENABLE_MODULES) {
    var moduleManager = goog.module.ModuleManager.getInstance();
    var moduleLoader = new goog.module.ModuleLoader();
    moduleLoader.setDebugMode(true);
    moduleManager.setLoader(moduleLoader);
    moduleManager.setAllModuleInfo(goog.global['PLOVR_MODULE_INFO']);
    var uris = goog.global['PLOVR_MODULE_URIS'];
    if (goog.DEBUG) {
      uris = goog.object.map(uris, function(uri) {
        return uri.replace('http://localhost:9810', '/_compile');
      });
    }
    moduleManager.setModuleUris(uris);
    jpad.module.setLoaded(moduleInfos.APP);
  }

  console.log('app is running with jpad.ENABLE_MODULES=' + jpad.ENABLE_MODULES);

  var firstClick = function(e) {
    e.preventDefault();
    console.log('initial click');
    var moduleInfo = moduleInfos.DIALOG;
    goog.asserts.assert(!jpad.module.isLoaded(moduleInfo));

    if (jpad.ENABLE_MODULES) {
      console.log('Because jpad.ENABLE_MODULES=true, ' +
          'module "' + moduleInfo.id + '" is not downloaded yet and so ' +
          '"message A" will be first and "message B" second');
    } else {
      console.log('Because jpad.ENABLE_MODULES=false, ' +
          'module "' + moduleInfo.id + '" is already downloaded. Furthermore ' +
          'because example.module.dialog.Controller.prototype.init ' +
          'calls callback synchronously, ' +
          '"message B" will be first and "message A" second');
    }
    jpad.module.execOnLoad(moduleInfo, function() {
      console.log('message B');
      goog.asserts.assert(jpad.module.isLoaded(moduleInfo));
    }, this);
    console.log('message A');
  };

  var dgel = goog.dom.getElement('link-dialog');
  goog.events.listenOnce(dgel, 'click', firstClick);

  var modstel = goog.dom.getElement('modules-state');
  goog.dom.setTextContent(modstel,
      jpad.ENABLE_MODULES ? 'enabled' : 'disabled');

  if (jpad.DEV) {
    var uri = new goog.Uri(document.location);
    var path = uri.getPath();
    if (jpad.ENABLE_MODULES) {
      path = path.substring('/modon'.length);
    } else {
      path = '/modon' + path;
    }
    var toggel = goog.dom.getElement('link-toggle-modules');
    toggel.setAttribute('href', path);
    goog.dom.setTextContent(toggel, 'Try it also with ' +
        (jpad.ENABLE_MODULES ? 'disabled' : 'enabled') + ' modules');
  }


};


goog.exportSymbol('main', example.module.index);
