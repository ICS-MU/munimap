'use strict';

module.exports = function (gulp, plugins) {
  
  gulp.task('fix', function (cb) {

    var exec = require('child_process').exec;
 
    var cmd = ['fixjsstyle', 
          '--jslint_error=all',
          //'--custom_jsdoc_tags=event,fires,api,observable',
          '--strict',
          '-r',
          'src/client'
        ].join(' ');
    
    exec(cmd, function (err, stdout, stderr) {
//      console.log(stdout);
//      console.log(stderr);
      cb(err);
    });
  });
};


