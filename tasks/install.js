'use strict';

var fs = require("fs-extra");
var http = require("http");

module.exports = function (gulp, plugins) {
  
  /*gulp.task('install:clean-temp', function (cb) {
    fs.removeSync('temp/install');
    cb();
  });*/

  
  /*gulp.task('install:pip:download', ['install:clean-temp'], function (cb) {
    
    fs.mkdirsSync('temp/install');
    
    var download = function(url, dest, cb) {
      var file = fs.createWriteStream(dest);
      var req = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          file.close(cb);
        });
      }).on('error', function(err) {
        fs.unlinkSync(dest);
        throw err;
      });
    };
    
    download("http://bootstrap.pypa.io/get-pip.py",
        "temp/install/get-pip.py", cb);
  });*/

  gulp.task('install:linter', /*['install:clean-temp'], */function (cb) {
    
    var exec = require('child_process').exec;
 
    var cmd = 'python ./setup.py install';
    
    exec(cmd, {
      cwd: 'bower_components/closure-linter'
    }, function (err, stdout, stderr) {
      //console.log(stdout);
      //console.log(stderr);
      cb(err);
    });

  });

  gulp.task('install:create-ol-ext', function (cb) {
    
    var exec = require('child_process').exec;
 
    var cmd = 'node bower_components/ol3/tasks/build-ext.js';
    
    exec(cmd, function (err, stdout, stderr) {
      //console.log(stdout);
      //console.log(stderr);
      cb(err);
    });

  });


  gulp.task('install', ['install:linter', 'install:create-ol-ext']);

};


