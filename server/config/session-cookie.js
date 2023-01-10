module.exports = (env) => ({
    cookie: {
        secret_key: env.NODE_COOKIE_SECRET_KEY
    }
});
