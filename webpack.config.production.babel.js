/* eslint-disable import/default */

import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import glob from 'glob';
import path from 'path';
import webpack from 'webpack';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import {createRequire} from 'module';
import {fileURLToPath} from 'url';

const require = createRequire(import.meta.url);

const PACKAGE = require('./package.json');
const PORT = process.env['npm_config_port']
  ? process.env['npm_config_port']
  : 8080;
const PROCESS_ENV_DOMAIN = process.env['npm_config_domain'];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env) => {
  let dir;
  let warningWrapperClass = '';
  if (env.dir === 'latest' || env.dir === 'testing') {
    dir = env.dir;
    warningWrapperClass = 'hide';
  } else if (env.dir === 'v2n') {
    dir = PACKAGE.version.split('.').slice(0, 2).join('.');
  } else {
    throw new Error('Unknown directory for output files.');
  }

  const APP_PATH = `/munimap/${dir}/`;
  const PROD_DOMAIN = PROCESS_ENV_DOMAIN || `https://maps.muni.cz`;
  const DEV_DOMAIN = `http://localhost:${env.port ? env.port : PORT}`;
  const OUTPUT_PATH = path.join(path.resolve(__dirname, 'dist'), APP_PATH);

  const opts = {
    scriptLoading: 'blocking',
    inject: 'head',
    minify: true,
    appVersion: PACKAGE.version,
    olVersion: PACKAGE.dependencies.ol.substring(0, 1).match(/[0-9]/i)
      ? PACKAGE.dependencies.ol
      : PACKAGE.dependencies.ol.substring(1),
    appPath: APP_PATH,
    prodDomain: PROD_DOMAIN,
    warningWrapperClass: warningWrapperClass,
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
      filename: '[name].js',
      library: {
        name: 'munimap',
        type: 'umd',
      },
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                minimize: true,
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
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.css/,
          include: [
            path.resolve(__dirname, 'src', 'css', 'example'),
            path.join(__dirname, 'src', 'css', 'munimap.css'),
          ],
          type: 'asset/resource',
          generator: {
            filename: 'css/[name][ext][query]',
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
    mode: 'production',
    plugins: [
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(true),
        VERSION: JSON.stringify(PACKAGE.version),
        APP_PATH: JSON.stringify(APP_PATH),
        PROD_DOMAIN: JSON.stringify(PROD_DOMAIN),
        DEV_DOMAIN: JSON.stringify(DEV_DOMAIN),
      }),
      new MiniCssExtractPlugin(),
      new CleanWebpackPlugin({
        dry: false,
        cleanOnceBeforeBuildPatterns: [
          path.join(path.resolve(__dirname, 'dist'), '**/*'),
        ],
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
    ],
  };
};
