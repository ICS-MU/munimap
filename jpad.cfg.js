'use strict';

var jpad = {
  appPath: '/munimap/',
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
    plovr: 'ics/map/lib/lib.plovr.json',
    filesToPrepend: [
      '_lib/turf/index.js',
      '_lib/webfontloader/webfontloader.js'
    ]
  },
  srcClientMappings: [
    '**/*.png',
    '**/web.config',
    '**/fontello.*'
  ],
  generateSourceMaps: false,
  buildWithModulesOn: false
};

module.exports = jpad;
