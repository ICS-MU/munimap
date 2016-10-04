var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
require('./bower_components/closure-library/closure/goog/bootstrap/nodejs');
var runSequence = require('run-sequence');
var jpadCfg = require('./jpad.cfg.js');

var argv = require('yargs')
    .usage('Usage: gulp <command> [options]')
    .command('build', 'Compile and refactor files for publishing.')
    .command('dev', 'Run dev server and open app.')
    .command('devlint', 'Run watcher for linting and fixing ' +
        'source code style in Closure way immediately during editing.')
    .command('fix', 'Fix source code style in Closure way.')
    .command('fixlint', 'Fix and lint source code style ' +
        'in Closure and jpad way.')
    .command('install', 'Install Closure Linter and ol3 externs.')
    .command('lint', 'Lint source code style in Closure and jpad way.')
    .option('s', {
        type: 'boolean',
        alias: 'sourcemap',
        describe: 'Generate source maps for JS files.' +
            ' Related to \'build\' task only.'
    })
    .option('m', {
        type: 'boolean',
        alias: 'modules',
        describe: 'Compile into multiple modules.' +
            ' Related to \'build\' task only.'
    })
    .help('H')
    .alias('H', 'Help')
    .argv;

jpadCfg.generateSourceMaps = !!argv.s;
jpadCfg.buildWithModulesOn = !!argv.m;

function loadTask(task) {
    require('./tasks/' + task)(gulp, plugins, jpadCfg);
}
loadTask('build');
loadTask('dev');
loadTask('devlint');
loadTask('fix');
loadTask('install');
loadTask('lint');

gulp.task('fixlint', function(cb) {
  runSequence('fix', 'lint', cb);
});

gulp.task('default', ['dev']);