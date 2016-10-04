var glob = require("glob");
var path = require("path");
var TreeModel = require("tree-model");
var assert = require("chai").assert;
var fs = require("fs-extra");
var jpad = require('./../util/jpad.js');

require('./../../bower_components/closure-library/closure/goog/bootstrap/nodejs');
goog.require('goog.array');
goog.require('goog.math');

describe('namespace', function() {
  var jspaths = glob.sync('src/client/**/*.js', {nodir: true});
  
  var jspartss = goog.array.map(jspaths, function(jspath) {
    return jpad.getFileParts(jspath);
  });
  
  var jsregexps = goog.array.map(jspartss, function(jsparts) {
    var re = new RegExp('^'+jsparts.join('\\.')+'(\\..+|$)');
    return re;
  });
  
  var findCorrectFiles = function(namespace) {
    var parts = jpad.getNamespaceParts(namespace);
    namespace = parts.join('.');
    var result = [];
    var resultIdx = [];
    goog.array.forEach(jsregexps, function(jsregexp, idx) {
      if(namespace.match(jsregexp)) {
        if(!result.length ||
            jspartss[resultIdx[0]].length < jspartss[idx].length) {
          result = [jspaths[idx]];
          resultIdx = [idx];
        } else if(jspartss[resultIdx[0]].length === jspartss[idx].length) {
          result.push(jspaths[idx]);
          resultIdx.push(idx);
        }
      }
    });
    return result;
  };
  
  var dirTree = new TreeModel();
  var dirRoot = dirTree.parse({name: 'client', path: ''});
  var dirpaths = glob.sync('src/client/**/');
  dirpaths.shift();
  goog.array.forEach(dirpaths, function(dirpath) {
    dirpath = dirpath.substring(0, dirpath.length-1);
    dirpath = path.relative('src/client', dirpath).replace(/\\/g, '/');
    var parts = dirpath.split('/');
    var dirname = parts.pop();
    var modelopts = {name: dirname, path: dirpath};
    var dirnode = dirTree.parse(modelopts);
    var parentPath = parts.join('/');
    var parent = dirRoot.first(function(n) {
      return n.model.path === parentPath;
    });
    parent.addChild(dirnode);
  });

  var findCorrectDir = function(namespace) {
    var parts = jpad.getNamespaceParts(namespace);
    var parentPath = parts.join('/');
    var parent = dirRoot.first(function(n) {
      return n.model.path === parentPath;
    });
    parts.pop();
    while(!parent) {
      parentPath = parts.join('/');
      parent = dirRoot.first(function(n) {
        return n.model.path === parentPath;
      });
      parts.pop();
    }
    return parent;
  };


  goog.array.forEach(jspaths, function(completeFpath, fidx) {
    var fpath = path.relative('src/client', completeFpath).replace(/\\/g, '/');
    var fextname = path.basename(fpath);
    var extname = path.extname(fextname);
    var fname = path.basename(fpath, extname);
    
    var fcontent = fs.readFileSync(completeFpath);
    var acorn = require("acorn");
    var tokens = [];
    acorn.parse(fcontent, {onToken: tokens});
    

    var namespaces = [];
    goog.array.forEach(tokens, function(tok, tidx) {
      var tok1 = tokens[tidx+1];
      var tok2 = tokens[tidx+2];
      var tok3 = tokens[tidx+3];
      var tok4 = tokens[tidx+4];
      var tok5 = tokens[tidx+5];
      if(tok1 && tok2 && tok3 && tok4 && tok5 &&
          tok.value === 'goog' && tok.type.label === 'name' &&
              tok.type.startsExpr &&
          tok1.type.label === '.' &&
          tok2.value === 'provide' &&
          tok3.type.label === '(' &&
          tok4.type.label === 'string' &&
          tok5.type.label === ')') {
        var ns = tok4.value;
        namespaces.push(ns);
      }
    });
    goog.array.removeDuplicates(namespaces);
    
    

    goog.array.forEach(namespaces, function(namespace) {
      describe(namespace, function() {
        var nsParts = jpad.getNamespaceParts(namespace);
        var correctDirNode = findCorrectDir(namespace);
        var correctDir = correctDirNode.model.path;
        
        var completeCorrectDir = 'src/client/'+correctDir;
        
        it('should be provided by file located in appropriate dir, e.g. ' +
            completeCorrectDir, function () {
          var dirname = path.dirname(completeFpath);
          assert.equal(dirname, completeCorrectDir);
        });
        
        it('should not contain two parts with same name',
            function () {
          var originalLength = nsParts.length;
          goog.array.removeDuplicates(nsParts);
          assert.equal(nsParts.length, originalLength);
        });

        var correctFiles = findCorrectFiles(namespace);
        var cfsuggestions = correctFiles.concat();
        if(!cfsuggestions.length) {
          var fnidx = correctDir.length ? correctDir.split('/').length : 0;
          fnidx = goog.math.clamp(fnidx, 0, nsParts.length-1);
          var cfsuggestion = path.join(completeCorrectDir, nsParts[fnidx]+'.js');
          cfsuggestions = [cfsuggestion.replace(/\\/g, '/')];
        }
        it('should be located in another file, e.g. '+cfsuggestion,
            function () {
          assert.include(cfsuggestions, completeFpath);
        });
      });
    });
  });
});

