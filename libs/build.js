/*
 * @author: dongzhk
 * @date:   2017-11-21 00:00:00
 * @last modified time: 2017-11-21 18:10:00
 */

var log = require("../utils/moliLogUtil");
var path = require("path");
var webpack = require("webpack");
var merge = require("webpack-merge");

module.exports = {
    build: function () {
        log.info("Operation Now, Please Wait...");
        var baseConfig = {
            entry: {},
            output: {},
            module: {
                rules: []
            },
            plugins: []
        };
        var prodConfig = require(path.join(process.cwd(), "moli.config.js")).prodConfig;
        var webpackConfig = merge(baseConfig, prodConfig);
        webpack(webpackConfig, function (err, stats) {
            if (!err) {
                log.log('\n' + stats.toString({
                    hash: false,
                    chunks: false,
                    children: false,
                    colors: true
                }));
                log.success("Build Native Package Success!");
            } else {
                log.error(err);
            }
        });
    }
};