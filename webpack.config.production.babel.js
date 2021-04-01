import path from 'path';

export default {
  entry: path.resolve(__dirname, 'src/munimap/index.js'),
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
    ],
  },
  mode: 'production',
};
