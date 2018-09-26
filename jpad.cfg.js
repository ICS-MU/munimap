'use strict';

var jpad = {
  appPath: '/munimap/',
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  appVersion: '1.1.1',
=======
  appVersion: '1.3.0',
>>>>>>> 941f3c2... version 1.3.0
=======
  appVersion: '1.4.0',
>>>>>>> cbec9ad... Version 1.4.0
=======
  appVersion: '1.5.0',
>>>>>>> 4f4f510... version 1.5.0
=======
  appVersion: '1.6.0',
>>>>>>> 1aaa11a... build 1.6.0
=======
  appVersion: '1.6.1',
>>>>>>> 68bc625... version 1.6.1
  olVersion: 'v3.19.1',
=======
  appVersion: '1.6.2',
=======
  appVersion: '1.6.3',
>>>>>>> b38e626... version 1.6.3
=======
  appVersion: '1.6.4',
>>>>>>> bf0276f... version 1.6.4
=======
  appVersion: '1.6.3',
>>>>>>> 6166ee4... Revert "version 1.6.4"
=======
  appVersion: '1.6.4',
>>>>>>> 3bc63dc... version 1.6.4
=======
  appVersion: '1.6.5',
>>>>>>> 886459e... version 1.6.5
=======
  appVersion: '1.6.6',
>>>>>>> f5b5647... version 1.6.6
=======
  appVersion: '1.7.0',
>>>>>>> d45b889... version 1.7.0
=======
  appVersion: '1.8.0',
>>>>>>> b631aed... version 1.8.0
=======
  appVersion: '1.8.1',
>>>>>>> 6528b04... version 1.8.1
=======
  appVersion: '1.8.2',
>>>>>>> f8ebb5e... version 1.8.2
  olVersion: 'v4.6.4',
>>>>>>> 4c8a284... version 1.6.2
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
      src: 'bower_components/ol3/munimap/build/',
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
