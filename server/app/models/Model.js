const autoBind = require('auto-bind');

module.exports = class Model {
    constructor() {
        autoBind(this);
    }
}
