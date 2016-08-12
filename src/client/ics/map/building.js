goog.provide('ics.map.building');
goog.provide('ics.map.building.load');

goog.require('ics.map.load');
goog.require('ics.map.store');
goog.require('ics.map.type');
goog.require('ics.map.unit');
goog.require('ol.format.GeoJSON');
goog.require('ol.loadingstrategy');
goog.require('ol.source.Vector');
goog.require('ol.tilegrid.TileGrid');


/**
 * @type {?string}
 */
ics.map.building.active = null;


/**
 * @type {RegExp}
 * @protected
 */
ics.map.building.CODE_REGEX = /^[A-Z]{3}[0-9]{2}$/gi;


/**
 * @type {RegExp}
 * @protected
 */
ics.map.building.LIKE_EXPR_REGEX = /^[A-Z_]{3}[0-9_]{2}$/gi;


/**
 * @type {string}
 */
ics.map.building.ABBR_FIELD_NAME = 'oznaceni';


/**
 * @type {string}
 * @protected
 */
ics.map.building.COMPLEX_FIELD_NAME = 'areal';


/**
 * @type {string}
 */
ics.map.building.COMPLEX_ID_FIELD_NAME = 'arealId';


/**
 * @type {string}
 */
ics.map.building.TITLE_FIELD_NAME = 'nazev';


/**
 * @type {string}
 */
ics.map.building.TYPE_FIELD_NAME = 'budovaTyp';


/**
 * @type {string}
 */
ics.map.building.UNITS_FIELD_NAME = 'pracoviste';


/**
 * @type {ol.source.Vector}
 * @const
 */
ics.map.building.STORE = new ol.source.Vector({
  loader: goog.partial(
      ics.map.load.featuresForMap,
      {
        type: function() {
          return ics.map.building.TYPE;
        },
        processor: ics.map.building.load.processor
      }
  ),
  strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
    tileSize: 512
  }))
});


/**
 *
 * @type {ics.map.type.Options}
 */
ics.map.building.TYPE = {
  primaryKey: 'polohKod',
  serviceUrl: ics.map.load.MUNIMAP_URL,
  store: ics.map.building.STORE,
  layerId: 2,
  name: 'building'
};


/**
 * @param {string} code
 */
ics.map.building.assertCode = function(code) {
  goog.asserts.assert(!!ics.map.building.isCode(code),
      'Location code of building should consist of 3 letters and 2 digits.');
};


/**
 * @param {ol.Feature} feature
 */
ics.map.building.assertBuilding = function(feature) {
  goog.asserts.assert(!!ics.map.building.isBuilding(feature),
      'Feature does not have value of building\'s primary key.');
};


/**
 * @param {ol.Feature} feature
 * @return {boolean}
 */
ics.map.building.isBuilding = function(feature) {
  var code = feature.get('polohKod');
  return goog.isString(code) && ics.map.building.isCode(code);
};


/**
 * @param {string} maybeCode
 * @return {boolean}
 */
ics.map.building.isCode = function(maybeCode) {
  return !!maybeCode.match(ics.map.building.CODE_REGEX);
};


/**
 * @param {string} maybeLikeExpr
 * @return {boolean}
 */
ics.map.building.isLikeExpr = function(maybeLikeExpr) {
  return !!maybeLikeExpr.match(ics.map.building.LIKE_EXPR_REGEX) &&
      maybeLikeExpr.indexOf('_') >= 0;
};


/**
 * @param {string} maybeCodeOrLikeExpr
 * @return {boolean}
 */
ics.map.building.isCodeOrLikeExpr = function(maybeCodeOrLikeExpr) {
  return ics.map.building.isCode(maybeCodeOrLikeExpr) ||
      ics.map.building.isLikeExpr(maybeCodeOrLikeExpr);
};


/**
 * @param {string} code
 */
ics.map.building.assertCodeOrLikeExpr = function(code) {
  goog.asserts.assert(!!code.match(ics.map.building.LIKE_EXPR_REGEX),
      'Location code of building should consist of 3 letters and 2 digits. ' +
      'Any of these characters might be replaced with _ wildcard.');
};


/**
 * @param {ol.Feature} building
 * @return {boolean}
 */
ics.map.building.hasInnerGeometry = function(building) {
  var hasInnerGeometry =
      /**@type {number}*/ (building.get('maVnitrniGeometrii'));
  var result;
  switch (hasInnerGeometry) {
    case 1:
      result = true;
      break;
    default:
      result = false;
  }
  return result;
};


/**
 * @param {string} code
 * @return {ol.Feature} building
 */
ics.map.building.getByCode = function(code) {
  code = code.substr(0, 5);
  var features = ics.map.building.STORE.getFeatures();
  var building = features.find(function(feature) {
    var idProperty = ics.map.building.TYPE.primaryKey;
    return feature.get(idProperty) === code;
  });
  return building || null;
};


/**
 * @param {ol.Feature} building
 * @return {boolean}
 */
ics.map.building.isActive = function(building) {
  ics.map.building.assertBuilding(building);
  var locCode = /**@type {string}*/(building.get('polohKod'));
  return locCode === ics.map.building.active;
};


