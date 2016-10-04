goog.provide('jpad.module.IController');



/**
 * An interface for code module contoller.
 * @interface
 */
jpad.module.IController = function() {};


/**
 * Initialize the module.
 * @param {Function} callback
 */
jpad.module.IController.prototype.init = function(callback) {};
