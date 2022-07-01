# munimap

## Requirements
- Node.js 12+

## Installation
```
npm ci
```

<br>

----
<br>

## Develop
```
npm run dev
```
Visit [http://localhost:8080/munimap/testing/]().

Development script starts [webpack](https://webpack.js.org/) with configuration in `webpack.config.dev.babel.js`. Webpack then ensures three main functions:
- transpile source code and make it available at [http://localhost:8080/munimap/testing/munimaplib.js]()
- automatically reloads browser in case of any change in source JS files
- precompile HTML pages (add variables from source code or webpack/npm config)

<br>

----
<br>

## Build
```
npm run build
```

Build script runs webpack with configuration in `webpack.config.production.babel.js`. Webpack builds everything (including CSS styles) into `dist/latest`.

Content of `dist` folder is then prepare to be published online.

You can also start server to see built version, just run
```
npm run start-build
```
and visit [http://localhost:8080/munimap/latest/quickstart.html]().

### Build to different web server folder
```
npm run build-testing
npm run build-v2n
```
Build script runs webpack with configuration in `webpack.config.production.babel.js`. Webpack builds everything (including CSS styles) into `dist/testing` or `dist/<previous-version>`.

<br>

----
<br>

## Test

```
npm run test
```
Test framework is designed for integration tests and use `mocha`, `chai` and `puppeteer` libraries. 

To create test use javascript files in `test/integration`.

Main functionality: 
```js
await page.evaluate(async () => {
   // code to run into browser
});

// assertions that compare expected and actual values
assert.equal();
assert.include();
...

```

<br>

----
<br>


## Type check
Type checking is ensure by [JSDoc annotations](https://jsdoc.app/) and [TypeScript](https://www.typescriptlang.org/) in the same way as [OpenLayers](https://openlayers.org/) do. The configuration is set in `tsconfig.json`.

To check types, run
```
npm run typecheck
```


<br>

----
<br>


## Code style
Code style is ensured by [ESLint](https://eslint.org/) with the same configuration as Openlayers library. The configuration is set in
- `package.json`, attribute `eslintConfig`
- in [eslint-config-openlayers](https://www.npmjs.com/package/eslint-config-openlayers) package
- in [@openlayers/eslint-plugin](https://www.npmjs.com/package/@openlayers/eslint-plugin) package
- in [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react) package

To check code style, run
```
npm run lint
```

To automatically fix some code-style issues, run
```
npm run fix-lint
```

<br>

----
<br>

## Breaking changes
-  OpenLayers library is not exported as [legacy build](https://github.com/openlayers/openlayers/blob/843c3e8853723e5d4fe27b410d7c2fc3fdfe4893/package.json#L24) anymore

   It means there is no `ol` namespace with all OpenLayers functions. 

   It's possible to export any subset of OpenLayers classes and methods to `munimap.ol` object. Example is available in `src/munimap/index.js`, where two classes Map and View are exported. Such classes are available as `munimap.ol.Map` and `munimap.ol.View`. For legacy support this exported object is added to window as global object `ol`. If `ol` already exists, munimap library can't be initialized.

<br>

----
<br>


## Upgrading OpenLayers
When upgrading OpenLayers, upgrade also following packages to the same version as new OpenLayers version uses.
- [eslint-config-openlayers](https://www.npmjs.com/package/eslint-config-openlayers)
- [@openlayers/eslint-plugin](https://www.npmjs.com/package/@openlayers/eslint-plugin)

Also, upgrade [@types/ol](https://www.npmjs.com/package/@types/ol) package to the same version as OpenLayers.

