require("app-module-path").addPath(__dirname);
require("./config/globals");

const Application = require("./app");
new Application();
