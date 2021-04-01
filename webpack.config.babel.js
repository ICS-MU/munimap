const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "src/munimap/index.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "munimaplib.js",
    library: {
      name: "munimap",
      type: "umd",
    },
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