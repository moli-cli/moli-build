var log = require("../utils/moliLogUtil");

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

const PACKAGE_TYPE_PC = "pc";
const PACKAGE_TYPE_MOBILE = "mobile";

/**
 * 获取帮助
 */
function getHelp() {
    log.log("  Usage : ");
    log.log("");
    log.log("  moli build <platform> [options]");
    log.log("");
    log.log("  platform:");
    log.log("");
    log.log("    ios:       build ios app");
    log.log("    android:   build android app");
    log.log("");
    log.log("  options:");
    log.log("");
    log.log("    -m, --mobile       build native mobile package");
    log.log("    -w, --web          build native web package");
    log.log("    -s, --server       build server ip");
    log.log("    -p, --port         build server port");
    log.log("    -u, --username     build server username");
    log.log("    -h, --help         moli-build help info");
    log.log("    -v, --version      moli-build version");
    log.log("");
    log.log("  Examples:");
    log.log("");
    log.log("    $ moli build ios -s 123.103.9.204 -p 8050");
    log.log("    $ moli build android -s 123.103.9.204 -p 8050");
    log.log("");
    process.exit(0);
}

/**
 * 版本
 */
function getVersion() {
    log.success("version:" + require("../package.json").version);
    process.exit(0);
}

module.exports = {
    plugin: function (options) {
        var args = {};
        args.commands = options.cmd;
        args.pluginname = options.name;
        args.buildServerIp = DEFAULT_SERVER_IP;
        args.buildServerPort = DEFAULT_SERVER_PORT;
        args.buildServerUserName = DEFAULT_SERVER_USERNAME;
        if (options.argv.h || options.argv.help) {
            getHelp();
        }
        if (options.argv.v || options.argv.version) {
            getVersion();
        }
        if (options.argv.w || options.argv.web) {
            process.env.NODE_MOLIENV = PACKAGE_TYPE_PC;
        }
        if (options.argv.m || options.argv.mobile) {
            process.env.NODE_MOLIENV = PACKAGE_TYPE_MOBILE;
        }
        if (options.argv.s || options.argv.server) {
            // 设置buildServer地址
            var urlReg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
            var buildServerIp = options.argv.s;
            if (urlReg.test(buildServerIp)) {
                args.buildServerIp = buildServerIp;
            } else {
                buildServerIp = options.argv.server;
                if (urlReg.test(buildServerIp)) {
                    args.buildServerIp = buildServerIp;
                }
            }
            if (args.commands.length == 1) {
                log.error("Use BuildServer Build App Must Have platform param!");
                process.exit(1);
            } else {
                // 获取构建平台信息
                var buildPlatform = args.commands[1];
                if (buildPlatform != "android" && buildPlatform != "ios") {
                    log.error("Use BuildServer Build App platform Must Be android or ios!");
                    process.exit(1);
                }
                args.buildPlatform = buildPlatform;
                var buildServer = require(`../libs/build-server`);
                // 端口判断
                if (options.argv.p || options.argv.port) {
                    var buildServerPort = options.argv.p;
                    if (buildServerPort) {
                        args.buildServerPort = buildServerPort;
                    } else {
                        buildServerPort = options.argv.port;
                        if (buildServerPort) {
                            args.buildServerPort = buildServerPort;
                        }
                    }
                }
                if (args.buildServerPort < 80 || args.buildServerPort > 65534) {
                    log.error("Use BuildServer Build App port Must Be 80<=port<65535!");
                    process.exit(1);
                }
                // 用户判断
                if (options.argv.u || options.argv.username) {
                    var buildServerUserName = options.argv.u;
                    if (buildServerUserName) {
                        args.buildServerUserName = buildServerUserName;
                    } else {
                        buildServerUserName = options.argv.username;
                        if (buildServerUserName) {
                            args.buildServerUserName = buildServerUserName;
                        }
                    }
                }
                if (args.buildServerUserName == true || args.buildServerUserName.length == 0) {
                    log.error("Use BuildServer Build App username Can't use empty");
                    process.exit(1);
                }
                log.info("build mobile app args:" + JSON.stringify(args));
                buildServer.build(args);
            }
        } else {
            // 本地native构建，构建react
            if (!process.env.NODE_MOLIENV) {
                process.env.NODE_MOLIENV = PACKAGE_TYPE_PC;
            }
            var webpackBuild = require("../libs/build");
            webpackBuild.build();
        }
    }
};
