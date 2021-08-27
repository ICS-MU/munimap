import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import PACKAGE from './package.json';
import glob from 'glob';
import path from 'path';
import webpack from 'webpack';

const APP_PATH = '/munimap/';
const PROD_DOMAIN = 'maps.muni.cz';

const opts = {
  scriptLoading: 'blocking',
  inject: 'head',
  minify: false, //true
  appVersion: PACKAGE.version,
  olVersion: PACKAGE.dependencies.ol.substr(0, 1).match(/[0-9]/i)
    ? PACKAGE.dependencies.ol
    : PACKAGE.dependencies.ol.substring(1),
  appPath: APP_PATH,
  prodDomain: PROD_DOMAIN,
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

export default {
  entry: {
    munimaplib: [
      'regenerator-runtime/runtime',
      path.resolve(__dirname, 'src/munimap/index.js'),
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
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
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
      {
        test: /\.(png)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'img/',
            },
          },
        ],
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
    }),
    new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: '*.css',
          context: path.resolve(__dirname, 'src', 'css'),
        },
        {
          from: '*.css',
          to: 'example',
          context: path.resolve(__dirname, 'src', 'css', 'example'),
        },
        {
          from: '*.@(png|svg)',
          to: 'img',
          context: path.resolve(__dirname, 'src', 'img'),
        },
        {
          from: '*.ico',
          context: path.resolve(__dirname, 'src', 'img'),
        },
        {
          from: '*.geojson',
          to: 'example',
          context: path.resolve(__dirname, 'resources'),
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html',
      ...opts,
    }),
    ...exampleHtmlPlugins,
  ],
};
