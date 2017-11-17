var path = require("path");
var webpack = require("webpack");
var merge = require("webpack-merge");

var moliConfig;



try {
  moliConfig = require(path.resolve(".","moli.config.js")).prodConfig;
} catch (e) {
  console.log(e);
  process.exit(0);
} finally {

}



var baseConfig= {
  entry: {

  },
  output: {

  },
  module: {
    rules: []
  },
  plugins: []
}


module.exports = merge(baseConfig, moliConfig);
