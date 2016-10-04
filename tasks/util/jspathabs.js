var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var StringDecoder = require('string_decoder').StringDecoder;
var jpad = require('./jpad.js');
var recast = require("recast");


var PLUGIN_NAME = 'gulp-js-path-abs';

function jsPathAbsolutizer(options) {
  var decoder = new StringDecoder('utf8');

  // Creating a stream through which each file will pass
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }
    if (file.isBuffer()) {
      var intxt = decoder.write(file.contents);
      try {
        var ast = recast.parse(intxt);
        
        jpad.absolutizePathsInJs(ast, file.relative,
          options.includeModulesOnFolder);
        var output = recast.print(ast).code;
        var outtxt = output;
        file.contents = new Buffer(outtxt);
      } catch(e) {
        return cb(null, file);
      }
    }
    if (file.isStream()) {
      throw new PluginError(PLUGIN_NAME, 'Not yet supported!');
      //file.contents = file.contents.pipe(prefixStream(prefixText));
    }
    cb(null, file);
  });
}

// Exporting the plugin main function
module.exports = jsPathAbsolutizer;
