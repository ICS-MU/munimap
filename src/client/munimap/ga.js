goog.provide('munimap.ga');

goog.require('goog.array');
goog.require('goog.async.Delay');
goog.require('goog.dom');


/**
 * @type {number}
 * @protected
 * @const
 */
munimap.ga.INIT_DELAY = 2000;


/**
 * @type {boolean}
 * @protected
 */
munimap.ga.initialized = false;


/**
 * @type {Array}
 * @protected
 */
munimap.ga.BEFORE_INIT_QUEUE = [];


/**
 * @type {string}
 * @protected
 */
munimap.ga.TRACKER_NAME = 'munimap';


/**
 * @type {string}
 * @protected
 */
munimap.ga.objectName = 'ga';


/**
 */
munimap.ga.init = function() {
  var delay = new goog.async.Delay(munimap.ga.initInternal,
    munimap.ga.INIT_DELAY);
  delay.start();
};


/**
 * @protected
 */
munimap.ga.initInternal = function() {
  if (goog.isDef(window['GoogleAnalyticsObject'])) {
    munimap.ga.objectName = window['GoogleAnalyticsObject'];
  } else {
    if (goog.isDef(window[munimap.ga.objectName])) {
      munimap.ga.objectName = 'munimapGA';
    }
    (function(i, s, o, g, r) {
      var a, m;
      i['GoogleAnalyticsObject'] = r;
      i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments);
      };
      i[r].l = 1 * new Date();
      a = s.createElement(o);
      m = s.getElementsByTagName(o)[0];
      a.async = 1;
      a.src = g;
      m.parentNode.insertBefore(a, m);
    })(
      window,
      document,
      'script',
      'https://www.google-analytics.com/analytics.js',
      munimap.ga.objectName
      );
  }

  munimap.ga.initialized = true;

  window[munimap.ga.objectName]('create', 'UA-43867643-7', {
    'name': munimap.ga.TRACKER_NAME,
    'cookieName': '_gaMunimap',
    'alwaysSendReferrer': true,
    'cookieDomain': 'none'
  });
  window[munimap.ga.objectName](munimap.ga.TRACKER_NAME + '.send', 'pageview');
  munimap.ga.sendEventInternal('library', 'loaded', document.URL);

  var queue = munimap.ga.BEFORE_INIT_QUEUE;
  queue.forEach(function(args) {
    munimap.ga.sendEventInternal.apply(undefined, args);
  });
  goog.array.clear(queue);
};


/**
 * @param {string} category
 * @param {string} action
 * @param {(string|!Object)=} opt_labelOrObject eventLabel or fields object
 * @param {number=} opt_value eventValue
 *      - only when previous parameter is string
 * @param {Object=} opt_fieldsObject fields object
 */
munimap.ga.sendEvent =
  function(category, action, opt_labelOrObject, opt_value, opt_fieldsObject) {
    var queue = munimap.ga.BEFORE_INIT_QUEUE;
    if (munimap.ga.initialized) {
      munimap.ga.sendEventInternal.apply(undefined, arguments);
    } else {
      queue.push(arguments);
    }
  };


/**
 * @param {string} category
 * @param {string} action
 * @param {(string|!Object)=} opt_labelOrObject eventLabel or fields object
 * @param {number=} opt_value eventValue
 *      - only when previous parameter is string
 * @param {Object=} opt_fieldsObject fields object
 * @protected
 */
munimap.ga.sendEventInternal =
  function(category, action, opt_labelOrObject, opt_value, opt_fieldsObject) {

    if (opt_labelOrObject instanceof Object) {
      var fieldsObject = opt_labelOrObject;
      fieldsObject.hitType = 'event';
      fieldsObject.eventCategory = category;
      fieldsObject.eventAction = action;

      window[munimap.ga.objectName](
        munimap.ga.TRACKER_NAME + '.send',
        fieldsObject);
    } else {
      var label = opt_labelOrObject;
      window[munimap.ga.objectName](
        munimap.ga.TRACKER_NAME + '.send',
        'event',
        category,
        action,
        label,
        opt_value, opt_fieldsObject);
    }
  };
