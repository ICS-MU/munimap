'use strict';

var jpad = {
  appPath: '/munimap/',
  appVersion: '1.8.5',
  olVersion: 'v4.6.4',
  prodDomain: 'maps.muni.cz',
  plovrPattern: 'src/client/**/*.plovr.json',
  plovrHtmlPattern: 'src/client/**/*.html',
  port: 9000,
  modulesOffFolder: 'modoff',
  modulesOnFolder: 'modon',
  libMappings: [
    {
      src: 'bower_components/ol4/css/',
      dest: '_lib/ol4/css/'
    },
    {
      src: 'bower_components/ol4/examples/resources/',
      dest: '_lib/ol4/examples/resources/'
    },
    {
      src: 'bower_components/ol4/examples/popup.css',
      dest: '_lib/ol4/examples/popup.css'
    },
    {
      src: 'bower_components/ol4/munimap/build/',
      dest: '_lib/ol/'
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
    },
    {
      src: 'src/client/munimapext.js',
      dest: 'munimapext.js'
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
    '**/fontello.*',
    '**/*.geojson',
    '**/*.svg'
  ],
  generateSourceMaps: false,
  buildWithModulesOn: false
};

module.exports = jpad;
