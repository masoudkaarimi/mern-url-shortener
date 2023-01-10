const config = require("config");
const Exception = require("app/helpers/Exception");
const mongoose = require("mongoose");
const httpStatus = require("http-status");
const PrettyError = require("pretty-error");
const chalk = require("chalk");
// const I18next = require("i18next");

module.exports = [
    global.config = config,
    global.Exception = Exception,
    global.mongoose = mongoose,
    global.httpStatus = httpStatus,
    global.prettyError = new PrettyError(),
    global.chalk = chalk,

    global.isDevelopmentMode = config.get("env") === "development",
    global.isProductionMode = config.get("env") === "production",
    global.isTestMode = config.get("env") === "test",
    global.debug = {
        main   : require("debug")("app:main", ),
        info   : require("debug")("app:info"),
        warning: require("debug")("app:warning"),
        success: require("debug")("app:success"),
        error  : require("debug")("app:error")
    }
    // global.i18n = I18next
];
