/**
 * Exception helper
 */
module.exports = class Exception extends Error {
    /**
     * Creates an exception
     * @param {string} message     - Error message
     * @param {number} statusCode  - HTTP status code of error
     * @param {boolean} isPublic   - Whether the message should be visible to user or not
     * @param {string} name        - Error name
     * @param {string} type        - Error type
     * @param {number} code        - Error code
     * @param {number} timestamp   - Error timestamp
     * @param {string} stack       - Error stack
     */
    constructor(
        {
            message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
            statusCode = httpStatus.INTERNAL_SERVER_ERROR,
            isPublic = true,
            name,
            type = `${statusCode}`.startsWith(4) ? "Fail" : "Error",
            code = null,
            timestamp = Date.now(),
            stack = ""
        }) {
        super(message);

        this.message = message;
        this.statusCode = statusCode;
        this.isPublic = isPublic;
        this.name = name || this.constructor.name;
        this.type = type;
        this.code = code;
        this.timestamp = timestamp;

        if (stack) this.stack = stack;
        else Error.captureStackTrace(this, this.constructor);
    }
};
