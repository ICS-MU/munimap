goog.provide('munimap.building');
goog.provide('munimap.building.load');

goog.require('assert');
goog.require('munimap.feature');
goog.require('munimap.lang');
goog.require('munimap.load');
goog.require('munimap.map');
goog.require('munimap.store');
goog.require('munimap.type');
goog.require('munimap.unit');


/**
 * @type {RegExp}
 * @protected
 */
munimap.building.CODE_REGEX = /^[A-Z]{3}[0-9]{2}$/gi;


/**
 * @type {RegExp}
 * @protected
 */
munimap.building.LIKE_EXPR_REGEX = /^[A-Z_]{3}[0-9_]{2}$/gi;


/**
 * @type {string}
 * @protected
 */
munimap.building.COMPLEX_FIELD_NAME = 'areal';


/**
 * @type {string}
 */
munimap.building.COMPLEX_ID_FIELD_NAME = 'arealId';


/**
 * @type {string}
 */
munimap.building.LOCATION_CODE_FIELD_NAME = 'polohKod';


/**
 * @type {string}
 */
munimap.building.UNITS_FIELD_NAME = 'pracoviste';


/**
 * @type {ol.source.Vector}
 * @const
 */
munimap.building.STORE = new ol.source.Vector({
  loader: goog.partial(
      munimap.building.featuresForMap,
      {
        type: function() {
          return munimap.building.TYPE;
        },
        processor: munimap.building.load.processor
      }
  ),
  strategy: /** @type {ol.LoadingStrategy} */(
      ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
        tileSize: 512
      })))
});


/**
 * @param {munimap.load.featuresForMap.Options} options
 * @param {ol.Extent} extent
 * @param {number} resolution
 * @param {ol.proj.Projection} projection
 * @return {goog.Thenable<Array<ol.Feature>>} promise of features contained
 * in server response
 * @this {ol.source.Vector}
 */
munimap.building.featuresForMap =
    function(options, extent, resolution, projection) {
  return munimap.load.featuresForMap(options, extent, resolution, projection).
      then(function(buildings) {
        if (buildings.length) {
          munimap.LIST.forEach(function(map) {
            var view = map.getView();
            var res = view ? view.getResolution() : null;
            if (res) {
              munimap.cluster.updateClusteredFeatures(map, res);
            }
          });
        }
        return goog.Promise.resolve(buildings);
      });
};


/**
 *
 * @type {munimap.type.Options}
 */
munimap.building.TYPE = {
  primaryKey: munimap.building.LOCATION_CODE_FIELD_NAME,
  serviceUrl: munimap.load.MUNIMAP_URL,
  store: munimap.building.STORE,
  layerId: 2,
  name: 'building'
};


/**
 * @type {string}
 * @const
 */
munimap.building.LAYER_ID = 'building';


/**
 * @type {string}
 * @const
 */
munimap.building.LABEL_LAYER_ID = 'building-label';


/**
 * @param {string} code
 */
munimap.building.assertCode = function(code) {
  assert(!!munimap.building.isCode(code),
      'Location code of building should consist of 3 letters and 2 digits.');
};


/**
 * @param {ol.Feature} feature
 * @return {boolean}
 */
munimap.building.isBuilding = function(feature) {
  var code = feature.get(munimap.building.LOCATION_CODE_FIELD_NAME);
  return goog.isString(code) && munimap.building.isCode(code);
};


/**
 * @param {string} maybeCode
 * @return {boolean}
 */
munimap.building.isCode = function(maybeCode) {
  return !!maybeCode.match(munimap.building.CODE_REGEX);
};


/**
 * @param {string} maybeLikeExpr
 * @return {boolean}
 */
munimap.building.isLikeExpr = function(maybeLikeExpr) {
  return !!maybeLikeExpr.match(munimap.building.LIKE_EXPR_REGEX) &&
      maybeLikeExpr.indexOf('_') >= 0;
};


/**
 * @param {string} maybeCodeOrLikeExpr
 * @return {boolean}
 */
munimap.building.isCodeOrLikeExpr = function(maybeCodeOrLikeExpr) {
  return munimap.building.isCode(maybeCodeOrLikeExpr) ||
      munimap.building.isLikeExpr(maybeCodeOrLikeExpr);
};


