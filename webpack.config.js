const path = require("path");

module.exports = {
  context: __dirname,
  entry: "./lib/scrape.js",
  output: {
    path: path.join(__dirname),
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: [/\.js?$/],
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  devtool: 'source-maps',
  resolve: {
    modulesDirectories: ['node_modules', 'src'],
    extensions: ['', '.js', '.json']
  }
};
