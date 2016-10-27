'use strict';

var jpad = {
  appPath: '/munimap/',
  appVersion: '1.0.0',
  olVersion: 'v3.14.2',
  prodDomain: 'maps.muni.cz',
  plovrPattern: 'src/client/**/*.plovr.json',
  plovrHtmlPattern: 'src/client/**/*.html',
  port: 9000,
  modulesOffFolder: 'modoff',
  modulesOnFolder: 'modon',
  libMappings: [
    {
      src: 'bower_components/ol3/css/',
      dest: '_lib/ol3/css/'
    },
    {
      src: 'bower_components/ol3/examples/resources/',
      dest: '_lib/ol3/examples/resources/'
    },
    {
      src: 'bower_components/ol3/examples/popup.css',
      dest: '_lib/ol3/examples/popup.css'
    },
    {
      src: 'bower_components/ol3/munimap/build/ol.js',
      dest: '_lib/ol/ol.js'
    },
    {
      src: 'bower_components/closure-library/closure/goog/css/',
      dest: '_lib/closure-library/closure/goog/css/'
    },
    {
      src: 'bower_components/turf/',
      dest: '_lib/turf/'
    },
    {
      src: 'bower_components/prettyprint/',
      dest: '_lib/prettyprint/'
    },
    {
      src: 'bower_components/webfontloader/webfontloader.js',
      dest: '_lib/webfontloader/webfontloader.js'
    }
  ],
  bundle: {
    plovr: 'munimaplib.plovr.json',
    filesToPrepend: [
      '_lib/ol/ol.js',
      '_lib/turf/index.js',
      '_lib/webfontloader/webfontloader.js'
    ]
  },
  srcClientMappings: [
    '**/*.png',
    '**/fontello.*'
  ],
  generateSourceMaps: false,
  buildWithModulesOn: false
};

module.exports = jpad;
