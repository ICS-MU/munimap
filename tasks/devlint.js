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

    plugins.watch('./src/client/**/*.js')
      .pipe(plugins.shell(['fixjsstyle ' +
            '--jslint_error=all ' +
            '--custom_jsdoc_tags=event,fires,api,observable ' +
            '--strict ' +
            '<%= adjustPath(file.path) %>'], options))
      .pipe(plugins.gjslint({
        flags: [
          '--jslint_error=all',
          '--strict',
          '--custom_jsdoc_tags=event,fires,api,observable',
          '--beep'
        ]
      }))
      .pipe(plugins.gjslint.reporter('console'));

    cb();
  });


  gulp.task('devlint', ['watch:fixjsstyle']);
};

