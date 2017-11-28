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
        try {
            var baseConfig = {
                entry: {},
                output: {},
                module: {
                    rules: []
                },
                plugins: []
            };
            // 获取配置文件中的prodConfig
            var prodConfig = require(path.join(process.cwd(), "moli.config.js")).prodConfig;
            // 合并webpackConfig
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
        } catch (e) {
            log.error(e);
            log.error("Please check the configuration file");
            process.exit(0);
        } finally {
        }
    }
};