import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import PACKAGE from './package.json';
import glob from 'glob';
import path from 'path';
import webpack from 'webpack';

const APP_PATH = '/';
const PROD_DOMAIN = `localhost:${JSON.stringify(8080)}`;

const opts = {
  scriptLoading: 'blocking',
  inject: 'head',
  minify: false,
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

const preprocessor = (content) => {
  const newContent = (content) => {
    const INCLUDE_PATTERN = /<%= (.*) %>/gi;
    return INCLUDE_PATTERN.test(content)
      ? content.replace(INCLUDE_PATTERN, (_, group) => opts[group])
      : content;
  };
  return newContent(content);
};

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
  devServer: {
    static: path.join(__dirname, 'dist'),
    hot: true,
    open: true,
  },
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
            },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: [
          path.resolve(__dirname, 'src', 'css', 'example'),
          path.join(__dirname, 'src', 'css', 'munimap.css'),
        ],
        use: ['style-loader', 'css-loader'],
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
        test: /\.(js)$/,
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
    }),
    new CopyPlugin({
      patterns: [
        {
          from: '*.geojson',
          to: 'example/data',
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
