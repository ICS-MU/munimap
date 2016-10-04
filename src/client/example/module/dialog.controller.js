goog.provide('example.module.dialog.Controller');

goog.require('goog.ui.Dialog');
goog.require('jpad.module.IController');



/**
 * @constructor
 * @implements {jpad.module.IController}
 */
example.module.dialog.Controller = function() {
};
goog.addSingletonGetter(example.module.dialog.Controller);


/**
 * @param {Function} callback
 */
example.module.dialog.Controller.prototype.init = function(callback) {
  var btnel = goog.dom.getElement('link-dialog');
  goog.events.listen(btnel, 'click', function(e) {
    console.log('another click');
    e.preventDefault();
    this.showDialog();
  }, false, this);

  this.showDialog();

  callback();
};


/**
 */
example.module.dialog.Controller.prototype.showDialog = function() {
  var dialog = new goog.ui.Dialog();
  dialog.setContent('I am dialog from "dialog" module.');
  dialog.setTitle('Hello!');
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.createYesNoCancel());
  dialog.setVisible(true);
};
