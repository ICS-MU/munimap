import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import PACKAGE from './package.json';
import express from 'express';
import glob from 'glob';
import path from 'path';
import webpack from 'webpack';

export default (env) => {
  const APP_PATH = '/munimap/testing/';
  const PROD_DOMAIN = `localhost:8080`;

  const OUTPUT_PATH = path.join(path.resolve(__dirname, 'dist'), APP_PATH);

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

  const preprocessor = (content) => {
    const newContent = (content) => {
      const INCLUDE_PATTERN = /<%= (.*) %>/gi;
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
      publicPath: APP_PATH,
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
      devMiddleware: {
        publicPath: APP_PATH,
        writeToDisk: false,
      },
      onAfterSetupMiddleware: (devServer) => {
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
      },
      watchFiles: ['src/**/*.html'],
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
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.(js|jsx)$/,
          use: 'react-hot-loader/webpack',
          include: /node_modules/,
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
};
