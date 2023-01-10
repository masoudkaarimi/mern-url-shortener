const Middleware = require("./Middleware");
const httpStatus = require("http-status");
/**
 * # Handles the HTTP Responses.
 * This middleware is a helper that binds methods to the response object to send responses to the client in a standard way.
 * @return {Response} Response
 */
module.exports = class ResponseHandler extends Middleware {
    constructor() {
        super();

        /**
         * Initializes the response handler.
         */
        return this.init();
    }

    /**
     * Initializes the response handler.
     */
    init() {
        return (req, res, next = null) => {
            this.req = req;
            this.res = res;
            this.next = next;

            // JSON for pure NodeJS support
            if (res.json === undefined) {
                res.json = (data) => {
                    res.setHeader("content-type", "application/json");
                    res.end(JSON.stringify(data));
                };
            }

            res.respond = this.respond;
            res.fail = this.fail;
            // res.paginate = this.paginate;

            res.ok = this.ok;
            res.created = this.created;
            res.noContent = this.noContent;
            res.unauthorized = this.unauthorized;
            res.forbidden = this.forbidden;
            res.notFound = this.notFound;
            res.badRequest = this.badRequest;
            res.unprocessableEntity = this.unprocessableEntity;
            res.conflict = this.conflict;
            res.tooManyRequests = this.tooManyRequests;
            res.methodNotAllowed = this.methodNotAllowed;
            res.badGateway = this.badGateway;
            res.serviceUnavailable = this.serviceUnavailable;
            res.internalServerError = this.internalServerError;

            if (next !== null) next();
        };
    }

    /**
     * Respond handler.
     * @param message
     * @param data
     * @param statusCode
     * @param options
     */
    respond({message = null, data = null, statusCode = httpStatus.OK, ...options}) {
        if (message === null && data == null) this.res.sendStatus(httpStatus.NO_CONTENT); else this.res.status(statusCode).json({
            success: true, message, ...(data && {data}), ...options
        });
    }

    /**
     * Failed handler.
     * @param message
     * @param statusCode
     * @param options
     */
    fail({message = null, statusCode = httpStatus.BAD_REQUEST, ...options}) {
        if (message === null) this.res.sendStatus(httpStatus.NO_CONTENT); else this.res.status(statusCode).json({
            // success: false, message, ...options
            success: false, error: message, ...options
            // success: false, message: {error: message}, ...options
        });
    }

    /**
     * Paginate handler
     * @param message
     * @param statusCode
     */

    /*paginate({message = null, statusCode = httpStatus.OK}) {
        if (message === null) this.res.sendStatus(httpStatus.NO_CONTENT); else this.res.status(statusCode).json({
            success: true, message: {
                ...message, page: 2, limit: 3, total: 10
            }
        });
    }*/

    /**
     * 200 OK - The request is OK (this is the standard response for successful HTTP requests).
     * @param message
     * @param data
     * @param statusCode
     */
    ok(message = null, data = null, statusCode = httpStatus.OK) {
        this.respond({message, data, statusCode});
    }

    /**
     * 201 Created - The request has been fulfilled and resulted in a new resource being created.
     * @param message
     * @param data
     * @param statusCode
     */
    created(message = null, data = null, statusCode = httpStatus.CREATED) {
        this.respond({message, data, statusCode});
    };

    /**
     * 204 No Content The request has been successfully processed, but is not returning any content.
     */
    noContent() {
        this.respond({});
    };

    /**
     * 401 Unauthorized - The request was a legal request, but the server is refusing to respond to it. For use when
     * authentication is possible but has failed or not yet been provided.
     * @param message
     * @param statusCode
     */
    unauthorized(message = httpStatus[httpStatus.UNAUTHORIZED], statusCode = httpStatus.UNAUTHORIZED) {
        // Access denied
        this.fail({message, statusCode});
    };

    /**
     * 403 Forbidden - The request was a legal request, but the server is refusing to respond to it.
     * @param message
     * @param statusCode
     */
    forbidden(message = httpStatus[httpStatus.FORBIDDEN], statusCode = httpStatus.FORBIDDEN) {
        this.fail({message, statusCode});
    };

    /**
     * 404 Not Found - The requested resource could not be found but may be available again in the future. Subsequent
     * requests by the client are permissible.
     * @param message
     * @param statusCode
     */
    notFound(message = httpStatus[httpStatus.NOT_FOUND], statusCode = httpStatus.NOT_FOUND) {
        this.fail({message, statusCode});
    };

    /**
     * 400 Bad Request - The request cannot be fulfilled due to bad syntax.
     * @param message
     * @param statusCode
     */
    badRequest(message = httpStatus[httpStatus.BAD_REQUEST], statusCode = httpStatus.BAD_REQUEST) {
        // Invalid data
        this.fail({message, statusCode});
    };

    /**
     * 422 unprocessable entity - The request was well-formed but was unable to be followed due to semantic errors.
     * @param message
     * @param statusCode
     */
    unprocessableEntity(message = httpStatus[httpStatus.UNPROCESSABLE_ENTITY], statusCode = httpStatus.UNPROCESSABLE_ENTITY) {
        // Validation error & Invalid data
        this.fail({message, statusCode});
    };

    /**
     * 409 Conflict - The request could not be completed because of a conflict in the request.
     * @param message
     * @param statusCode
     */
    conflict(message = httpStatus[httpStatus.CONFLICT], statusCode = httpStatus.CONFLICT) {
        // Resource exists
        this.fail({message, statusCode});
    };

    /**
     * 429 Too Many Requests - The user has sent too many requests in a given amount of time.
     * @param message
     * @param statusCode
     */
    tooManyRequests(message = httpStatus[httpStatus.TOO_MANY_REQUESTS], statusCode = httpStatus.TOO_MANY_REQUESTS) {
        this.fail({message, statusCode});
    };

    /**
     * 405 Method Not Allowed - A request was made of a page using a request method not supported by that page.
     * @param message
     * @param statusCode
     */
    methodNotAllowed(message = httpStatus[httpStatus.METHOD_NOT_ALLOWED], statusCode = httpStatus.METHOD_NOT_ALLOWED) {
        this.fail({message, statusCode});
    };

    /**
     * 502 Bad Gateway - The server was acting as a gateway or proxy and received an invalid response from the
     * upstream server.
     * @param message
     * @param statusCode
     */
    badGateway(message = httpStatus[httpStatus.BAD_GATEWAY], statusCode = httpStatus.BAD_GATEWAY) {
        this.fail({message, statusCode});
    };

    /**
     * 503 Service Unavailable - The server is currently unavailable (overloaded or down).
     * @param message
     * @param statusCode
     */
    serviceUnavailable(message = httpStatus[httpStatus.SERVICE_UNAVAILABLE], statusCode = httpStatus.SERVICE_UNAVAILABLE) {
        this.fail({message, statusCode});
    };

    /**
     * 500 Internal Server Error - A generic error message, given when no more specific message is suitable.
     * @param message
     * @param statusCode
     */
    internalServerError(message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR], statusCode = httpStatus.INTERNAL_SERVER_ERROR) {
        this.fail({message, statusCode});
    };
};
