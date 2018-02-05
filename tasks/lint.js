'use strict';

module.exports = function(gulp, plugins) {

    gulp.task('lint:eslint', function(cb) {
        return gulp.src(['src/client/munimap/*.js'])
          // eslint() attaches the lint output to the "eslint" property
          // of the file object so it can be used by other modules.
          .pipe(plugins.eslint({
            configFile: '.eslintsrc.js'
          }))
          // eslint.format() outputs the lint results to the console.
          // Alternatively use eslint.formatEach() (see Docs).
          .pipe(plugins.eslint.format())
    
        cb();
      });
    
      gulp.task('lint:mocha', function(cb) {
        var src = [
          'tasks/mocha/lint.file.name.js',
          'tasks/mocha/lint.goog.provide.js',
          'tasks/mocha/lint.html.js',
          'tasks/mocha/lint.plovr.cfg.js'
        ];
        return gulp.src(src, { read: false })
          // gulp-mocha needs filepaths so you can't have any plugins before it 
          .pipe(plugins.mocha({ reporter: 'dot' }));
        cb();
    
      });
    
      gulp.task('lint', ['lint:eslint', 'lint:mocha']);
};