/**
 * @param {ol.Extent} extent
 * @return {boolean}
 */
ics.map.building.isActiveInExtent = function(extent) {
  if (goog.isDefAndNotNull(ics.map.building.active)) {
    var building = ics.map.building.getByCode(ics.map.building.active);
    var geom = building.getGeometry();
    return geom.intersectsExtent(extent);
  }
  return false;
};


/**
 * @param {ol.Map} map
 */
ics.map.building.refreshActive = function(map) {
  var resolution = map.getView().getResolution();
  goog.asserts.assertNumber(resolution);
  var size = map.getSize();
  if (goog.isDef(size)) {
    var viewExt = map.getView().calculateExtent(size);
    var refExt =
        ol.extent.buffer(viewExt, ics.map.getBufferValue(viewExt));
    if (!ics.map.building.active ||
        !ics.map.building.isActiveInExtent(refExt)) {
      if (ics.map.range.contains(ics.map.floor.RESOLUTION, resolution)) {
        var selectFeature;
        var maxArea;
        var format = new ol.format.GeoJSON();
        ics.map.building.STORE.forEachFeatureIntersectingExtent(refExt,
            function(building) {
              if (ics.map.building.hasInnerGeometry(building)) {
                var intersect = ics.map.geom.featureExtentIntersect(
                    building, refExt, format);
                var geom = intersect.getGeometry();
                if (geom instanceof ol.geom.Polygon ||
                    geom instanceof ol.geom.MultiPolygon) {
                  var area = geom.getArea();
                  if (!goog.isDef(maxArea) || area > maxArea) {
                    maxArea = area;
                    selectFeature = building;
                  }
                }
              }
            });
        ics.map.changeFloor(map, selectFeature || null);
      } else {
        ics.map.changeFloor(map, null);
      }
    } else {
      ics.map.info.refreshElementPosition(map);
    }
  }
};


/**
 * @param {ol.Feature} building
 * @param {string=} opt_separator
 * @return {string} building title without organizational unit
 */
ics.map.building.getTitleWithoutOrgUnit = function(building, opt_separator) {
  var result;
  var title =
      /**@type {string}*/ (building.get(ics.map.building.TITLE_FIELD_NAME));
  result = title.split(', ');
  result.shift();
  result.reverse();
  result = result.join(opt_separator || ', ');
  return result;
};


/**
 * @param {ol.Feature} feature
 * @param {number} resolution
 * @return {string}
 */
ics.map.building.getLabel = function(feature, resolution) {
  var titleParts = [];
  var units = ics.map.building.getUnits(feature);
  if (units.length > 0) {
    if (units.length > 3) {
      var unitAbbrs = [];
      units.forEach(function(unit) {
        unitAbbrs.push(
            /**@type {string}*/(unit.get(ics.map.unit.ABBR_FIELD_NAME)));
      });
      titleParts.push(unitAbbrs.join(', '));
    } else {
      units.forEach(function(unit) {
        titleParts.push(/**@type {string}*/
            (unit.get(ics.map.unit.TITLE_CS_FIELD_NAME)));
      });
    }
  }
  if (goog.isDefAndNotNull(
      feature.get(ics.map.building.COMPLEX_ID_FIELD_NAME))) {
    var bldgLabel = feature.get(ics.map.building.ABBR_FIELD_NAME);
    if (goog.isDefAndNotNull(bldgLabel)) {
      if (ics.map.range.contains(ics.map.floor.RESOLUTION, resolution)) {
        var bldgType = feature.get(ics.map.building.TYPE_FIELD_NAME);
        if (goog.isDefAndNotNull(bldgType)) {
          goog.asserts.assertString(bldgLabel);
          goog.asserts.assertString(bldgType);
          if (units.length === 0) {
            titleParts.push(ics.map.style.alignTextToRows([bldgType,
              bldgLabel], ' '));
          } else {
            titleParts.push(bldgType + ' ' + bldgLabel);
          }
        }
      } else {
        titleParts.push(bldgLabel);
      }
    } else {
      titleParts.push(ics.map.building.getTitleWithoutOrgUnit(feature, '\n'));
    }
  } else {
    titleParts.push(ics.map.building.getTitleWithoutOrgUnit(feature, '\n'));
  }
  return titleParts.join('\n');
};


/**
 * @param {ol.Feature} building
 * @return {ol.Feature}
 */
ics.map.building.getComplex = function(building) {
  var result = building.get(ics.map.building.COMPLEX_FIELD_NAME);
  goog.asserts.assert(result === null || result instanceof ol.Feature);
  return result;
};


/**
 * @param {ol.Feature} building
 * @return {Array<ol.Feature>}
 */
ics.map.building.getUnits = function(building) {
  var result = building.get(ics.map.building.UNITS_FIELD_NAME);
  goog.asserts.assertArray(result);
  return result;
};


/**
 * @param {ics.map.load.Processor.Options} options
 * @return {goog.Thenable<ics.map.load.Processor.Options>}
 * @protected
 */
