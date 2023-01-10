const rateLimit = require('express-rate-limit');

/**
 * Limits the rate of too many requests.
 * This middleware restricts IP addresses that send too many requests at the same time.
 */
module.exports = class RateLimiter {
    /**
     * Limiting access to API calls
     * @param {Object} options - Options ->
     * - allowedList            : <String[]>
     * - windowMs               : <Number>
     * - max                    : <Number>
     * - message                : <String>
     * - legacyHeaders          : <Boolean>
     * - standardHeaders        : <Boolean>
     * - requestPropertyName    : <String>
     * - skipFailedRequests     : <Boolean>
     * - skipSuccessfulRequests : <Boolean>
     * - store                  : <MemoryStore>
     */
    constructor({
        /**
         * Allowed IP addresses list
         * @type {String[]}
         */
        allowedList = ['127.0.0.1' /*'::1'*/],

        /**
         * Time frame for which requests are checked/remembered.
         * Defaults to 60000 MS (1 Minute).
         * @type {Number}
         */
        windowMs = 1000 * 5, // 5 seconds

        /**
         * Limit each IP address to max number requests per `windowMs`
         * Defaults to 5. Set it to 0 to disable the rate limiter.
         *
         *  @example
         * Example of premium user
         * max = async (req, res) => {
         *   if (await this.isPremium(req.user)) return 10
         *   else return 5
         * }
         * async isPremium(user) {}
         * @type {Number}
         */
        max = 5,

        /**
         * Is the response message that a user gets whenever they have exceeded the limit
         * Defaults to 'Too many requests, please try again later.'
         * TODO Translate message
         * @type {String}
         */
        message = `Too many requests from this IP address: {{ip}}, please try again later.`,

        /**
         * Disable the `X-RateLimit-*` headers
         * Defaults to true (for backward compatibility).
         * @type {Boolean}
         */
        legacyHeaders = false,

        /**
         * Return rate limit info in the `RateLimit-*` headers
         * Defaults to false (for backward compatibility, but its use is recommended).
         * @type {Boolean}
         */
        standardHeaders = true,

        /**
         * The name of the property on the Express request object to store the rate limit info.
         * Defaults to 'rateLimit'.
         * Usage req.rateLimit
         * @type {String}
         */
        requestPropertyName = 'rateLimit',

        /**
         * When set to true, failed requests won't be counted Request considered failed when the requestWasSuccessful option returns false.
         * By default, this means requests fail when:
         * the response status >= 400
         * the request was cancelled before last chunk of data was sent (response close event triggered)
         * the response error event was triggered by response
         * Defaults to false
         * @type {Boolean}
         */
        skipFailedRequests = false,

        /**
         * If true, the library will (by default) skip all requests that are considered 'failed' by the requestWasSuccessful function.
         * By default, this means requests succeed when the response status code < 400.
         * Defaults to false
         * @type {Boolean}
         */
        skipSuccessfulRequests = false,

        /**
         * Custom store
         * More info => https://www.npmjs.com/package/express-rate-limit#store
         * By default, the memory-store is used.
         * @type {MemoryStore}
         */
        store = new rateLimit.MemoryStore(),

    }) {
        this.options = {
            allowedList           : allowedList,
            windowMs              : windowMs,
            max                   : max,
            message               : message,
            legacyHeaders         : legacyHeaders,
            standardHeaders       : standardHeaders,
            requestPropertyName   : requestPropertyName,
            skipFailedRequests    : skipFailedRequests,
            skipSuccessfulRequests: skipSuccessfulRequests,
            store                 : store,
        };

        // Initializing the Rate Limit handler
        return this.init();
    }

    /**
     * Initializing the Rate Limit handler
     * More info => https://github.com/nfriedly/express-rate-limit
     */
    init() {
        return rateLimit({
            windowMs       : this.options.windowMs,
            max            : this.options.max,
            message        : this.options.message,
            legacyHeaders  : this.options.legacyHeaders,
            standardHeaders: this.options.standardHeaders,
            skip           : (req, res, next, options) => this.options.allowedList.includes(req.ip),
            handler        : (req, res, next, options) => {
                if (isDevelopmentMode) {
                    // const { ['store']: remove, ...opts } = options;

                    res.fail({
                        message   : options.message.replace('{{ip}}', req.ip) /*req.i18n.t("message:http.tooManyRequests", {ip: req.ip})*/ || httpStatus[httpStatus.TOO_MANY_REQUESTS],
                        statusCode: httpStatus.TOO_MANY_REQUESTS,
                        options   : {
                            windowMs: options.windowMs,
                            max     : options.max,
                        },
                    });
                } else if (isProductionMode) {
                    res.tooManyRequests(options.message.replace('{{ip}}', req.ip) /*req.i18n.t("message:http.tooManyRequests", {ip: req.ip})*/ || httpStatus[httpStatus.TOO_MANY_REQUESTS]);
                }
            },
        });
    }
};
