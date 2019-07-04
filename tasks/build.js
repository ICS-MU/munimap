'use strict';
var glob = require("glob");
var path = require("path");
var url = require("url");
var fs = require("fs-extra");
var exec = require('child_process').exec;
var cheerio = require("cheerio");
var jpad =  require('./util/jpad.js');
var cssImportUpd =  require('./util/cssimportlocalupd.js');
var git = require('git-state');

require('./../bower_components/closure-library/closure/goog/bootstrap/nodejs');
goog.require('goog.array');
goog.require('goog.string');

module.exports = function (gulp, plugins, jpadCfg) {
  
  gulp.task('build:remove', function(cb){
    fs.removeSync('build');
    cb();
  });
  
  gulp.task('build:clean', gulp.series('dev:clean-temp', 'build:remove'));

  gulp.task('build:check-git', function (cb) {
    var state = git.checkSync('.');
    var msg;
    if(state.branch !== 'master') {
      msg = 'You are not on "master"branch';
    } else if (isNaN(state.ahead)) {
      msg = 'No "remote" set for local repository';
    } else if (state.ahead > 0) {
      msg = 'You are ahead of remote';
    } else if (state.dirty > 0 || state.untracked > 0) {
      msg = 'Some dirty or untracked files in your repo ' + 
          '(untracked, modified, deleted, etc.)';
    }
    if(msg) {
      console.log(state);
      throw new Error(msg);
    }
    cb();
  });

  gulp.task('build:copy', function (cb) {
    goog.array.forEach(jpadCfg.libMappings, function(lm) {
      var src = lm.src;
      var dest = lm.dest;
      dest = path.join('build/client', dest);
      var srcs = glob.sync(src);
      goog.array.forEach(srcs, function(src) {
        fs.copySync(src, dest);
      });
    });
    goog.array.forEach(jpadCfg.srcClientMappings, function(fm) {
      if(goog.isString(fm)) {
        var src = fm;
        var cwd = path.join(process.cwd(), 'src/client');
        var srcs = glob.sync(src, {
          cwd: cwd
        });
        goog.array.forEach(srcs, function(src) {
          fs.copySync(path.join('src/client', src),
              path.join('build/client', src));
        });
      } else {
        throw Error('Not yet supported');
      }
    });
    cb();
  });
  
  gulp.task('build:plovr:json', function (cb) {
    var useMap = jpadCfg.generateSourceMaps;
    var mainPlovrCfgs = jpad.plovr.getPrecompileMainConfigs();
    var ncmds = mainPlovrCfgs.length;
    if(!ncmds) {
      cb();
    }
    goog.array.forEach(mainPlovrCfgs, function(pth) {
      var modonFolder = jpadCfg.modulesOnFolder;
      var withModules = goog.string.contains(pth, '.'+modonFolder+'.');
      var modFolder = withModules ? jpadCfg.modulesOnFolder :
              jpadCfg.modulesOffFolder;
      var dst = path.relative('temp/'+modFolder+'/precompile/client', pth);
      dst = path.join('build/client', dst);
      dst = path.join(path.dirname(dst),
          path.basename(dst, '.plovr.json'))+'.js';
      fs.mkdirsSync(path.dirname(dst));
      var cmd = 'java -jar bower_components/plovr/index.jar build ';
      if(useMap) {
        cmd += '--create_source_map ';
        if(withModules) {
          var fcontent = fs.readFileSync(pth);
          var json = JSON.parse(fcontent);
          var dstMap = path.dirname(dst) + 
              json['module-production-uri'].replace('_%s.js', '');
          cmd += dstMap;
        } else {
          cmd += path.dirname(dst) + ' ';
        }
      }
      cmd += pth;
      if(!withModules) {
        cmd += ' > ' + dst;
      }
      exec(cmd, function(error, stdout, stderr) {
        if(stdout) {
          console.log('stdout', pth, error.toString());
        }
        if(error) {
          cb(error);
        } else {
          if(useMap) {
            var content = fs.readFileSync(dst, {encoding: 'utf-8'});
            var mapName = jpad.plovr.getSourceMapOutputName(pth);
            content += '//# sourceMappingURL='+mapName;
            fs.writeFileSync(dst, content, {encoding: 'utf-8'});
          }
          ncmds--;
          if(!ncmds) {
            cb();
          }
        }
      });
    });
  });
  
  gulp.task('build:plovr', gulp.series(
    gulp.parallel('precompile:js', 'precompile:plovr'), 'build:plovr:json'));
    
    
  gulp.task('build:css:min', function () {

    var stream = gulp.src('src/client/**/*.css')
        .pipe(cssImportUpd())
        .pipe(plugins.cleanCss({
          inline: ['all']
        }))
        .pipe(gulp.dest('build/client'));
    return stream;
  });

  gulp.task('build:css:absolutize-paths', function (cb) {
    var css = require('css');
    var fpaths = glob.sync('build/client/**/*.css');
    goog.array.forEach(fpaths, function(fpath) {
      var fcontent = fs.readFileSync(fpath, {encoding: 'utf-8'});
      var cssobj = css.parse(fcontent);
      
      var processRules = function(rules) {
        goog.array.forEach(rules, function(rule) {
          if(rule.declarations) {
            processDeclarations(rule.declarations);
          } else if(rule.rules) {
            processRules(rule.rules);
          }
        });
      };
      
      var processDeclarations = function(declarations) {
        goog.array.forEach(declarations, function(declaration) {
          var declval = declaration.value;
          if(!declval) {
            return;
          }
          declval = declval.replace(
              /(^|[ ,])url\(\s*(['"]?)([^'"]+)\2?\s*\)($|[ ,])/gmi,
              function(match, prefix, wrapper, srcUrl, postfix) {
                var srcUrlObject = url.parse(srcUrl, false, true);
                if(srcUrlObject.host) {
                  return prefix + 'url(' + wrapper + srcUrl + wrapper + ')' +
                      postfix;
                }
                var completePath = path.resolve(path.dirname(fpath), srcUrl);
                var relPath = path.relative('.', completePath);
                relPath = relPath.replace(/\\/g, '/');
                var lm = jpadCfg.libMappings.find(function(lm) {
                  return relPath.indexOf(lm.src) >= 0;
                });
                if(lm) {
                  relPath = lm.dest + relPath.substr(lm.src.length);
                } else {
                  relPath = path.relative('build/client/', completePath);
                }
                relPath = jpadCfg.appPath + relPath.replace(/\\/g, '/');
                var result = prefix + 'url(' + wrapper + relPath;
                result += wrapper + ')' + postfix;
                return result;
              }
          );
          declaration.value = declval;
        });
      };
      processRules(cssobj.stylesheet.rules);
      
      var cssout = css.stringify(cssobj, {compress:true});
      fs.writeFileSync(fpath, cssout, {encoding: 'utf-8'});
    });

    cb();
  });
  
  gulp.task('build:css', 
    gulp.series('build:css:min', 'build:css:absolutize-paths'));
    
  gulp.task('build:serve', function (cb) {
    //run dev server 
    var server = plugins.liveServer(
      './src/server/build.js',
      {
        env: {
          JPAD_APP_PATH: jpadCfg.appPath
        }
      },
      false
    );
    server.start();

    //restart dev server 
    gulp.watch('./src/server/build.js', server.start.bind(server));

    cb();
  });  

  gulp.task('build:html', function (cb) {
    goog.array.forEach(jpad.plovr.getHtmls(), function(htmlPath) {
      var localHtmlPath = path.resolve('.', htmlPath);
      var fcontent = fs.readFileSync(localHtmlPath);
      var $ = cheerio.load(fcontent);
      //replace links to *.plovr.json with compiled .js
      var precompileModonPlovrPath;
      var plovrModonJson;
      var modonSrc;
      var modonInfoPath;

      $('script[src$=\'.plovr.json\']').each(function(i, elem) {
          var src = $(this).attr('src');
          var srcBasename = path.basename(src, '.plovr.json');
          var modonPlovrPath =
              path.join(path.dirname(src), srcBasename)
                + '.modon.plovr.json';
          var localModonPlovrPath =
              path.resolve(path.dirname(localHtmlPath), modonPlovrPath);
          if(jpadCfg.buildWithModulesOn &&
              fs.existsSync(localModonPlovrPath)) {
            precompileModonPlovrPath =
                jpad.plovr.srcToPrecompilePath(localModonPlovrPath);
            var fcontent = fs.readFileSync(precompileModonPlovrPath);
            plovrModonJson = JSON.parse(fcontent);
            var moduleId = jpad.plovr.getMainModuleId(plovrModonJson);
            modonInfoPath = path.basename(plovrModonJson['module-info-path']);
            modonSrc = plovrModonJson['module-production-uri'];
            modonSrc = modonSrc.replace('%s', moduleId);
            src = modonSrc;
          } else {
            var plovrPath = src;
            var localPlovrPath = 
                    path.resolve(path.dirname(localHtmlPath), plovrPath);
            var absPlovrPath = path.relative('src/client', localPlovrPath);
            absPlovrPath = jpadCfg.appPath + absPlovrPath;
            var absJsPath =
                path.join(path.dirname(absPlovrPath), srcBasename+'.js');
            absJsPath = absJsPath.replace(/\\/g, '/');
            src = absJsPath;
          }
          $(this).attr('src', src);
      })
      if(plovrModonJson) {
        var insertedScript = 
            '<script src="'+modonInfoPath+'" type="text/javascript"></script>';
        $('script[src=\''+modonSrc+'\']').before(insertedScript);
      }
      var htmlout = $.html();
      var outPath = path.resolve('./build/client',
          path.relative('src/client', htmlPath));
      fs.ensureDirSync(path.dirname(outPath));
      fs.writeFileSync(outPath, htmlout, {encoding: 'utf-8'});
    });
    
    var htmls = glob.sync('build/client/**/*.html');
    goog.array.forEach(htmls, function(htmlPath) {
      var localHtmlPath = path.resolve('.', htmlPath);
      var fcontent = fs.readFileSync(localHtmlPath);
      var $ = cheerio.load(fcontent);
      var htmlPath = path.relative('build/client', htmlPath);
      jpad.absolutizePathsInHtml($, htmlPath, {
        build: true
      });
      var htmlout = $.html();
      htmlout = jpad.fillTemplateInHtml(htmlout);
      fs.writeFileSync(localHtmlPath, htmlout, {encoding: 'utf-8'});
    });
    
    cb();
  });
  
  gulp.task('build:bundle:js', function () {
    var filesToBundle = jpadCfg.bundle.filesToPrepend.map(function(f) {
          return './build/client/'+f;
        });
    var mainJsFile = path.join(
        path.dirname(jpadCfg.bundle.plovr),
        path.basename(jpadCfg.bundle.plovr, '.plovr.json')+ '.js'
    ).replace(/\\/g, '/');
    mainJsFile = './build/client/'+mainJsFile;
    filesToBundle.push(mainJsFile);
    
    var messageToPrepend = [
      '// Munimap. See https://maps.muni.cz/munimap/',
      '// Version: '+jpadCfg.appVersion+'-'+git.commitSync('.'),
      ''
    ].join('\n') + '\n';
    
    return gulp.src(filesToBundle)
      .pipe(plugins.concat(path.basename(mainJsFile)))
      .pipe(plugins.insert.prepend(messageToPrepend))
      .pipe(gulp.dest(path.dirname(mainJsFile)));
  });

  
  gulp.task('build:open', function(cb){
    var url = 'http://localhost:'+jpadCfg.port +
      jpadCfg.appPath;
    gulp.src(__filename)
      .pipe(plugins.open({
        uri: url
      }));
    cb();
  });
  

  gulp.task('build', gulp.series(
    gulp.parallel('build:clean', 'build:check-git'), 
    'build:copy', 
    gulp.parallel('build:plovr', 'build:css'),
    'build:html',
    'build:bundle:js',
    'build:serve',
    'build:open'
  ));
};

