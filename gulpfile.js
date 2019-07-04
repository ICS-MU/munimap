var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
require('./bower_components/closure-library/closure/goog/bootstrap/nodejs');
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
    .option('d', {
        type: 'string',
        alias: 'dir',
        describe: 'Name of the directory' +
            ' that will be added to the end of application path.' +
            ' "v2n" / "v3n" takes first 2 or 3 numbers from app version.' +
            ' "none" means no directory will be added.',
        default: 'testing',
        choices: ['testing', 'latest', 'v2n', 'v3n', 'none']
    })
    .help('H')
    .alias('H', 'Help')
    .argv;

if (argv.d === 'none') {
    var dir = '';
} else if (argv.d === 'v2n') {
    dir = jpadCfg.appVersion.split('.').slice(0, 2).join('.');
} else if (argv.d === 'v3n') {
    dir = jpadCfg.appVersion.split('.').slice(0, 3).join('.');
} else {
    dir = argv.d;
}
if (dir) {
    jpadCfg.appPath += dir + '/';
}
console.log('Application path set to', jpadCfg.appPath);

jpadCfg.generateSourceMaps = !!argv.s;
jpadCfg.buildWithModulesOn = !!argv.m;

function loadTask(task) {
    require('./tasks/' + task)(gulp, plugins, jpadCfg);
}
loadTask('dev');
loadTask('build');
loadTask('devlint');
loadTask('fix');
loadTask('lint');

gulp.task('fixlint', gulp.series('fix', 'lint'));

gulp.task('default', gulp.series('dev'));