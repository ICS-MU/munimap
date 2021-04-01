import path from "path";

export default {
  entry: path.resolve(__dirname, "src/munimap/index.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "munimaplib.js",
    library: {
      name: "munimap",
      type: "umd",
    },
    clean: {
      keep: /\.html$/
    },
  },
  devServer: {
    static: path.join(__dirname, 'dist'),
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  mode: "development",
}