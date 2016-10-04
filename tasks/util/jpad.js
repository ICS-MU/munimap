'use strict';
var url = require('url');
var jpadCfg = require('../../jpad.cfg.js');
var fs = require("fs-extra");
var path = require("path");
var glob = require('glob');
var recast = require('recast');

require('./../../bower_components/closure-library/closure/goog/bootstrap/nodejs');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.asserts');


/**
 * @param {string} filePath
 * @return {Array.<string>} array of folder names on filePath
 */
var getDirNamesOfFile = function(filePath) {
  var dirpath = path.dirname(filePath);
  var dirnames = dirpath.split('/');
  dirnames = goog.array.filter(dirnames, function(name) {
    return name !== '.';
  });
  return dirnames;
};

/**
 * @param {string} namespace namespace from Google Closure
 * @return {Array.<string>} normalized namespace parts
 * (lower case, removed trailing underscores)
 */
var getNamespaceParts = function(namespace) {
  var parts = namespace.toLowerCase().split('.');
  parts = goog.array.map(parts, function(part) {
    return part.replace(/_$/, '');
  });
  return parts;
};


/**
 * @param {string} filePath file path that leads to src/client
 * @param {string=} opt_extension file path extension
 * @return {Array.<string>} normalized namespace parts derived from path
 * and file name
 */
var getFileParts = function(filePath, opt_extension) {
  var fpath = path.relative('src/client', filePath).replace(/\\/g, '/');
  var dirparts = getDirNamesOfFile(fpath);
  if(opt_extension !== undefined) {
    var extname = opt_extension;
  } else {
    var extregex = /((?:\.(?:modon|modoff))?(?:\.dev)?(?:\.plovr)?\.(?:[^.]+))$/;
    var extmatch = fpath.match(extregex);
    extname = extmatch[1];
  }
  var fbasename = path.basename(fpath, extname);
  var fnameparts = fbasename.split('.');
  var firstSamePart = goog.array.find(dirparts, function(dp) {
    var dpidx = fnameparts.indexOf(dp);
    return dpidx === 0;
  });
  var result = [];
  if(firstSamePart) {
    var firstSamePartIdx = dirparts.indexOf(firstSamePart);
    var expectedFNameParts =
        dirparts.slice(firstSamePartIdx, dirparts.length);
    var realParts = fnameparts.slice(0, expectedFNameParts.length);
    if(goog.array.equals(expectedFNameParts, realParts)) {
      goog.array.extend(result, dirparts.slice(0, firstSamePartIdx));
    } else {
      goog.array.extend(result, dirparts);
    }
  } else {
    goog.array.extend(result, dirparts);
  }
  goog.array.extend(result, fnameparts);
  return result;
};


/**
 * @param {Object} $
 * @param {string} htmlPath
 * @param {Object} options
 */
var absolutizePathsInHtml = function($, htmlPath, options) {
  var includeModulesOnFolder = !!options.includeModulesOnFolder;
  var build = !!options.build;
  $('[href]').each(function(i, elem) {
      var href = $(this).attr('href');
      if(!(goog.string.startsWith(href, '/') ||
          goog.string.contains(href, '//'))) {
        href = url.resolve('/'+htmlPath, href);
        href = jpadCfg.appPath + href.substr(1);
        if(includeModulesOnFolder) {
          href = '/'+jpadCfg.modulesOnFolder + href;
        }
        $(this).attr('href', href);
      }
  });
  $('[src]').each(function(i, elem) {
      var src = $(this).attr('src');
      if(!(goog.string.startsWith(src, '/') ||
          goog.string.contains(src, '//'))) {
        src = url.resolve('/'+htmlPath, src);
        src = jpadCfg.appPath + src.substr(1);
        if(includeModulesOnFolder) {
          src = '/'+jpadCfg.modulesOnFolder + src;
        }
        $(this).attr('src', src);
      }
  });
  if(build) {
    $('link[href$=\'/plovr.css\']').remove();
  };
};

/**
 * @param {type} ast
 */
var absolutizePathsInJs = function(ast, jsPath, includeModulesOnFolder) {
  recast.visit(ast, {
    visitLiteral: function(path) {
      var node = path.node;
      if(goog.isString(node.value) &&
          goog.string.startsWith(node.value, './')) {
        var src = node.value;
        src = url.resolve('/'+jsPath, src);
        src = jpadCfg.appPath + src.substr(1);
        if(includeModulesOnFolder) {
          src = '/'+jpadCfg.modulesOnFolder + src;
        }
        //console.log('src', src);
        node.value = src;
        return node;
      }
      this.traverse(path);
    }
  });
};

/**
 * @param {Object} cssobj
 * @param {string} cssPath
 */
