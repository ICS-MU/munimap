var through = require('through2');
var PluginError = require('plugin-error');
var StringDecoder = require('string_decoder').StringDecoder;
var jpad = require('./jpad.js');
var path = require("path");
var jpadCfg = require('../../jpad.cfg.js');



var PLUGIN_NAME = 'gulp-plovr-cfg-processor';

function plovrCfgProcessor(options) {
  var decoder = new StringDecoder('utf8');
  
  // Creating a stream through which each file will pass
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }
    if (file.isBuffer()) {
      var intxt = decoder.write(file.contents);
      var json = JSON.parse(intxt);
      
      var srcPath = file.path;
      var destPath = path.relative('./src/client', srcPath);
      var modFolder = options.modulesOn ? jpadCfg.modulesOnFolder : 
          jpadCfg.modulesOffFolder;
      destPath = path.join('./temp/'+modFolder+'/precompile/client', destPath);
      destPath = path.resolve('.', destPath);
      //console.log(destPath);

      jpad.plovr.updatePaths(json, srcPath, destPath, options.modulesOn);
      
      json['define']['jpad.APP_PATH'] = jpadCfg.appPath;
      json['define']['jpad.PROD_DOMAIN'] = jpadCfg.prodDomain;
      
      var output = JSON.stringify(json, null, '  ');
      var outtxt = output;
      file.contents = new Buffer.from(outtxt);
    }
    if (file.isStream()) {
      throw new PluginError(PLUGIN_NAME, 'Not yet supported!');
      //file.contents = file.contents.pipe(prefixStream(prefixText));
    }
    cb(null, file);
  });
}

// Exporting the plugin main function
module.exports = plovrCfgProcessor;
