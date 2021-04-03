# munimap

## Requirements
- Node.js 10+

## Installation
```
npm ci
```

## Develop
```
npm run dev
```
Visit [http://localhost:8080/]().

Development script starts [webpack](https://webpack.js.org/) with configuration in `webpack.config.dev.babel.js`. Webpack then ensures two main functions:
- transpile source code and make it available at [http://localhost:8080/munimaplib.js]()
- automatically reloads browser in case of any change in source JS files, or in case of any change in `dist` folder

## Build
```
npm run build
```

Build script runs webpack with configuration in `webpack.config.production.babel.js`. Webpack builds everything (including CSS styles) into `dist/munimaplib.js`.

Content of `dist` folder is then prepare to be published online.

You can also start server to see built version, just run
```
npm run start-build
```
and visit [http://localhost:8080/quickstart.html]().

## Type check
Type checking is ensure by [JSDoc annotations](https://jsdoc.app/) and [TypeScript](https://www.typescriptlang.org/) in the same way as [OpenLayers](https://openlayers.org/) do. The configuration is set in `tsconfig.json`.

To check types, run
```
npm run typecheck
```

## Code style
Code style is ensured by [ESLint](https://eslint.org/) with the same configuration as Openlayers library. The configuration is set in
- `package.json`, attribute `eslintConfig`
- in [eslint-config-openlayers](https://www.npmjs.com/package/eslint-config-openlayers) package
- in [@openlayers/eslint-plugin](https://www.npmjs.com/package/@openlayers/eslint-plugin) package

To check code style, run
```
npm run lint
```

To automatically fix some code-style issues, run
```
npm run fix-lint
```

## Breaking changes
-  OpenLayers library is not exported as [legacy build](https://github.com/openlayers/openlayers/blob/843c3e8853723e5d4fe27b410d7c2fc3fdfe4893/package.json#L24) anymore

   It means there is no `ol` namespace, no `ol.Map`, and so on. It is still possible to get `ol/Map` instance from `munimap.create()` functions, and this class has all methods available, but users can't initialize it, because it's not available in global space.

   It's possible to export any subset of OpenLayers classes and methods to `munimap.ol` object. Example is available in `src/munimap/index.js`, where two classes Map and View are exported. Such classes are available as `munimap.ol.Map` and `munimap.ol.View`.

## Upgrading OpenLayers
When upgrading OpenLayers, upgrade also following packages to the same version as new OpenLayers version uses.
- [eslint-config-openlayers](https://www.npmjs.com/package/eslint-config-openlayers)
- [@openlayers/eslint-plugin](https://www.npmjs.com/package/@openlayers/eslint-plugin)

Also, upgrade [@types/ol](https://www.npmjs.com/package/@types/ol) package to the same version as OpenLayers.

## Todo
- Upgrade [@types/ol](https://www.npmjs.com/package/@types/ol) package to version 6.5.0 when available
- Upgrade [webpack-dev-server](https://www.npmjs.com/package/webpack-dev-server) to version 4 when available

