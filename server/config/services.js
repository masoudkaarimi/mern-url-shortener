module.exports = (env) => ({
    service: {
        smtp: {
            host    : env.NODE_SMTP_HOST,
            port    : env.NODE_SMTP_PORT,
            username: env.NODE_SMTP_USERNAME,
            password: env.NODE_SMTP_PASSWORD,
            secure  : env.NODE_SMTP_SECURE,
            from    : {
                email: env.NODE_FROM_EMAIL,
                name : env.NODE_FROM_NAME
            }
        },
        sms : {
            kavenegar: {
                api_key: env.NODE_SMS_KAVENEGAR_API_KEY
            }
        }
    }
});
