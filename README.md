# jpad

JS devstack oriented to [Google Closure](https://developers.google.com/closure/) 
* includes Google Closure [Compiler](https://github.com/google/closure-compiler), [Library](https://github.com/google/closure-library), and [Linter](https://developers.google.com/closure/utilities/docs/linter_howto)
* ready for [advanced optimizations](https://developers.google.com/closure/compiler/docs/compilation_levels) using [plovr](https://github.com/bolinfest/plovr)
* [OpenLayers 3](http://openlayers.org/) included, see [example](https://github.com/jirik/jpad/tree/master/src/client/example/ol3)
* able to compile your code into multiple modules or to a single file, see [example](https://github.com/jirik/jpad/tree/master/src/client/example/module)
* both Linux and Windows friendly
* dev, build, lint, or fix in a single command

Current versions:
* OpenLayers [v3.13.1](https://github.com/openlayers/ol3/releases)
* Closure Library [2016-01-05](https://github.com/google/closure-library/commits/fe66ad635ad3ff2bc8ee85933e4bf86bfa7523fb)
* Closure Compiler [v20151216](https://github.com/google/closure-compiler/releases)
* Closure Linter [2015-12-10](https://github.com/google/closure-linter/commits/5c27529075bb88bdc45e73008f496dec8438d658)
* plovr [v5.0.1](https://github.com/bolinfest/plovr/releases)

This repository is not officially supported by Google, ol3, or individual module authors.

## Requirements
* [Java 7 or higher](http://www.java.com/)
  * Windows users: `path/to/directory/with/java.exe` must be in your PATH system variable
* [Python 2.7](https://www.python.org/downloads/) (32bit or 64bit; must correspond with node.js because of node-gyp)
  * Windows users: `path/to/python/directory` and `path/to/python/directory/Scripts` must be in your PATH system variable
* [node.js 5.6 or higher](http://nodejs.org/download/) (32bit or 64bit; must correspond with Python 2.7 because of node-gyp)
* [gulp](http://gulpjs.com/) `(sudo) npm install -g gulp-cli`
* [bower](http://bower.io/) `(sudo) npm install -g bower`
* [git](http://git-scm.com/downloads)
  * Windows users: `path/to/directory/with/git.exe` must be in your PATH system variable

## Installation
```
git clone https://github.com/jirik/jpad.git
cd jpad
npm install
bower install
(sudo) gulp install
```
### Problems with installation
Windows users: If you have some errors during `npm install` related to [node-gyp](https://github.com/TooTallNate/node-gyp), you will probably need to install [Microsoft Visual Studio C++ 2012 Express for Windows Desktop](http://www.microsoft.com/en-us/download/details.aspx?id=34673) and run the installation again.

## Development
* `gulp` to run dev server and open app in the browser
  * Edit files in `src/client` and see changes in the browser
* `gulp -H` to get more commands

## Build
* `gulp build` to compile the code and copy files to `build/`
* `gulp build -s` to include also [source maps](https://developer.chrome.com/devtools/docs/javascript-debugging#source-maps)
* `gulp -H` to get more commands

