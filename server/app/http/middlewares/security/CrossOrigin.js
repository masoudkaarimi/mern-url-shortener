const cors = require('cors');

/**
 * CORS stands for Cross-Origin Resource Sharing.
 * CORS is a browser security feature that restricts cross-origin HTTP requests with other servers and specifies which domains access your resources.
 */
module.exports = class CrossOrigin {
    /**
     * CORS handler
     * @param {Object} options - Options ->
     * - allowedList          : <String> <String[]> <RegExp>
     * - methods              : <String[]>
     * - preflightContinue    : <Boolean>
     * - optionsSuccessStatus : <Number>
     */
    constructor({
        /**
         * Allowed origins list
         * @type {String | String[] | RegExp}
         */
        allowedList = [
            'http://127.0.0.1:9000',
            'http://localhost:9000',
            'https://www.google.com',
            'https://masoudkarimi.postman.co',
            /\.example2\.com$/,
        ], // "*" or RegExp

        /**
         * Allowed methods list
         * @type {String | String[]}
         */
        methods = ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],

        /**
         * Pass the CORS preflight response to the next handler.
         * @type {Boolean}
         */
        preflightContinue = false,

        /**
         * Provides a status code to use for successful OPTIONS requests, since some legacy browsers (IE11, various SmartTVs) choke on 204.
         * @type {Number}
         */
        optionsSuccessStatus = 200,
    }) {
        this.options = {
            allowedList         : allowedList,
            methods             : methods,
            preflightContinue   : preflightContinue,
            optionsSuccessStatus: optionsSuccessStatus,
        };

        // Initializing the CORS handler.
        return this.init();
    }

    /**
     * Initializing the CORS handler
     * More info => https://github.com/expressjs/cors#configuration-options
     */
    init() {
        return cors({
            methods             : this.options.methods,
            preflightContinue   : this.options.preflightContinue,
            optionsSuccessStatus: this.options.optionsSuccessStatus,
            origin              : (origin, callback) => {
                // Allow requests with no origin (like mobile apps or curl requests).
                if (!origin) return callback(null, true);

                // console.log(chalk.cyan("Origin => ", origin));

                // Checks if the origin exists in the allowed list.
                if (this.options.allowedList.indexOf(origin) !== -1) return callback(null, true);
                else {
                    return callback(new Exception({
                        // message   : i18n.t('message:http.corsLimit', { origin }),
                        message   : "CORS Error",
                        statusCode: httpStatus.FORBIDDEN,
                        name      : 'CorsError',
                    }));
                }
            },
        });
    }
};
