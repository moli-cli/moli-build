/*
 * @author: dongzhk
 * @date:   2017-11-21 00:00:00
 * @last modified time: 2017-11-21 18:10:00
 */

var log = require("../utils/moliLogUtil");
var fs = require("fs-extra");
var path = require("path");
var zipper = require("zip-local");
var needle = require("needle");

const FILE_MOBILEAPPCONFIG_JSON = "app.config.json";
const FILE_CONFIG_JSON = "config.json";
const FILE_EXPORT_ZIP = "export.zip";
const DIR_NATIVE = "native";
const DIR_OUTPUT = "output";
const DIR_PUBLIC = "public";
const DIR_MOBILE = "mobile";
const DIR_WWW = "www";
const FILE_TYPE_ZIP = ".zip";
const BUILD_URL = "/ump/web/cordovabuild/buildProject";

module.exports = {
    build: function (args) {
        // 获取构建的平台名称
        var buildPlatform = args.buildPlatform;
        // 获取当前项目路径
        var projectDirPath = process.cwd();
        // 获取public/mobile包产出目录
        var mobileOutputPath = path.join(projectDirPath, DIR_PUBLIC, DIR_MOBILE);
        // 检查是否有public包产出
        log.info("Check Mobile File Path ：" + mobileOutputPath);
        if (!fs.existsSync(mobileOutputPath)) {
            log.error("Can't Found Moble File Dir Path :" + mobileOutputPath + "!");
            process.exit(1);
        }
        // 检查移动BuildApp项目配置文件
        log.info("Check MobileAppConfig File Path ：" + mobileOutputPath);
        var mobileAppConfigFile = path.join(projectDirPath, FILE_MOBILEAPPCONFIG_JSON);
        if (!fs.existsSync(mobileAppConfigFile)) {
            log.error("Can't Found Moli Project app.config.json File.");
            process.exit(1);
        }
        log.info("Read app.config.json Info....");
        var mobileAppConfigObj = JSON.parse(fs.readFileSync(mobileAppConfigFile));
        var projectName = mobileAppConfigObj.buildSetting.projectName;
        var appName = mobileAppConfigObj.buildSetting.appName;
        var packageName = mobileAppConfigObj.buildSetting.packageName;
        var versionName = mobileAppConfigObj.buildSetting.versionName;
        log.info("Success Read Project Config Info.");
        log.info("Build [" + buildPlatform + "] App");
        log.info("Project Name:" + projectName);
        log.info("App Name:" + appName);
        log.info("App PackageName:" + packageName);
        log.info("App VersionName:" + versionName);
        // 清空native下的platform目录
        var nativePlatformDirPath = path.join(projectDirPath, DIR_NATIVE, buildPlatform);
        if (fs.existsSync(nativePlatformDirPath)) {
            fs.removeSync(nativePlatformDirPath);
        }
        // platform下项目目录
        var nativeProjectDirPath = path.join(nativePlatformDirPath, projectName);
        // 项目下www目录
        var nativeProject3wDirPath = path.join(nativeProjectDirPath, DIR_WWW);
        fs.mkdirsSync(nativeProject3wDirPath);
        // 将mobileOut的信息拷贝到www中
        fs.copySync(mobileOutputPath, nativeProject3wDirPath);
        // 拷贝完成后，需要将mobileAppConfig.json拷贝到www中,并修改名称为config.json
        fs.copySync(mobileAppConfigFile, path.join(nativeProject3wDirPath, FILE_CONFIG_JSON));
        // 项目压缩文件
        var projectZipFile = path.join(nativePlatformDirPath, projectName + FILE_TYPE_ZIP);
        log.info("Start Compress Project File ...")
        // 操作压缩
        zipper.sync.zip(nativePlatformDirPath).compress().save(projectZipFile);
        log.info("Compress Done!");
        // 这里需要初始化native/output/platform
        var outputDirPath = path.join(projectDirPath, DIR_NATIVE, DIR_OUTPUT, buildPlatform);
        if (!fs.existsSync(outputDirPath)) {
            fs.mkdirsSync(outputDirPath);
        }
        // 操作发送构建App请求
        var buildServerIp = args.buildServerIp;
        var buildServerPort = args.buildServerPort;
        var buildServerUserName = args.buildServerUserName;
        var buildAppUrl = `http://${buildServerIp}:${buildServerPort}${BUILD_URL}`;
        // 获取文件二进制流
        var buffer = fs.readFileSync(projectZipFile);
        var data = {
            zip_file: {
                buffer: buffer,
                filename: projectName + FILE_TYPE_ZIP,
                content_type: 'application/octet-stream'
            },
            userName: buildServerUserName,
            buildType: buildPlatform
        };
        // 请求默认信息
        needle.defaults({
            open_timeout: 360000,
            parse_response: false
        });
        log.info("Start Send Build App Request To BuildServer.");
        log.info("App Is Building.. Please Wait For A Moment.");
        // 发送构建命令开始等待
        var startTime = new Date().getTime();
        // 这里需要定时函数处理打包延迟
        log.logInLine("Building.", "#00ff00");
        var buildAppTimer = setInterval(function () {
            log.logInLine(".", "#00ff00")
        }, 3000);
        needle.post(buildAppUrl, data, {
            multipart: true,
            output: path.join(outputDirPath, FILE_EXPORT_ZIP)
        }, function (err, resp, data) {
            // 加个换行
            log.log("");
            if (err) {
                log.error("Build App Error:\n" + err);
                process.exit(1);
            }
            clearInterval(buildAppTimer);
            var endTime = new Date().getTime();
            log.info("Used Time：" + (endTime - startTime) / 1000 + "s");
            // 获取返回信息
            log.success("Success Get BuildServer Response File:\n" + path.join(outputDirPath, FILE_EXPORT_ZIP));
        });
    }
};
