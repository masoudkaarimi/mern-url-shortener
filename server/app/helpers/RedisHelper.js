const redis = require("redis");
const Helper = require("./Helper");

module.exports = new class Redis extends Helper {
    constructor() {
        super();

        this.redis = redis.createClient({
            // url: config.get('db.redis.uri'),
            host: config.get("db.redis.host"),
            port: config.get("db.redis.port")
            // username: config.get('db.redis.username'),
            // password: config.get('db.redis.password'),
        });

        this.redis.on("connect", () => debug.main(chalk.green(`Redis Connected on ${chalk.bold(config.get("db.redis.host"))}`)));
        this.redis.on("end", () => debug.error(chalk.red(`Redis Disconnected`)));
        this.redis.on("reconnecting", () => debug.main(chalk.blue(`Redis Reconnecting`)));
        this.redis.on("error", (error) => debug.error(chalk.red(error)));
    }

    /**
     * Set item
     * @param key
     * @param value
     */
    setItem(key, value) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!key || key.length === "") throw new Error("key is required.");
                if (!value || value.length === "") throw new Error("value is required.");

                this.redis.set(key, value, (error, result) => {
                    // if (error) reject(error);
                    if (error) throw error;
                    resolve(result);
                });
            } catch (error) {
                reject(new Exception({message: error.message, name: "RedisError", isPublic: false}));
            }
        });
    }

    /**
     * Get item
     * @param key
     */
    getItem(key) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!key || key.length === "") throw new Error("key is required.");

                this.redis.get(key, (error, result) => {
                    if (error) throw error;
                    if (!result) throw (new Error(`Key '${key}' not found.`));
                    resolve(result);
                });
            } catch (error) {
                reject(new Exception({message: error.message, name: "RedisError", isPublic: false}));
            }
        });
    }

    /**
     * Remove item
     * @param key
     */
    removeItem(key) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!key || key.length === "") throw new Error("key is required.");

                this.redis.del(key, (error, result) => {
                    if (error) throw error;
                    if (!result) throw (new Error(`Key '${key}' not found.`));
                    resolve(result);
                });

            } catch (error) {
                reject(new Exception({message: error.message, name: "RedisError", isPublic: false}));
            }
        });
    }

};
