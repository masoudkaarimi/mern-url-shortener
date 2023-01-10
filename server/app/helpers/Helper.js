const autoBind = require("auto-bind");

module.exports = class Helper {
    constructor() {
        autoBind(this);
    }
};
