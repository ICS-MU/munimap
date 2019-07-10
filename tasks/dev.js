'use strict';
var spawn = require('child_process').spawn;
var processhtml = require('./util/processhtml.js');
var jspathabs = require('./util/jspathabs.js');
var processplovrcfg = require('./util/processplovrcfg.js');
var path = require("path");
var fs = require("fs-extra");
var jpad =  require('../tasks/util/jpad.js');
var glob = require('glob');
require('./../bower_components/closure-library/closure/goog/bootstrap/nodejs');
goog.require('goog.array');

module.exports = function (gulp, plugins, jpadCfg) {
  var plovr;
  
  gulp.task('dev:clean-temp', function (cb) {
    fs.removeSync('temp');
    cb();
  });
  
  gulp.task('precompile:plovr:modoff', function() {
    var src = [
      'src/client/**/*.plovr.json',
      '!src/client/**/*.modon.plovr.json',
      '!src/client/**/*.modon.dev.plovr.json'
    ];
    var modFolder = jpadCfg.modulesOffFolder;
    var dest = './temp/'+modFolder+'/precompile/client';
    return gulp.src(src)
        .pipe(plugins.newer(dest))
        .pipe(processplovrcfg({modulesOn: false}))
        .pipe(gulp.dest(dest));
  });
  gulp.task('precompile:plovr:modon', function() {
    var src = [
      'src/client/**/*.plovr.json'
    ];
    var modFolder = jpadCfg.modulesOnFolder;
    var dest = './temp/'+modFolder+'/precompile/client';
    return gulp.src(src)
        .pipe(plugins.newer(dest))
        .pipe(processplovrcfg({modulesOn: true}))
        .pipe(gulp.dest(dest));
  });
  
  gulp.task('precompile:plovr', gulp.parallel('precompile:plovr:modoff',
    'precompile:plovr:modon'));
  
  gulp.task('precompile:js:modoff', function() {
    var src = [
      'src/client/**/*.js',
      '!src/client/**/*.externs.js',
      '!src/client/**/*.modon.js'
    ];
    var modFolder = jpadCfg.modulesOffFolder;
    var dest = './temp/'+modFolder+'/precompile/client';
    return gulp.src(src)
        .pipe(plugins.newer(dest))
        .pipe(jspathabs({includeModulesOnFolder: false}))
        .pipe(gulp.dest(dest));
  });

  gulp.task('precompile:js:modon', function() {
    var src = [
      'src/client/**/*.js',
      '!src/client/**/*.externs.js',
      '!src/client/**/*.modoff.js'
    ];
    var modFolder = jpadCfg.modulesOnFolder;
    var dest = './temp/'+modFolder+'/precompile/client';
    return gulp.src(src)
        .pipe(plugins.newer(dest))
        .pipe(jspathabs({includeModulesOnFolder: true}))
        .pipe(gulp.dest(dest));
  });
  
  gulp.task('precompile:js', gulp.parallel('precompile:js:modoff', 
    'precompile:js:modon'));
    
  gulp.task('dev:serve:plovr:start', function (cb) {
    //start plovr server
    var args = ['-jar', 'bower_components/plovr/index.jar', 'serve'];
    var plovrConfigs = jpad.plovr.getPrecompileConfigs();
    goog.array.extend(args, plovrConfigs);
    plovr = spawn('java', args);
    var logData = function (data) {
      console.log(data.toString());
    };
    plovr.stdout.on('data', logData);
    plovr.stderr.on('data', logData);
    plovr.on('close', function (code) {
      if(code!==null) { 
       console.log('plovr exited with code ' + code);
      }
    });
    
    cb();
  });
  
  gulp.task('dev:serve:plovr', gulp.series(
    gulp.parallel('precompile:plovr', 'precompile:js'), 
    'dev:serve:plovr:start'));
  
  gulp.task('dev:serve', function (cb) {
    var options = {
      env: {
        JPAD_APP_PATH: jpadCfg.appPath
      }
    };
    //run dev server 
    var server = plugins.liveServer(
        './src/server/dev.js',
        options,
        false
    );
    server.start();
 
    //restart dev server 
    gulp.watch([
      './src/server/dev.js',
      './jpad.cfg.js'
    ], function() {
        server.start.apply(server);
    });
    
    cb();
  });

  gulp.task('dev:open', function(cb){
    var url = 'http://localhost:'+jpadCfg.port + jpadCfg.appPath;
    gulp.src(__filename)
        .pipe(plugins.open({
          uri: url
        }));
    cb();    
  });
  
  gulp.task('processhtmlmodoff', function() {
    var src = './src/client/**/*.html';
    var modFolder = jpadCfg.modulesOffFolder;
    var dest = './temp/'+modFolder+'/precompile/client';
    return gulp.src(src)
        .pipe(plugins.newer(dest))
        .pipe(processhtml({includeModulesOnFolder: false}))
        .pipe(gulp.dest(dest));
  });
  
  gulp.task('processhtmlmodon', function() {
    var src = './src/client/**/*.html';
    var modFolder = jpadCfg.modulesOnFolder;
    var dest = './temp/'+modFolder+'/precompile/client';
    return gulp.src(src)
        .pipe(plugins.newer(dest))
        .pipe(processhtml({includeModulesOnFolder: true}))
        .pipe(gulp.dest(dest));
  });
  
  

  

  
  
  
  
  gulp.task('dev:watch:js', function() {
    var src = './src/client/**/*.js';
    return gulp.watch(src,
      gulp.parallel('precompile:js', 'compile:delete-js')
    );
  });

  gulp.task('compile:delete-js', function(cb) {
    var modFolders = [jpadCfg.modulesOnFolder, jpadCfg.modulesOffFolder];
    var jss = glob.sync('./temp/@('+modFolders.join('|')+')/compile/**/*.js');
    goog.array.forEach(jss, function(js) {
      fs.unlinkSync(js);
    });
    cb();
  });

  gulp.task('dev:watch:plovr', function() {
    var src = './src/client/**/*.plovr.json';
    
    var paths = [];
    
    if(goog.isArray(src)){
      goog.array.forEach(src, function(s){
        var pths = glob.sync(s);
        goog.array.extend(paths, pths);
      });
    } else {
      var pths = glob.sync(src);
      goog.array.extend(paths, pths);
    }
    
    gulp.watch(paths, function(cb) {
        goog.array.forEach(paths, function(plovrCfg) {
          var modulesOn = path.basename(plovrCfg)
              .indexOf('.'+jpadCfg.modulesOnFolder+'.') > -1;
          var modFolder = modulesOn ? jpadCfg.modulesOnFolder :
                  jpadCfg.modulesOffFolder;
          var dest = './temp/'+modFolder+'/precompile/client';
          var srcp = path.relative('./src/client', plovrCfg);
          var destp = path.join(dest, srcp);
          if(!fs.existsSync(srcp)) {
            fs.unlinkSync(destp);
          }
          //delete compiled JS files
          var depCfgs = jpad.plovr.getDependentConfigs(plovrCfg);
          var affectedCfgs = depCfgs.concat();
          affectedCfgs.push(path.normalize(path.resolve('.', plovrCfg)));
          
          goog.array.forEach(affectedCfgs, function(affCfg) {
            modulesOn = path.basename(affCfg)
                .indexOf('.'+jpadCfg.modulesOnFolder+'.') > -1;
            modFolder = modulesOn ? jpadCfg.modulesOnFolder :
                    jpadCfg.modulesOffFolder;
            var relCfg = path.relative('./src/', affCfg);
            var affScript = path.join('./temp/'+modFolder+'/compile', relCfg);
            affScript = path.join(path.dirname(affScript),
                path.basename(affScript, '.plovr.json')+'.js');
            if(fs.existsSync(affScript)) {
              fs.unlinkSync(affScript);
            }
            
          });
        }, this);
        if(plovr) {
          console.log('Stopping plovr.');
          plovr.kill();
          plovr = null;
        }
        gulp.series('dev:serve:plovr')();
        cb();
      });
  });
  
  gulp.task('dev', gulp.series(
      'dev:clean-temp',
      'dev:serve:plovr',
      'dev:serve',
      'dev:open',
      gulp.parallel('dev:watch:plovr', 'dev:watch:js')
  ));
};

