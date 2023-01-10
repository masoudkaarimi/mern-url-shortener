/**
 * Generate base64 string
 * @example
 * node -e "console.log(require('crypto').randomBytes(256).toString('base64'))"
 * node -e "console.log(require("crypto").randomBytes(35).toString("hex"))"
 */

const dotenv = require('dotenv').config({ path: '.env' });
const Joi = require('joi');
const Exception = require('app/helpers/Exception');
const httpStatus = require('http-status');

// Checks if the .env file exists.
if (dotenv.error) {
  throw new Exception({
    message   : '⚠️ Couldn\'t find .env file. ⚠️',
    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
    name      : 'DotEnvError',
  });
}

// .env file schema
const envSchema = Joi.object().keys({
  // ========== Environment ==========
  NODE_ENV     : Joi.string().valid('development', 'production', 'test').default('development'),
  NODE_TIMEZONE: Joi.string().valid('US-en', 'IR-fa').default('US-en'),
  DEBUG   : Joi.string().default('app:main').default('app:main,app:info,app:warning,app:success,app:error'),

  // ========== App ==========
  NODE_APP_NAME         : Joi.string().required(),
  NODE_APP_VERSION      : Joi.string().required(),
  NODE_APP_IP_ADDRESS   : Joi.string().ip().required(),
  NODE_APP_PROTOCOL     : Joi.string().required(),
  NODE_APP_HOST         : Joi.string().hostname().required(),
  NODE_APP_PORT         : Joi.number().port().required(),
  NODE_APP_DOMAIN       : Joi.string().domain().required(),
  NODE_APP_CONTACT_EMAIL: Joi.string().email().required(),
  NODE_APP_LANGUAGE     : Joi.string().required(),

  // ========== Session and Cookie ==========
  NODE_COOKIE_SECRET_KEY : Joi.string().base64().required(),
  NODE_SESSION_SECRET_KEY: Joi.string().base64().required(),

  // ========== Databases ==========
  // MongoDB
  NODE_MONGODB_HOST    : Joi.string().hostname().required(),
  NODE_MONGODB_PORT    : Joi.number().port().required(),
  NODE_MONGODB_USERNAME: Joi.string().required(),
  NODE_MONGODB_PASSWORD: Joi.string().min(8).required(),
  NODE_MONGODB_NAME    : Joi.string().required(),

  // Redis
  NODE_REDIS_HOST    : Joi.string().hostname().required(),
  NODE_REDIS_PORT    : Joi.number().port().required(),
  NODE_REDIS_USERNAME: Joi.string().required(),
  NODE_REDIS_PASSWORD: Joi.string().min(8).required(),

  // ========== Auth ==========
  // JSON Web Token (JWT)
  NODE_JWT_ACCESS_SECRET_KEY : Joi.string().base64().required(),
  NODE_JWT_ACCESS_EXPIRES_AT : Joi.string().required(),
  NODE_JWT_REFRESH_SECRET_KEY: Joi.string().base64().required(),
  NODE_JWT_REFRESH_EXPIRES_AT: Joi.string().required(),
  // JWT_RESET_PASSWORD_KEY: Joi.string().base64().required(),
  // JWT_RESET_PASSWORD_EXPIRES_AT: Joi.number().required(),

  // ========== Services ==========
  // Message Services
  // SMTP
  NODE_SMTP_HOST    : Joi.string().hostname().default('smtp.ethereal.email'),
  NODE_SMTP_PORT    : Joi.number().port().default(587),
  NODE_SMTP_USERNAME: Joi.string().default('turner.orn39@ethereal.email'),
  NODE_SMTP_PASSWORD: Joi.string().min(8).default('1t2KQTKGjyhnybs14Y'),
  NODE_SMTP_SECURE  : Joi.boolean().default(false),
  NODE_FROM_EMAIL   : Joi.string().email().default('noreply@boilerplate.com'),
  NODE_FROM_NAME    : Joi.string().default('Boilerplate'),

  // SMS
  NODE_SMS_KAVENEGAR_API_KEY: Joi.string().required(),
}).unknown();

// Checks if the values in the .env file are valid.
const { value: env, error } = envSchema.prefs({ errors: { label: 'key' } }).validate(process.env);
if (error) {
  throw new Exception({
    message   : `.env values validation error: ${error.message}`,
    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
    name      : 'DotEnvError',
  });
}

module.exports = {
  env     : env.NODE_ENV,
  debug   : env.NODE_DEBUG,
  timezone: env.NODE_TIMEZONE,
  ...require('./app')(env),
  ...require('./session-cookie')(env),
  ...require('./databases')(env),
  ...require('./auth')(env),
  ...require('./services')(env),
  ...require('./constants'),
};
