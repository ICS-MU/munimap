goog.provide('munimaplib');

goog.require('munimap.create');
goog.require('munimap.reset');
goog.require('polyfill.es6');

console.log(ol.Feature);
console.log(ol.render.Feature);

goog.exportSymbol('munimap.create', munimap.create);
goog.exportSymbol('munimap.reset', munimap.reset);
goog.exportSymbol('munimap.style.alignTextToRows',
    munimap.style.alignTextToRows);
