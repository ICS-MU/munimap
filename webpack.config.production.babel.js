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
      keep: /\.html$/,
    },
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
    ],
  },
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(true),
      VERSION: JSON.stringify(PACKAGE.VERSION),
    }),
  ],
};
