goog.provide('munimap.ga');

goog.require('goog.array');
goog.require('goog.dom');


/**
 * If to use GA or not. See munimap.ga.init().
 * @type {boolean}
 * @protected
 */
munimap.ga.use = true;


/**
 * @type {string}
 * @protected
 */
munimap.ga.TRACKER_NAME = 'munimap';


/**
 */
munimap.ga.init = function() {
  var scripts = goog.dom.getElementsByTagNameAndClass('script');
  scripts = goog.array.clone(scripts);

  var gaPath = 'https://www.google-analytics.com/analytics.js';
  var gaScript = scripts.find(function(script) {
    return script.src === gaPath;
  });
  if (!gaScript && goog.isDef(window['ga'])) {
    console.error('probably some global variable named "ga" ' +
        'that is not Google Analytics');
    munimap.ga.use = false;
  } else if (!gaScript || !goog.isDef(window['ga'])) {
    console.log('Google Analytics not yet loaded');
    (
     function(i, s, o, g, r) {
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
        'ga'
    );
  }

  ga('create', 'UA-43867643-7', 'auto', {
    'name': munimap.ga.TRACKER_NAME,
    'cookieName': '_gaMunimap',
    'alwaysSendReferrer': true,
    'cookieDomain': 'none'
  });
  ga(munimap.ga.TRACKER_NAME+'.send', 'pageview');
  munimap.ga.sendEvent('library', 'loaded', document.URL);
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
  if (!munimap.ga.use) {
    return;
  }

  if (opt_labelOrObject instanceof Object) {
    var fieldsObject = opt_labelOrObject;
    fieldsObject.hitType = 'event';
    fieldsObject.eventCategory = category;
    fieldsObject.eventAction = action;

    ga(munimap.ga.TRACKER_NAME+'.send', fieldsObject);
  } else {
    var label = opt_labelOrObject;
    ga(munimap.ga.TRACKER_NAME+'.send', 'event', category, action, label,
        opt_value, opt_fieldsObject);
  }
};