var cssImportsToLocal = function(cssobj, cssPath) {
  var processRules = function(rules) {
    goog.array.forEach(rules, function(rule) {
      if(rule.type == 'import') {
        var importVal = rule.import;
        importVal = importVal.replace(
            /(^|^.* )url\(\s*(['"]?)(.+)\1\s*\)($| .*$)/gmi,
            function(match, prefix, wrapper, srcUrl, postfix) {
              var srcUrlObject = url.parse(srcUrl, false, true);
              if(srcUrlObject.host) {
                return prefix + 'url(' + wrapper + srcUrl + wrapper + ')' +
                    postfix;
              }
              var completePath = path.resolve(path.dirname(cssPath), srcUrl);
              var relPath = path.relative('src/client/', completePath);
              relPath = relPath.replace(/\\/g, '/');
              var lm = jpadCfg.libMappings.find(function(lm) {
                return relPath.indexOf(lm.dest) >= 0;
              });
              if(lm) {
                relPath = lm.src + relPath.substr(lm.dest.length);
                relPath = path.relative(path.dirname(cssPath), relPath);
                relPath = relPath.replace(/\\/g, '/');
                return prefix + 'url(' + wrapper + relPath + wrapper + ')' +
                      postfix;
              } else {
                return prefix + 'url(' + wrapper + srcUrl + wrapper + ')' +
                      postfix;
              }
            }
        );
        rule.import = importVal;
      }
    });
  };
  processRules(cssobj.stylesheet.rules);

};

var plovr = {};

/**
 * @param {type} ast
 */
plovr.updatePaths = function(json, plovrSrcPath, plovrDestPath, modulesOn) {
  var srcDir = path.dirname(plovrSrcPath);
  var destDir = path.dirname(plovrDestPath);
  var srcClientDir = path.resolve('./src/client');
  var replacePath = function(pth) {
    var p = path.resolve(srcDir, pth);
    p = path.relative(destDir, p);
    p = p.replace(/\\/g, '/');
    return p;
  };
  
  if(json['closure-library']) {
    json['closure-library'] = replacePath(json['closure-library']);
  }
  if(json["externs"]) {
    json["externs"] = goog.array.map(json["externs"], function(p) {
      return replacePath(p);
    })
  }
  var modFolder = modulesOn ? jpadCfg.modulesOnFolder :
          jpadCfg.modulesOffFolder;
  if(json["paths"]) {
    json["paths"] = goog.array.map(json["paths"], function(p) {
      p = path.normalize(path.resolve(srcDir, p));
      var rp = path.normalize(path.relative(srcClientDir, p));
      if(rp.indexOf('..')!==0 && p.indexOf(srcClientDir)===0) {
        p = path.join('./temp/'+modFolder+'/precompile/client', rp);
        p = path.resolve(p);
        p = path.relative(destDir, p).replace(/\\/g, '/');
        if(rp === '.') {
          p += '/../client'
        }
      } else {
        p = replacePath(p);
      }
      return p;
    });
  }
  if(json["module-output-path"]) {
    var output = json["module-output-path"];
    output = path.relative('./temp/'+modFolder+'/precompile/client', 
        path.resolve(destDir, output));
    output = path.relative(destDir, path.join('./build/client', output))
        .replace(/\\/g, '/');
    json["module-output-path"] = output;
  }
  if(json["module-info-path"]) {
    output = json["module-info-path"];
    output = path.relative('./temp/'+modFolder+'/precompile/client', 
        path.resolve(destDir, output));
    output = path.relative(destDir, path.join('./build/client', output))
        .replace(/\\/g, '/');
    json["module-info-path"] = output;
  }
};

/**
 * @param {string} plovrJsonPath
 * @return {string}
 */
plovr.getCompilerMode = function(plovrJsonPath) {
  
  var getMode = function(pth) {
    var fcontent = fs.readFileSync(pth);
    var json = JSON.parse(fcontent);
    var mode = json['mode'];
    if(mode) {
      return mode;
    } else {
      var inherits = json['inherits'];
      goog.asserts.assert(!!inherits);
      var newPath = path.resolve(path.dirname(pth), inherits);
      return getMode(newPath);
    }
  };
  return getMode(plovrJsonPath);
};

/**
 * @param {string} plovrJsonPath
 * @return {string}
 */
plovr.getSourceMapOutputName = function(plovrJsonPath) {
  var name = plovr.getExplicitSourceMapOutputName(plovrJsonPath);
  return name || plovr.getId(plovrJsonPath) + '.map';
}
  
/**
 * @param {string} plovrJsonPath
 * @return {string}
 */
plovr.getExplicitSourceMapOutputName = function(plovrJsonPath) {
  
  var getName = function(pth) {
    var fcontent = fs.readFileSync(pth);
    var json = JSON.parse(fcontent);
    var name = json['source-map-output-name'];
    if(name) {
      return name;
    } else {
      var inherits = json['inherits'];
      if(inherits) {
        var newPath = path.resolve(path.dirname(pth), inherits);
        return getName(newPath);
      } else {
        return undefined;
      }
    }
  };
  return getName(plovrJsonPath);
};

/**
 * @param {string} plovrJsonPath
 * @return {string}
 */
plovr.getId = function(plovrJsonPath) {
  var fcontent = fs.readFileSync(plovrJsonPath);
  var json = JSON.parse(fcontent);
  return json['id'];
};

/**
 * @param {Object} plovrJson
 * @return {string}
 */
plovr.getMainModuleId = function(plovrJson) {
  var moduleId = goog.object.findKey(plovrJson['modules'],
      function (module) {
        return !module['deps'].length;
      });
  return moduleId;
};

/**
 * @param {string} srcCfgPath
 */
plovr.getDependentConfigs = function(srcCfgPath) {
  srcCfgPath = path.normalize(path.resolve('.', srcCfgPath));
  var pths = plovr.getConfigs();
  pths = goog.array.map(pths, function(p) {
    return path.normalize(path.resolve('.', p));
  });
  goog.asserts.assert(goog.array.contains(pths, srcCfgPath));
  
  var depLinks = {};
  
  goog.array.forEach(pths, function(pth) {
    var fcontent = fs.readFileSync(pth);
    var json = JSON.parse(fcontent);
    var inherits = json['inherits'];
    if(inherits) {
      var p = path.resolve(path.dirname(pth), inherits);
      if(!goog.object.containsKey(depLinks, p)) {
        depLinks[p] = [];
      }
      depLinks[p].push(pth);
    }
    if(!depLinks[pth]) {
      depLinks[pth] = [];
    }
  });
  
  var result = [];
  var deps = depLinks[srcCfgPath].concat();
  while(deps.length) {
    var p = deps.shift();
    result.push(p);
    goog.array.extend(deps, depLinks[p]);
  };
  return result;
};

plovr.getConfigs = function() {
  return glob.sync(jpadCfg.plovrPattern);
};

plovr.getPrecompileConfigs = function() {
  var cfgs = plovr.getConfigs();
  var result = goog.array.map(cfgs, function(cfg) {
    return plovr.srcToPrecompilePath(cfg);
  });
  return result;
};

plovr.getPrecompileMainConfigs = function() {
  var cfgs = plovr.getMainConfigs();
  var result = goog.array.map(cfgs, function(cfg) {
    return plovr.srcToPrecompilePath(cfg);
  });
  return result;
};

plovr.getMainConfigs = function() {
  var ignoreList = [
    'src/client/**/*.dev.plovr.json'
  ];
  if(!jpadCfg.buildWithModulesOn) {
    ignoreList.push('src/client/**/*.'+jpadCfg.modulesOnFolder+'.plovr.json');
  }
  var cfgs = glob.sync(jpadCfg.plovrPattern, {
    ignore: ignoreList
  });
  if(jpadCfg.buildWithModulesOn) {
    var cfgsToRemove = [];
    goog.array.forEach(cfgs, function(cfg) {
      if(goog.string.endsWith(cfg, jpadCfg.modulesOnFolder+'.plovr.json')) {
        var baseCfg = cfg.replace('.'+jpadCfg.modulesOnFolder+'.', '.');
        if(goog.array.contains(cfgs, baseCfg)) {
          cfgsToRemove.push(baseCfg);
        }
      }
    });
    goog.array.forEach(cfgsToRemove, function(cfg) {
      goog.array.remove(cfgs, cfg);
    });
  }
  return cfgs;
};

plovr.getHtmls = function() {
  return glob.sync(jpadCfg.plovrHtmlPattern);
};

plovr.srcToPrecompilePath = function(srcCfgPath) {
  var modulesOn = path.basename(srcCfgPath)
      .indexOf('.'+jpadCfg.modulesOnFolder+'.') > -1;
  var src = path.relative('./src', srcCfgPath);
  var modFolder = modulesOn ? jpadCfg.modulesOnFolder :
          jpadCfg.modulesOffFolder;
  var result = path.join('./temp/'+modFolder+'/precompile', src);
  return result;
};

module.exports = {
  absolutizePathsInHtml: absolutizePathsInHtml,
  absolutizePathsInJs: absolutizePathsInJs,
  getDirNamesOfFile: getDirNamesOfFile,
  getNamespaceParts: getNamespaceParts,
  getFileParts: getFileParts,
  cssImportsToLocal: cssImportsToLocal,
  plovr: plovr
};
