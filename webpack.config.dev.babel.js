/* eslint-disable import/default */

import CircularDependencyPlugin from 'circular-dependency-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import express from 'express';
import glob from 'glob';
import path from 'path';
import webpack from 'webpack';
import {createRequire} from 'module';
import {fileURLToPath} from 'url';

const require = createRequire(import.meta.url);

const PACKAGE = require('./package.json');
const PORT = process.env['npm_config_port']
  ? process.env['npm_config_port']
  : 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env) => {
  const APP_PATH = '/munimap/testing/';
  const PROD_DOMAIN = env.domain ? env.domain : `https://maps.muni.cz`;
  const DEV_DOMAIN = `http://localhost:${env.port || PORT}`;

  const OUTPUT_PATH = path.join(path.resolve(__dirname, 'dist'), APP_PATH);

  const opts = {
    scriptLoading: 'blocking',
    inject: 'head',
    minify: false,
    appVersion: PACKAGE.version,
    olVersion: PACKAGE.dependencies.ol.substring(0, 1).match(/[0-9]/i)
      ? PACKAGE.dependencies.ol
      : PACKAGE.dependencies.ol.substring(1),
    appPath: APP_PATH,
    prodDomain: PROD_DOMAIN,
    warningWrapperClass: 'hide',
  };
  const examplePageNames = glob
    .sync('./src/example/*.html')
    .map((item) => path.basename(item, '.html'));
  const exampleHtmlPlugins = examplePageNames.map((name) => {
    return new HtmlWebpackPlugin({
      template: `./src/example/${name}.html`,
      filename: `./example/${name}.html`,
      ...opts,
    });
  });
  const docPageNames = glob
    .sync('./src/doc/*.html')
    .map((item) => path.basename(item, '.html'));
  const docHtmlPlugins = docPageNames.map((name) => {
    return new HtmlWebpackPlugin({
      template: `./src/doc/${name}.html`,
      filename: `./doc/${name}.html`,
      ...opts,
    });
  });

  const preprocessor = (content) => {
    const newContent = (content) => {
      const INCLUDE_PATTERN = /<%= (\w+) %>/gi;
      return INCLUDE_PATTERN.test(content)
        ? content.replace(INCLUDE_PATTERN, (_, group) => opts[group])
        : content;
    };
    return newContent(content);
  };

  return {
    entry: {
      munimaplib: [
        'regenerator-runtime/runtime',
        path.resolve(__dirname, 'src/munimap/index.js'),
      ],
    },
    output: {
      path: OUTPUT_PATH,
      publicPath: DEV_DOMAIN + APP_PATH,
      filename: '[name].js',
      library: {
        name: 'munimap',
        type: 'umd',
      },
      clean: true,
    },
    devServer: {
      static: {
        directory: OUTPUT_PATH,
      },
      hot: true,
      open: [APP_PATH],
      port: env.port || PORT,
      devMiddleware: {
        publicPath: APP_PATH,
        writeToDisk: false,
      },
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }

        devServer.app.use(
          /\/munimap\/testing\/css/,
          express.static(path.resolve(__dirname, 'src', 'css'))
        );

        devServer.app.use(
          /\/munimap\/testing\/img/,
          express.static(path.resolve(__dirname, 'src', 'img'))
        );

        return middlewares;
      },
      watchFiles: ['src/**/*.html'],
    },
    devtool: 'eval-cheap-module-source-map',
    module: {
      rules: [
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                minimize: false,
                preprocessor: preprocessor,
                sources: {
                  urlFilter: (attribute, value, resourcePath) =>
                    !/.*munimapext.js$/i.test(value),
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          exclude: [
            path.resolve(__dirname, 'src', 'css', 'example'),
            path.resolve(__dirname, 'src', 'css', 'doc'),
            path.join(__dirname, 'src', 'css', 'munimap.css'),
          ],
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.css/,
          include: [path.join(__dirname, 'src', 'css', 'munimap.css')],
          type: 'asset/resource',
          generator: {
            filename: 'css/[name][ext][query]',
          },
        },
        {
          test: /\.css/,
          include: [path.resolve(__dirname, 'src', 'css', 'example')],
          type: 'asset/resource',
          generator: {
            filename: 'css/example/[name][ext][query]',
          },
        },
        {
          test: /\.css/,
          include: [path.resolve(__dirname, 'src', 'css', 'doc')],
          type: 'asset/resource',
          generator: {
            filename: 'css/doc/[name][ext][query]',
          },
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.(png|jpg|jpeg|svg|ico)/,
          exclude: /font/,
          type: 'asset/resource',
          generator: {
            filename: 'img/[name][ext][query]',
          },
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          include: /font/,
          type: 'asset/resource',
          generator: {
            filename: 'font/[name][ext][query]',
          },
        },
      ],
    },
    mode: 'development',
    plugins: [
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(false),
        VERSION: JSON.stringify(PACKAGE.version),
        APP_PATH: JSON.stringify(APP_PATH),
        PROD_DOMAIN: JSON.stringify(PROD_DOMAIN),
        DEV_DOMAIN: JSON.stringify(DEV_DOMAIN),
      }),
      new CopyPlugin({
        patterns: [
          {
            from: '*.geojson',
            to: 'example/data',
            context: path.resolve(__dirname, 'resources'),
          },
          {
            from: './src/munimapext.js',
            context: path.resolve(__dirname),
          },
        ],
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: './index.html',
        ...opts,
      }),
      ...exampleHtmlPlugins,
      ...docHtmlPlugins,
      new CircularDependencyPlugin({
        include: /munimap/,
        // add errors to webpack instead of warnings
        failOnError: false,
        // allow import cycles that include an asyncronous import,
        // e.g. via import(/* webpackMode: "weak" */ './file.js')
        allowAsyncCycles: false,
        // set the current working directory for displaying module paths
        cwd: process.cwd(),
      }),
    ],
  };
};
