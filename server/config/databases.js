module.exports = (env) => ({
  db: {
    mongodb: {
      host    : env.NODE_MONGODB_HOST,
      port    : env.NODE_MONGODB_PORT,
      username: env.NODE_MONGODB_USERNAME,
      password: env.NODE_MONGODB_PASSWORD,
      name    : env.NODE_MONGODB_NAME,
      uri     : `mongodb://${env.NODE_APP_IP_ADDRESS}:${env.NODE_MONGODB_PORT}/${env.NODE_MONGODB_NAME}`,
      options : {
        useNewUrlParser   : true,
        useUnifiedTopology: true,
      },
    },
    redis  : {
      host    : env.NODE_REDIS_HOST,
      port    : env.NODE_REDIS_PORT,
      username: env.NODE_REDIS_USERNAME,
      password: env.NODE_REDIS_PASSWORD,
      uri     : `redis://${env.NODE_REDIS_HOST}:${env.NODE_REDIS_PORT}`,
      options : {},
    },
  },
});
