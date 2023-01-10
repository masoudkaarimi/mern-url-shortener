module.exports = (env) => ({
    app: {
        name         : env.NODE_APP_NAME,
        version      : env.NODE_APP_VERSION,
        protocol     : env.NODE_APP_PROTOCOL,
        ip_address   : env.NODE_APP_IP_ADDRESS,
        port         : env.NODE_APP_PORT,
        host         : env.NODE_APP_HOST,
        domain       : env.NODE_APP_DOMAIN,
        base_url     : `${env.NODE_APP_PROTOCOL}://${env.NODE_APP_HOST}:${env.NODE_APP_PORT}`,
        contact_email: env.NODE_APP_CONTACT_EMAIL,
        language     : env.NODE_APP_LANGUAGE
    }
});
