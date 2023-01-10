const autoBind = require("auto-bind");
const mongoose = require("mongoose");

// Model
// const UserModel = mongoose.model("User");
// const OtpModel = mongoose.model("Otp");

module.exports = class Controller {
    constructor() {
        autoBind(this);

        this.model = {
            User: require('app/models/user/UserModel'),
            Otp : require('app/models/otp/OtpModel'),
            Url: require('app/models/url/UrlModel'),
            Visitor: require('app/models/visitor/VisitorModel'),
        };
    }
};
