import PACKAGE from './package.json';
import path from 'path';
import webpack from 'webpack';

export default {
  entry: [
    'regenerator-runtime/runtime',
    path.resolve(__dirname, 'src/munimap/index.js'),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'munimaplib.js',
    library: {
      name: 'munimap',
      type: 'umd',
    },
    clean: {
      keep: (filename) => {
        const keepExamples = filename.includes('example/');
        const keepMuni = filename.includes('muni/');
        const keepRootCss = /munimap.css$/.test(filename);
        const keepRootHtml = /index.html$/.test(filename);
        const keepFavicon = filename === 'favicon.ico';
        return (
          keepExamples || keepMuni || keepRootCss || keepRootHtml || keepFavicon
        );
      },
    },
  },
  devServer: {
    static: path.join(__dirname, 'dist'),
    hot: true,
    open: true,
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
        use: ['style-loader', 'css-loader'],
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
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(false),
      VERSION: JSON.stringify(PACKAGE.VERSION),
      APP_PATH: JSON.stringify('/'),
      PROD_DOMAIN: JSON.stringify(`localhost:${JSON.stringify(8080)}`),
    }),
  ],
};
