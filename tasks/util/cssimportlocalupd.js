var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var StringDecoder = require('string_decoder').StringDecoder;
var jpad = require('./jpad.js');



var PLUGIN_NAME = 'css-import-local-upd';

function plovrPathUpdater(options) {
  var decoder = new StringDecoder('utf8');
  
  // Creating a stream through which each file will pass
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }
    if (file.isBuffer()) {
      var intxt = decoder.write(file.contents);
      var css = require('css');
      var cssobj = css.parse(intxt);
      
      var srcPath = file.path;

      jpad.cssImportsToLocal(cssobj, srcPath);
      
      var output = css.stringify(cssobj);
      var outtxt = output;
      file.contents = new Buffer(outtxt);
    }
    if (file.isStream()) {
      throw new PluginError(PLUGIN_NAME, 'Not yet supported!');
      //file.contents = file.contents.pipe(prefixStream(prefixText));
    }
    cb(null, file);
  });
}

// Exporting the plugin main function
module.exports = plovrPathUpdater;