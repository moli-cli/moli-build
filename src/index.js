var chalk = require("chalk");
var path = require("path");
var webpack = require("webpack");
var fs = require("fs");

/**
 * 这个是云构建服务器默认ip
 * @type {string}
 */
const DEFAULT_SERVER_IP = "123.103.9.204";

/**
 * 这个是云构建服务器默认端口
 * @type {string}
 */
const DEFAULT_SERVER_PORT = "8050";

/**
 * 这个是云构建服务器默认用户名
 * @type {string}
 */
const DEFAULT_SERVER_USERNAME = "littlemod";

/**
 * 获取帮助
 */
function getHelp() {
    console.log(chalk.green(" Usage : "));
    console.log();
    console.log(chalk.green(" moli build"));
    console.log();
    process.exit(0);
}

/**
 * 版本
 */
function getVersion() {
    console.log(chalk.green(require("../package.json").version));
    process.exit(0);
}

/**
 * 本地生成public
 */
function build() {
    console.log(chalk.green(`[version]:${require("../package.json").version}`));
    console.log("[moli]: Operation now, please wait");
    var webpackConfig = require("./webpack.base");
    webpack(webpackConfig, function (err, stats) {
        if (!err) {
            console.log('\n' + stats.toString({
                hash: false,
                chunks: false,
                children: false,
                colors: true
            }));
            console.log("\n[moli]: moli build success!");
        } else {
            console.log(err);
        }
    });
}

/**
 * moli build log
 * @param msg
 */
function $moliBuildInfo(msg) {
    if (chalk) {
        console.log(chalk.hex('#54511f')('[moli-build-info] >>> ' + msg));
    } else {
        console.log('[moli-build-info] >>> ' + msg);
    }
}

/**
 *
 * @param msg
 */
function $moliBuildErr(msg) {
    if (chalk) {
        console.log(chalk.hex('#ff0000')('[moli-build-error] >>> ' + msg));
    } else {
        console.log('[moli-build-error] >>> ' + msg);
    }
}

module.exports = {
    plugin: function (options) {
        var commands = options.cmd;
        var pluginname = options.name;
        if (options.argv.h || options.argv.help) {
            getHelp();
        }
        if (options.argv.v || options.argv.version) {
            getVersion();
        }
        if (options.argv.s || options.argv.server) {
            var moliProdConfig = require(path.resolve(".", "moli.config.js")).prodConfig;
            var mobileOutputPath = moliProdConfig.output.path;
            // 检查是否有public包产出
            $moliBuildInfo("检查移动app生成的目录：" + mobileOutputPath);
            if (!fs.existsSync(mobileOutputPath)) {
                $moliBuildErr("Moble File Path :" + mobileOutputPath + " is Empty!");
                process.exit(0);
            }
            // 设置默认值
            console.log("-server:" + options.argv.s);
            // 创建native/platform/projectName/www
            // 压缩native/platform/projectName.zip
            // 创建output/platform/export.zip
        }
        build();

    }
}
