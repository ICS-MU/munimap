var glob = require("glob");
var path = require("path");
var TreeModel = require("tree-model");
var assert = require("chai").assert;
var fs = require("fs-extra");
var jpad = require('./../util/jpad.js');

require('./../../bower_components/closure-library/closure/goog/bootstrap/nodejs');
goog.require('goog.array');

describe('src/client/', function() {
  var fpaths = glob.sync('src/client/**/*');
  
  goog.array.forEach(fpaths, function(completeFpath) {
    var fpath = path.relative('src/client', completeFpath).replace(/\\/g, '/');
    describe(fpath, function () {
      var fextname = path.basename(fpath);
      
      var isdir = fs.statSync(completeFpath).isDirectory();
      
      it('should be named according to pattern', function () {
        if(isdir) {
          var fextnamere = /^[a-z][a-z0-9]*$/;
        } else {
          fextnamere = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;
        }
        assert.match(fextname, fextnamere);
      });
      
      if(isdir) {
        it('should not contain two directories with same name',
            function () {
          var parts = fpath.split('/');
          var originalLength = parts.length;
          goog.array.removeDuplicates(parts);
          assert.equal(originalLength, parts.length);
        });
      } else {
        var dirparts = jpad.getDirNamesOfFile(fpath);
        var extname = path.extname(fpath);
        var fbasename = path.basename(fpath, extname);
        var fnameparts = fbasename.split('.');
        var firstSamePart = goog.array.find(dirparts, function(dp) {
          var dpidx = fnameparts.indexOf(dp);
          if(dpidx>=0) {
            it('should have name beginning with part "'+dp+'"'+
                ' (or omit the "'+dp+'" part at all, ' +
                'or move it to another dir)',
                function() {
              assert.equal(dpidx, 0);
            });
          }
          return dpidx === 0;
        });
        if(firstSamePart) {
          var firstSamePartIdx = dirparts.indexOf(firstSamePart);
          var expectedCommonParts =
              dirparts.slice(firstSamePartIdx, dirparts.length);
          var realParts = fnameparts.slice(0, expectedCommonParts.length);
          it('should have overlapping path parts and filename parts ' +
              '(or not common parts at all)', function() {
            assert.deepEqual(expectedCommonParts, realParts);
          });
        }
      }
      
      
    });
  });
});

