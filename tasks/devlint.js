'use strict';

module.exports = function (gulp, plugins) {
  
  var path = require('path');
  
  gulp.task('watch:fixjsstyle', function (cb) {

    var options = {
      templateData: {
        adjustPath: function (filePath) {
          filePath = path.relative('.', filePath);
          filePath = filePath.replace(/\\/g,"/");
          return filePath;
        }
      }
    };
    
    var paths = glob.sync('./src/client/**/*.js');
    
    gulp.watch('./src/client/**/*.js', gulp.series(function(cb){
      plugins.shell(['fixjsstyle ' +
        '--jslint_error=all ' +
        '--custom_jsdoc_tags=event,fires,api,observable ' +
        '--strict ' +
        '<%= adjustPath(file.path) %>'], options);
      cb() ; 
    }, function(cb){
      plugins.gjslint({
        flags: [
          '--jslint_error=all',
          '--strict',
          '--custom_jsdoc_tags=event,fires,api,observable',
          '--beep'
        ]
      });
      cb();
    }, function(cb){
      plugins.gjslint.reporter('console');
      cb();
    }));
  });


  gulp.task('devlint', gulp.series('watch:fixjsstyle'));
};

