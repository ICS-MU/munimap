var glob = require("glob");
var path = require("path");
var TreeModel = require("tree-model");
var assert = require("chai").assert;
var fs = require("fs-extra");
var cheerio = require("cheerio");

require('./../../bower_components/closure-library/closure/goog/bootstrap/nodejs');
goog.require('goog.array');

describe('HTML file', function() {
  var fpaths = glob.sync('src/client/**/*.html');
  
  var fnames = goog.array.map(fpaths, function(fpath) {
    return path.basename(fpath, '.html');
  });
  
  goog.array.forEach(fnames, function(fname, fidx) {
    var completeFpath = fpaths[fidx];
    describe(completeFpath, function() {
      var fcontent = fs.readFileSync(completeFpath);
      var $ = cheerio.load(fcontent);
      var plovrLinks = $('script[src^=\'http://localhost:9810/\']').length;
      it('should not contain direct link to plovr, ' +
          'use link to *.plovr.json instead',
        function () {
          assert.equal(plovrLinks, 0);
        });
      
//      goog.array.forEach(scripts, function(scr, idx) {
//        console.log('s', idx);
//        console.log(scr.attr('src'));
//        
//      });
//      try {
//        assert.equal(fcontent.toString(), $.html());
//      } catch (err) {
//        err.showDiff=true;
//        throw err;
//        //console.log(e);
//      }
    
    });
  });
});

