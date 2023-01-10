module.exports = (env) => ({
  otp: {
    length: 5,
    expiry: 60 * 3 * 1000.0,
  },
  jwt: {
    access : {
      secret_key: env.NODE_JWT_ACCESS_SECRET_KEY,
      expires_at: env.NODE_JWT_ACCESS_EXPIRES_AT,
    },
    refresh: {
      secret_key: env.NODE_JWT_REFRESH_SECRET_KEY,
      expires_at: env.NODE_JWT_REFRESH_EXPIRES_AT,
    },
  },
});