ics.map.building.load.complexProcessor = function(options) {
  var newBuildings = options.new;
  var complexIdsToLoad = [];
  var buildingsToLoadComplex = [];
  newBuildings.forEach(function(building) {
    var complexId = building.get(ics.map.building.COMPLEX_ID_FIELD_NAME);
    if (goog.isNumber(complexId)) {
      var complex = ics.map.complex.getById(complexId);
      if (complex) {
        building.set(ics.map.building.COMPLEX_FIELD_NAME, complex);
      } else {
        complexIdsToLoad.push(complexId);
        buildingsToLoadComplex.push(building);
      }
    } else {
      building.set(ics.map.building.COMPLEX_FIELD_NAME, null);
    }
  });

  goog.array.removeDuplicates(complexIdsToLoad);
  if (complexIdsToLoad.length) {
    //    console.log('complexIds', complexIdsToLoad);
    return ics.map.complex.loadByIds({
      ids: complexIdsToLoad,
      processor: ics.map.building.load.complexUnitsProcessor
    }).then(function(complexes) {
      buildingsToLoadComplex.forEach(function(building) {
        var complexId = building.get(ics.map.building.COMPLEX_ID_FIELD_NAME);
        var complex = ics.map.complex.getById(complexId, complexes);
        if (!complex) {
          throw new Error('Complex ' + complexId + ' not found.');
        }
        building.set(ics.map.building.COMPLEX_FIELD_NAME, complex || null);
        //        console.log('complex of building',
        //            ics.map.building.getTitleWithoutOrgUnit(building)+':',
        //            ics.map.building.getComplex(building).get('nazevPrez')
        //            );
      });
      return goog.Promise.resolve(options);
    });
  } else {
    //    console.log('all complexIds already loaded');
    return goog.Promise.resolve(options);
  }


};


/**
 * @param {ics.map.load.Processor.Options} options
 * @return {goog.Thenable<ics.map.load.Processor.Options>}
 * @protected
 */
ics.map.building.load.complexUnitsProcessor = function(options) {
  var newComplexes = options.new;
  var complexIdsToLoad = newComplexes.map(function(complex) {
    return complex.get('inetId');
  });

  if (complexIdsToLoad.length) {
    return ics.map.unit.loadByHeadquartersComplexIds(complexIdsToLoad)
        .then(function(units) {
          newComplexes.forEach(function(complex) {
            var complexUnits = units.filter(function(unit) {
              return unit.get('areal_sidelni_id') === complex.get('inetId');
            });
            complex.set(ics.map.complex.UNITS_FIELD_NAME, complexUnits);
            //            if(complexUnits.length) {
            //              console.log('complex units',
            //                  complex.get('nazevPrez')+':',
            //                  ics.map.complex.getUnits(complex).map(function(unit) {
            //                    return unit.get('zkratka_cs');
            //                  })
            //                  );
            //            }
          });
          return goog.Promise.resolve(options);
        });
  } else {
    return goog.Promise.resolve(options);
  }
};


/**
 * @param {ics.map.load.Processor.Options} options
 * @return {goog.Thenable<ics.map.load.Processor.Options>}
 * @protected
 */
ics.map.building.load.unitsProcessor = function(options) {
  var newBuildings = options.new;
  var buildingIdsToLoad = newBuildings.map(function(building) {
    return building.get('inetId');
  });

  if (buildingIdsToLoad.length) {
    return ics.map.unit.loadByHeadquartersIds(buildingIdsToLoad)
        .then(function(units) {
          //console.log('loaded units', units);
          newBuildings.forEach(function(building) {
            var buildingUnits = units.filter(function(unit) {
              return unit.get('budova_sidelni_id') === building.get('inetId');
            });
            building.set(ics.map.building.UNITS_FIELD_NAME, buildingUnits);
            //        if(buildingUnits.length) {
            //          console.log('building units',
            //              ics.map.building.getTitleWithoutOrgUnit(building)+':',
            //              ics.map.building.getUnits(building).map(function(unit) {
            //                return unit.get('zkratka_cs');
            //              })
            //              );
            //        }
          });
          return goog.Promise.resolve(options);
        });
  } else {
    //    console.log('all complexIds already loaded');
    return goog.Promise.resolve(options);
  }


};


/**
 * Load complex of the building and units of the building.
 * @param {ics.map.load.Processor.Options} options
 * @return {goog.Thenable<ics.map.load.Processor.Options>}
 */
ics.map.building.load.processor = function(options) {
  return goog.Promise.all([
    ics.map.building.load.complexProcessor(options),
    ics.map.building.load.unitsProcessor(options)
  ]).then(function(result) {
    goog.asserts.assertArray(result);
    result.forEach(function(opts) {
      goog.asserts.assert(opts === options);
      goog.asserts.assert(goog.array.equals(opts.all, options.all));
      goog.asserts.assert(goog.array.equals(opts.new, options.new));
      goog.asserts.assert(goog.array.equals(opts.existing, options.existing));
    });
    return goog.Promise.resolve(result[0]);
  });
};
