# Rules of jpad code style

## Source files for client

### File names and location
* Source files for client are located in `src/client`
* Everything is there together: HTML, JS, CSS, Plovr configuration, whatever you need
* Directory names are in lower case matching `^[a-z][a-z0-9]*$`
* File names are in lower case matching `^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$`
* Every path inside `src/client` has unique directory names
 * This is wrong: ~~`src/client/duplicate/name/duplicate/`~~
* File name consists of parts separated by dot (extensions are not taken into account).
 * File `those.are.parts.js` consists of parts `those`, `are`, and `parts`
 * File `onepart.js` consists of part `onepart`
* Files are named in two ways: 
 1. No file name part equals to any directory name of the file path inside `src/client`
    * This is right: `src/client/path/to/file.js`
    * This is right: `src/client/path/to/file.and.something.else.js`
    * This is wrong: ~~`src/client/path/to/duplicatepart/file.duplicatepart.js`~~
 2. File name starts with parts that overlap with directory names at the end of of the file path inside `src/client`
    * This is right: `src/client/path/to/file/file.js`
    * This is right: `src/client/path/to/file/file.and.something.else.js`
    * This is right: `src/client/path/to/file/path.to.file.and.something.else.js`
    * This is wrong: ~~`src/client/path/to/file/path.to.js`~~
    * This is wrong: ~~`src/client/path/to/file/to.js`~~
    * This is wrong: ~~`src/client/path/to/file/file.to.path.js`~~

Note that file path parts (directories) and file name parts form one **sequence**. This sequence is closely related to JS namespaces inside these files (see bellow).

File path and name | Formed sequence
--- | ---
`src/client/path/to/file.js` | `path.to.file`
`src/client/path/to/file/file.js` | `path.to.file`
`src/client/path/to/file.and.something.else.js` | `path.to.file.and.something.else`
`src/client/path/to/file/file.and.something.else.js` | `path.to.file.and.something.else`
`src/client/path/to/file/path.to.file.and.something.else.js` | `path.to.file.and.something.else`
TODO: Avoid duplicate sequences (by jpad linter).

### JS files
* Every `*.js` inside `src/client` directory is ready for compilation using Closure Compiler's advanced mode. Exceptions:
  * `*.externs.js` is excluded from compilation, it might be treated as [externs files](https://developers.google.com/closure/compiler/docs/api-tutorial3).
* Namespace provided by `goog.provide` corresponds to the sequence formed by file path and file name (see above). If you convert namespace to lower case and remove trailing underscores, the character string is equal to or starts with the sequence.
 * File `src/client/path/to/file.js` forms `path.to.file` sequence, so it may contain following namespaces:
    * `path.to.file`
    * `path.to.File`
    * `path.to.FILE_`
    * `path.to.file.and.something.else`
    * etc.
* String literals starting with `./` are treated as **dir-relative or file-relative paths** that will be automatically transformed to domain-relative paths by jpad (because of HTML5 replaceState / pushState). **Always use one string literal containing complete path and filename!**
  * This is right: `var imgPath = './my.first.app.logo.png';`
  * This is wrong: ~~`var imgPath = 'my.first.app.logo.png';`~~
  * This is wrong: ~~`var imgPath = './my.first.app.logo' + '.png';`~~

### Plovr
* Every `*.plovr.json` is configuration file for Plovr
* Every HTML file may refer to one Plovr config with the same name.
* Reference to Plovr config is done by Plovr config file name, not by `http://plovrserver/compile?id=...`
  * Inside `example.ol3.index.html` you can find `<script src="example.ol3.index.plovr.json" type="text/javascript"></script>`
* If there is a file `*.dev.plovr.json`, it is a plovr configuration used for dev process.
  * Do not use link to `*.dev.plovr.json` inside HTML. Use link to main `*.plovr.json` and jpad will make the replacement automatically.
* Extern files (`*.externs.js`) are not precompiled, but it must be specified as externs inside `*.plovr.json`.
* Do not use 'css-inputs' and other CSS-related properties of Plovr. Use CSS [@import](https://developer.mozilla.org/en-US/docs/Web/CSS/@import) instead.
  * **TODO: Use @import only for import CSS files from inside `src/client`**