/**
 * @param {string} code
 */
munimap.building.assertCodeOrLikeExpr = function(code) {
  assert(!!code.match(munimap.building.LIKE_EXPR_REGEX),
      'Location code of building should consist of 3 letters and 2 digits. ' +
      'Any of these characters might be replaced with _ wildcard.');
};


/**
 * @param {munimap.feature.clickHandlerOptions} options
 * @return {boolean}
 */
munimap.building.isClickable = function(options) {
  var feature = options.feature;
  var map = options.map;
  var resolution = options.resolution;

  if (munimap.range.contains(munimap.floor.RESOLUTION, resolution)) {
    return !munimap.building.isSelected(feature, map) &&
        munimap.building.hasInnerGeometry(feature);
  } else if (munimap.building.hasInnerGeometry(feature)) {
    var markers = munimap.marker.getStore(map).getFeatures();
    return markers.indexOf(feature) >= 0 ||
        resolution < munimap.complex.RESOLUTION.max;
  }
  return false;
};


/**
 * @param {munimap.feature.clickHandlerOptions} options
 */
munimap.building.featureClickHandler = function(options) {
  var feature = options.feature;
  var map = options.map;
  var pixel = options.pixel;
  var resolution = options.resolution;

  var isVisible =
      munimap.range.contains(munimap.floor.RESOLUTION, resolution);
  if (!isVisible) {
    var point = munimap.feature.getClosestPointToPixel(map, feature, pixel);
    munimap.map.zoomToPoint(map, point, munimap.floor.RESOLUTION.max);
  }
  munimap.changeFloor(map, feature);
  if (isVisible) {
    munimap.info.refreshVisibility(map);
  }
};


/**
 * @param {ol.Feature} building
 * @return {boolean}
 */
