goog.provide('munimaplib');

goog.require('munimap.create');
goog.require('munimap.ga');
goog.require('munimap.reset');
goog.require('polyfill.es6');


munimap.ga.init();


goog.exportSymbol('munimap.create', munimap.create);
goog.exportSymbol('munimap.reset', munimap.reset);
goog.exportSymbol('munimap.style.alignTextToRows',
    munimap.style.alignTextToRows);
