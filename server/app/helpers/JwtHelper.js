const jwt = require("jsonwebtoken");
const Helper = require("./Helper");
const Redis = require("./RedisHelper");

module.exports = new class Jwt extends Helper {
    constructor() {
        super();
    }

    /**
     * Create token
     * @param payload
     * @param secret
     * @param options
     */
    create(payload, secret, options) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!payload || payload.length === "" || !Object.keys(payload).length) throw new Error("payload is required.");
                if (!secret || secret.length === "") throw new Error("secret is required.");

                const token = await jwt.sign(payload, secret, options);
                resolve(token);
            } catch (error) {
                reject(new Exception({message: error.message, name: "JwtError", isPublic: false}));
            }
        });
    }

    /**
     * Verify token
     * @param token
     * @param secret
     */
    verify(token, secret) {
        return new Promise((resolve, reject) => {
            try {
                if (!token || token.length === "") throw new Error("token is required.");

                const decoded = jwt.verify(token, secret)
                resolve(decoded);
            } catch (error) {
                reject(new Exception({message: error.message, name: "JwtError", isPublic: false}));
            }
        });
    }

    /**
     * Create access token
     * @param payload
     * @param id
     */
    createAccessToken(payload, id) {
        return new Promise(async (resolve, reject) => {
            try {
                const token = await this.create(payload, config.get("jwt.access.secret_key"), {expiresIn: config.get("jwt.access.expires_in")});

                // Store token to Redis
                await Redis.setItem(token, id);
                resolve(token);
            } catch (error) {
                reject(new Exception({message: error.message, name: "JwtError", isPublic: false}));
            }
        });
    }

    /**
     * Create refresh token
     * @param payload
     * @param id
     */
    createRefreshToken(payload, id) {
        return new Promise(async (resolve, reject) => {
            try {
                const token = await this.create(payload, config.get("jwt.refresh.secret_key"), {expiresIn: config.get("jwt.refresh.expires_in")});

                // Store refresh token to database
                // await User.storeRefreshToken(id, token)
                resolve(token);
            } catch (error) {
                reject(new Exception({message: error.message, name: "JwtError", isPublic: false}));
            }
        });
    }
};
