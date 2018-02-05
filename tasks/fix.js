'use strict';

module.exports = function (gulp, plugins) {
  
  function isFixed(file) {
    // Has ESLint fixed the file contents?
    return file.eslint != null && file.eslint.fixed;
  }

  gulp.task('fix:eslint', function(cb) {
    return gulp.src(['src/client/munimap/*.js'])
      // eslint() attaches the lint output to the "eslint" property
      // of the file object so it can be used by other modules.
      .pipe(plugins.eslint({
        configFile: '.eslintsrc.js',
        fix: true
      }))
      // eslint.format() outputs the lint results to the console.
      // Alternatively use eslint.formatEach() (see Docs).
      .pipe(plugins.eslint.format())
      // if fixed, write the file to dest
      .pipe(plugins.if(isFixed, gulp.dest('src/client/munimap')))

    cb();
  });

  gulp.task('fix:mocha', function(cb) {
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

  gulp.task('fix', ['fix:eslint', 'fix:mocha']);
};


