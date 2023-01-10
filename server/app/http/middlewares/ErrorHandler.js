const StackTracey = require("stacktracey");
const Joi = require("joi");
const notifier = require("node-notifier");

const Middleware = require("./Middleware");

/**
 * # Handles the Errors.
 * This middleware catches the errors that are thrown and sends them to the client.
 * @return {Response} Response error
 */
module.exports = class ErrorHandler extends Middleware {
    constructor(server) {
        super();

        // config
        this.server = server;
        this.showErrorNotify = false;
        this.showErrorConsole = false;

        // Initializing the error handler.
        return this.init();
    }

    /** Initializing the error handler. */
    init = () => (err, req, res, next) => {
        this.stack = new StackTracey(err);

        // Error display control in the console.
        if (this.showErrorConsole) {
            // console.log(prettyError.render(err));
            console.error(chalk.red.bold("Error development =>", err));
        }

        // Checks the NODE ENV.
        if (isDevelopmentMode) {
            this.sendErrorDevelopmentMode(err, req, res);

            // Error display control in the notification.
            if (this.showErrorNotify) this.sendErrorNotify(err, req);
        } else if (isProductionMode) {
            let error = err;

            if (error.name === "CastError") error = this.castErrorMongoose(error);
            else if (error.code === 11000) error = this.duplicateFieldsMongoose(error);
            else if (error.name === "ValidationError") error = this.validationError(error);

            this.sendErrorProductionMode(error, req, res);
        }

        process.on("uncaughtException", this.unexpectedError);
        process.on("unhandledRejection", this.unexpectedError);
        process.on("SIGTERM", () => {
            // logger.info('SIGTERM received');
            if (this.server) this.server.close();
        });
    };

    // if (error.name === 'JsonWebTokenError') error = handleJwtError();
    // if (error.name === 'TokenExpiredError') error = handleExpiredError();
    // const handleExpiredError = () => new Exception('Token expired , please login again', 401);
    // const handleJwtError = () => new Exception('Invalid token , please login again', 401);

    /**
     * Mongoose bad ObjectId
     * @param {Object} error
     * @returns {Exception}
     */
    castErrorMongoose(error) {
        const message = `Invalid ${error.path}: ${error.value}.`;
        return new Exception({message, statusCode: httpStatus.BAD_REQUEST, name: "CastError"});
    }

    /**
     * Mongoose duplicate key
     * @param {Object} error
     * @returns {Exception}
     */
    duplicateFieldsMongoose(error) {
        // console.log(error.message)
        // console.log(error.errmsg)
        // E11000 duplicate key error collection: arzancell.users index: mobile_1 dup key: { mobile: "09015906120" }

        // Deprecate
        // let field = (error.errmsg.match(/[index: ]\w+[_1]/)[0].split('_1')[0]).replace(' ', '')
        //or
        // let field = error.message.split('index: ')[1]
        // field = field.split(' dup key')[0]
        // field = field.substring(0, field.lastIndexOf('_'))

        // Main and is true
        // let field = error.message.split('.$')[1];
        // field = field.split(' dup key')[0];
        // field = field.substring(0, field.lastIndexOf('_'));

        // Test
        let field = error.message.split(".")[1];
        field = field.split(" dup key")[0];
        field = field.split("index: ")[1];
        field = field.substring(0, field.lastIndexOf("_"));

        let value = (error.errmsg.match(/(["'])(\\?.)*?\1/)[0]).replaceAll("\"", "");
        const message = `Duplicate field: '${field}' - value: '${value}'. Please use another value!`;
        return new Exception({message, statusCode: httpStatus.BAD_REQUEST, name: "E11000 duplicate key"});
    }

    /**
     *  Validation error
     * @param {Object} error
     * @returns {Exception}
     */
    validationError(error) {
        if (error instanceof Joi.ValidationError && error.isJoi) {
            return this.validationErrorJoi(error);
        } else {
            return this.validationErrorMongoose(error);
        }
    }

    /**
     * Mongoose validation error
     * @param {Object} error
     * @returns {Exception}
     */
    validationErrorMongoose(error) {
        const message = [];
        Object.values(error.errors).map(item => message.push({param: item.properties.path, message: item.message}));
        return new Exception({message, statusCode: httpStatus.BAD_REQUEST, name: "ValidationError"});
    }

    /**
     * Joi validation error
     * @param {Object} error
     * @returns {Exception}
     */
    validationErrorJoi(error) {
        // const message = error.details.map((err) => err.message).join(", ");

        /*const message = {};
        error.details.forEach(err => {
            Object.assign(message, {
                [err.context.key]: {
                    message: err.message.replace(/["']/gm, ""),
                    type   : err.type
                }
            });
        });*/

        /*
            test  : Joi.number().messages({
                "number.base"     : "{{#label}} must be at least a million",
                "number.big"      : "{{#label}} must be at least five millions",
                "number.round"    : "{{#label}} must be a round number",
                "number.dividable": "{{#label}} must be dividable by {{#q}}"
            }).required()
        */

        const message = error.details.map(err => {
            /* let key = err.context.key;
            let type = err.type;
            let path = err.path;
            let message = err.message.replace(/["']/gm, "");
            let context = err.context; */

            let {context, type, path, message} = err;
            let {key} = context;

            message = message.replace(/["']/gm, "");

            // if (type.includes("string")) {
            switch (type) {
                case "string.empty":
                    message = `${key} should not be empty.`;
                    break;
                case "string.min":
                    message = `${key} should have at least ${context.limit} characters.`;
                    break;
                case "string.max":
                    message = `${key} should have at most ${context.limit} characters.`;
                    break;
                case "string.pattern.base":
                    message = `${key} fails to match the required pattern: ${context.regex}`;
                    break;
                case "string.email":
                    message = `${key} must be a valid`;
                    break;
                default:
                    break;
            }
            // }

            return {
                // err,
                key,
                // type,
                // path,
                message
            };
        });

        return new Exception({message, statusCode: httpStatus.BAD_REQUEST});
    }

    /**
     * Send error for development mode
     * @param {Object} error
     * @param {Object} req
     * @param {Object} res
     */
    sendErrorDevelopmentMode(error, req, res) {
        res.fail({
            message     : {
                method      : req.method,
                path        : req.originalUrl,
                ip          : req.ip,
                message     : error.message || httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
                statusCode  : error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
                isPublic    : error.isPublic,
                name        : error.name,
                type        : error.type,
                code        : error.code,
                timestamp   : error.timestamp,
                fileName    : this.stack.items[0].fileName,
                file        : this.stack.items[0].file,
                line        : this.stack.items[0].line,
                column      : this.stack.items[0].column,
                "stack-path": `${this.stack.items[0].file}:${this.stack.items[0].line}:${this.stack.items[0].column}`,
                stack       : error.stack
                // "stack-trace": stack
            },
            statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
        });
    }

    /**
     * Send error for production mode
     * @param {Object} error
     * @param {Object} req
     * @param {Object} res
     */
    sendErrorProductionMode(error, req, res) {
        // Send error for client.

        if (error.isPublic) {
            res.fail({
                message   : error.code || error.message,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            });
        } else {
            // Programming or other unknown error.
            // Todo save log
            // console.log(error);

            res.internalServerError(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
        }
    }

    /**
     * Send error with notification
     * @param {Object} error
     * @param {Object} req
     */
    sendErrorNotify(error, req) {
        const title = `Error in ${req.method} - ${req.originalUrl}`;
        notifier.notify({
            title,
            message: `Name: ${error.name}\nMessage: ${error.message}\nStatus code: ${error.statusCode}\nType: ${error.type}`
        });
    }

    /**
     * Unexpected error handler
     * @param error
     */
    unexpectedError(error) {
        if (this.server) {
            /**
             * Unhandled rejection
             * Handle globally the unhandled rejection error which is outside the express
             */
            this.server.close((error) => {
                // console.log(prettyError.render(error));
                console.log(chalk.red(error));
                console.log(chalk.red.bold("Server closed."));
                process.exit(1); // https://nodejs.org/api/process.html#process_exit_codes
            });
        } else {
            // Uncaught Exception
            // console.log(prettyError.render(error));
            console.log(chalk.red(error));
            console.log(chalk.red.bold("Server closed."));
            process.exit(1);
        }
    }
};
