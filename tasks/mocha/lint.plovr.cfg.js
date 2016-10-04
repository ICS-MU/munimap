var glob = require("glob");
var path = require("path");
var TreeModel = require("tree-model");
var assert = require("chai").assert;
var fs = require("fs-extra");
var jpad = require('./../util/jpad.js');

require('./../../bower_components/closure-library/closure/goog/bootstrap/nodejs');
goog.require('goog.array');

describe('plovr configuration', function() {
  var fpaths = glob.sync('src/client/**/*.plovr.json');
  
  var fnames = goog.array.map(fpaths, function(fpath) {
    return path.basename(fpath, '.plovr.json');
  });
  
  goog.array.forEach(fnames, function(fname, fidx) {
    var completeFpath = fpaths[fidx];
    var parts = jpad.getFileParts(completeFpath, '.plovr.json');
    
    describe(completeFpath, function() {
      var fcontent = fs.readFileSync(completeFpath);
      var fjson = JSON.parse(fcontent);
    
      var correctId =  parts.join('-');
      var plovrId = fjson.id;
      it('should have "id" set to "'+correctId+'"', function () {
        assert.equal(correctId, plovrId);
      });
      var inputs = fjson['inputs'];
      if(inputs) {
        var correctInput = fname + '.js';
        it('should have one "inputs" set to "'+correctInput+'"', function () {
          assert.equal(inputs.length, 1);
          assert.equal(inputs[0], correctInput);
        });
      }
      var inherits = fjson['inherits'];
      if(inherits) {
        it('should not have "inherits" pointing to non-existing file "'+
            inherits+'"', function () {
          var inhpath = path.resolve(path.dirname(completeFpath), inherits);
          assert(fs.existsSync(inhpath));
        });
      }
      ['css-inputs', 'css-output-file', 'css-output-format'].forEach(
          function(tag) {
            it('should not use "'+tag+'"', function () {
              assert.notProperty(fjson, tag,
                  'Use standard CSS import instead.');
            });
          });
    });
  });
});

