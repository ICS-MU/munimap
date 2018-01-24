var through = require('through2');
var PluginError = require('plugin-error');
var StringDecoder = require('string_decoder').StringDecoder;
var cheerio = require('cheerio');
var jpad = require('./jpad.js');

var PLUGIN_NAME = 'gulp-html-processor';

function htmlProcessor(options) {
//  options = options || {};
//  var prefixText = options.prefixText;
//  if (!prefixText) {
//    throw new PluginError(PLUGIN_NAME, 'Missing prefix text!');
//  }
  
  var decoder = new StringDecoder('utf8');

  // Creating a stream through which each file will pass
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }
    if (file.isBuffer()) {
      var intxt = decoder.write(file.contents);
      var $ = cheerio.load(intxt);
      jpad.absolutizePathsInHtml($, file.relative, {
        includeModulesOnFolder: options.includeModulesOnFolder
      });
      var outtxt = $.html();
      outtxt = jpad.fillTemplateInHtml(outtxt);
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
module.exports = htmlProcessor;