munimap.building.hasInnerGeometry = function(building) {
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
munimap.building.getByCode = function(code) {
  code = code.substr(0, 5);
  var features = munimap.building.STORE.getFeatures();
  var building = features.find(function(feature) {
    var idProperty = munimap.building.TYPE.primaryKey;
    return feature.get(idProperty) === code;
  });
  return building || null;
};


/**
 * @param {ol.Feature} building
 * @return {string}
 */
munimap.building.getLocationCode = function(building) {
  var result = building.get(munimap.building.LOCATION_CODE_FIELD_NAME);
  goog.asserts.assertString(result);
  return result;
};


/**
 * @param {Array.<ol.Feature>} buildings
 * @return {Array.<ol.Feature>}
 */
munimap.building.filterHeadquaters = function(buildings) {
  return buildings.filter(function(bldg) {
    return munimap.building.getUnits(bldg).length > 0;
  });
};


/**
 * @param {Array.<ol.Feature>} buildings
 * @return {Array.<ol.Feature>}
 */
munimap.building.filterFacultyHeadquaters = function(buildings) {
  return buildings.filter(function(bldg) {
    return munimap.building.getUnits(bldg).some(function(unit) {
      return munimap.unit.getPriority(unit) > 0;
    });
  });
};


/**
 * @param {ol.Feature} building
 * @param {ol.Map} map
 * @return {boolean}
 */
munimap.building.isSelected = function(building, map) {
  goog.asserts.assert(munimap.building.isBuilding(building));
  var locCode = munimap.building.getLocationCode(building);
  var selectedBuilding = munimap.getProps(map).selectedBuilding;
  return locCode === selectedBuilding;
};


/**
 * @param {ol.Extent} extent
 * @param {ol.Map} map
 * @return {boolean}
 */
munimap.building.isSelectedInExtent = function(extent, map) {
  var selectedBuilding = munimap.getProps(map).selectedBuilding;
  if (goog.isDefAndNotNull(selectedBuilding)) {
    var building = munimap.building.getByCode(selectedBuilding);
    var geom = building.getGeometry();
    return geom.intersectsExtent(extent);
  }
  return false;
};


/**
 * @param {ol.Map} map
 */
munimap.building.refreshSelected = function(map) {
  var resolution = map.getView().getResolution();
  goog.asserts.assertNumber(resolution);
  var size = map.getSize();
  if (goog.isDef(size)) {
    var viewExt = map.getView().calculateExtent(size);
    var refExt =
        ol.extent.buffer(viewExt, munimap.getBufferValue(viewExt));
    var selectedBuilding = munimap.getProps(map).selectedBuilding;
    if (!selectedBuilding ||
        !munimap.building.isSelectedInExtent(refExt, map)) {
      if (munimap.range.contains(munimap.floor.RESOLUTION, resolution)) {
        var selectFeature;
        var maxArea;
        var format = new ol.format.GeoJSON();
        munimap.building.STORE.forEachFeatureIntersectingExtent(refExt,
            function(building) {
              if (munimap.building.hasInnerGeometry(building)) {
                var intersect = munimap.geom.featureExtentIntersect(
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
        munimap.changeFloor(map, selectFeature || null);
      } else {
        munimap.changeFloor(map, null);
      }
    } else {
      munimap.info.refreshElementPosition(map);
    }
  }
};


/**
 * @param {ol.Feature} building
 * @param {string=} opt_separator
 * @return {string} building title without organizational unit
 */
munimap.building.getTitleWithoutOrgUnit = function(building, opt_separator) {
  var result;
  var title = /**@type {string}*/ (building.get(munimap.lang.getMsg(
      munimap.lang.Translations.BUILDING_TITLE_FIELD_NAME)));
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
munimap.building.getDefaultLabel = function(feature, resolution) {
  var result = [];
  var namePart = munimap.building.getNamePart(feature, resolution);
  if (namePart) {
    result.push(namePart);
  }

  var complex = munimap.building.getComplex(feature);
  if (!namePart ||
      !complex || munimap.complex.getBuildingCount(complex) === 1 ||
      resolution < munimap.complex.RESOLUTION.min) {
    var addressPart = munimap.building.getAddressPart(feature, resolution);
    if (addressPart) {
      result.push(addressPart);
    }
  }
  return result.join('\n');
};


/**
 * @param {ol.Feature} feature
 * @param {number=} opt_resolution
 * @return {string}
 */
munimap.building.getNamePart = function(feature, opt_resolution) {
  var units = munimap.building.getUnits(feature);
  var titleParts = munimap.unit.getTitleParts(units);
  return titleParts.join('\n');
};


/**
 * @param {ol.Feature} feature
 * @param {number} resolution
 * @return {string}
 */
munimap.building.getAddressPart = function(feature, resolution) {
  var titleParts = [];
  if (goog.isDefAndNotNull(munimap.building.getComplex(feature))) {
    var bldgAbbr = feature.get(munimap.lang.getMsg(
        munimap.lang.Translations.BUILDING_ABBR_FIELD_NAME));
    if (goog.isDefAndNotNull(bldgAbbr)) {
      if (munimap.range.contains(munimap.floor.RESOLUTION, resolution)) {
        var bldgType = feature.get(munimap.lang.getMsg(
            munimap.lang.Translations.BUILDING_TYPE_FIELD_NAME));
        if (goog.isDefAndNotNull(bldgType)) {
          goog.asserts.assertString(bldgAbbr);
          goog.asserts.assertString(bldgType);
          var units = munimap.building.getUnits(feature);
          if (units.length === 0) {
            titleParts.push(munimap.style.alignTextToRows([bldgType,
              bldgAbbr], ' '));
          } else {
            titleParts.push(bldgType + ' ' + bldgAbbr);
          }
        }
      } else {
        titleParts.push(bldgAbbr);
      }
    } else {
      titleParts.push(munimap.building.getTitleWithoutOrgUnit(feature, '\n'));
    }
  } else {
    titleParts.push(munimap.building.getTitleWithoutOrgUnit(feature, '\n'));
  }
  return titleParts.join('\n');
};


/**
 * @param {ol.Feature} building
 * @return {ol.Feature}
 */
munimap.building.getComplex = function(building) {
  var result = building.get(munimap.building.COMPLEX_FIELD_NAME);
  goog.asserts.assert(result === null || result instanceof ol.Feature);
  return result;
};


/**
 * @param {ol.Feature} building
 * @return {Array<ol.Feature>}
 */
munimap.building.getUnits = function(building) {
  var result = building.get(munimap.building.UNITS_FIELD_NAME);
  goog.asserts.assertArray(result);
  return result;
};


/**
 * @param {ol.Feature} building
 * @return {Array<ol.Feature>}
 */
munimap.building.getFaculties = function(building) {
  var units = munimap.building.getUnits(building);
  var result = units.filter(function(unit) {
    return munimap.unit.getPriority(unit) > 0;
  });
  return result;
};


/**
 * @param {munimap.load.Processor.Options} options
 * @return {goog.Thenable<munimap.load.Processor.Options>}
 * @protected
 */
munimap.building.load.complexProcessor = function(options) {
  var newBuildings = options.new;
  var complexIdsToLoad = [];
  var buildingsToLoadComplex = [];
  newBuildings.forEach(function(building) {
    var complexId = building.get(munimap.building.COMPLEX_ID_FIELD_NAME);
    if (goog.isNumber(complexId)) {
      var complex = munimap.complex.getById(complexId);
      if (complex) {
        building.set(munimap.building.COMPLEX_FIELD_NAME, complex);
      } else {
        complexIdsToLoad.push(complexId);
        buildingsToLoadComplex.push(building);
      }
    } else {
      building.set(munimap.building.COMPLEX_FIELD_NAME, null);
    }
  });

  goog.array.removeDuplicates(complexIdsToLoad);
  if (complexIdsToLoad.length) {
    //    console.log('complexIds', complexIdsToLoad);
    return munimap.complex.loadByIds({
      ids: complexIdsToLoad,
      processor: munimap.building.load.complexUnitsProcessor
    }).then(function(complexes) {
      buildingsToLoadComplex.forEach(function(building) {
        var complexId = building.get(munimap.building.COMPLEX_ID_FIELD_NAME);
        var complex = munimap.complex.getById(complexId, complexes);
        if (!complex) {
          throw new Error('Complex ' + complexId + ' not found.');
        }
        building.set(munimap.building.COMPLEX_FIELD_NAME, complex || null);
        //        console.log('complex of building',
        //            munimap.building.getTitleWithoutOrgUnit(building)+':',
        //            munimap.building.getComplex(building).get('nazevPrez')
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
 * @param {munimap.load.Processor.Options} options
 * @return {goog.Thenable<munimap.load.Processor.Options>}
 * @protected
 */
munimap.building.load.complexUnitsProcessor = function(options) {
  var newComplexes = options.new;
  var complexIdsToLoad = newComplexes.map(function(complex) {
    return complex.get(munimap.complex.ID_FIELD_NAME);
  });

  if (complexIdsToLoad.length) {
    return munimap.unit.loadByHeadquartersComplexIds(complexIdsToLoad)
        .then(function(units) {
          newComplexes.forEach(function(complex) {
            var complexUnits = units.filter(function(unit) {
              return unit.get('areal_sidelni_id') ===
                complex.get(munimap.complex.ID_FIELD_NAME);
            });
            complex.set(munimap.complex.UNITS_FIELD_NAME, complexUnits);
          });
          return goog.Promise.resolve(options);
        });
  } else {
    return goog.Promise.resolve(options);
  }
};


/**
 * @param {munimap.load.Processor.Options} options
 * @return {goog.Thenable<munimap.load.Processor.Options>}
 * @protected
 */
munimap.building.load.unitsProcessor = function(options) {
  var newBuildings = options.new;
  var buildingIdsToLoad = newBuildings.map(function(building) {
    return building.get('inetId');
  });

  if (buildingIdsToLoad.length) {
    return munimap.unit.loadByHeadquartersIds(buildingIdsToLoad)
        .then(function(units) {
          //console.log('loaded units', units);
          newBuildings.forEach(function(building) {
            var buildingUnits = units.filter(function(unit) {
              return unit.get('budova_sidelni_id') === building.get('inetId');
            });
            building.set(munimap.building.UNITS_FIELD_NAME, buildingUnits);
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
 * @param {munimap.load.Processor.Options} options
 * @return {goog.Thenable<munimap.load.Processor.Options>}
 */
munimap.building.load.processor = function(options) {
  return goog.Promise.all([
    munimap.building.load.complexProcessor(options),
    munimap.building.load.unitsProcessor(options)
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
