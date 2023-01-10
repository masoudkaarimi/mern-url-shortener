const http = require('http');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');

// ========== Middlewares ==========
const ResponseHandler = require('app/http/middlewares/ResponseHandler');
const ErrorHandler = require('app/http/middlewares/ErrorHandler');
const RateLimiter = require('app/http/middlewares/security/RateLimiter');
const CrossOrigin = require('app/http/middlewares/security/CrossOrigin');

const app = express();

module.exports = class Application {
    constructor() {
        this.setupConfigs();
        this.setupLogs();
        this.setupDatabase();
    }

    /**
     * Setup configs
     */
    setupConfigs() {
        // Disables the express defaults.
        app.disable('x-powered-by');

        // Handles the HTTP Responses.
        app.use(new ResponseHandler());

        // Hosts server static files.
        app.use(express.static(path.resolve('public')));

        // Parses the HTTP JSON bodies.
        app.use(express.json({}));

        // Parses the URL-encoded params.
        app.use(express.urlencoded({ extended: false }));

        // Handles the cookies.
        app.use(cookieParser(config.get('cookie.secret_key')));

        // Limits the rate of too many requests.
        app.use(new RateLimiter({}));

        // handles the CORS.
        app.use(new CrossOrigin({}));

        // Sanitizes the data.
        app.use(mongoSanitize());

        // Sets the security headers.
        app.use(helmet());

        // Prevent XSS attacks.
        app.use(xss());

        // Prevent XSS attacks.
        app.use(compression({
            filter: (req, res) => {
                if (req.headers['x-no-compression']) {
                    // don't compress responses with this request header
                    return false;
                }

                // fallback to standard filter function
                return compression.filter(req, res);
            },
        }));

        // Sets the locals.
        app.use((req, res, next) => {
            res.locals = {
                // base_url: config.get("app.base_url"),
                // i18n: () => (text, render) => req.__(text, render),
                // app_name: config.get("app.name"),
                // user     : req.user,
            };
            next();
        });

        // Handles the Routes.
        // app.use("/", require("app/routes"));

        // Handles the requests not found.
        app.all('*', (req, res, next) => {
            res.notFound(httpStatus[httpStatus.NOT_FOUND] /*req.i18n.t("message:http.notFound", {url: req.originalUrl})*/);
        });
    }

    /**
     * Setup database
     */
    setupDatabase() {
        mongoose.set('strictQuery', false);
        mongoose.connect(config.get('db.mongodb.uri'), { ...config.get('db.mongodb.options') }).then((db) => {
            debug.main(chalk.green(`MongoDB Connected on ${chalk.bold(db.connection.host)}`));

            // Setup Express.
            this.setupExpress();
        }).catch((error) => {throw new Exception({ message: error.message, name: 'MongodbError' });});
    }

    /**
     * Setup Express
     */
    setupExpress() {
        // Creates the server.
        const server = http.createServer(app);

        // Starts the server.
        server.listen(config.get('app.port'), () => {
            debug.main(`App is running in ${chalk.cyan.bold(config.get('env'))} mode on port ${chalk.cyan.bold(config.get('app.port'))}`);
            debug.main(`URL: ${config.get('app.base_url')}`);
            debug.main(`Process ID: ${chalk.cyan.bold(process.pid)}`);
        });

        //  Handles the Errors.
        app.use(new ErrorHandler(server));
    }

    /**
     * Setup logs
     */
    setupLogs() {
        if (isProductionMode)
            app.use(morgan('tiny'));
        else if (isDevelopmentMode)
            app.use(morgan('dev'));
    }
};
