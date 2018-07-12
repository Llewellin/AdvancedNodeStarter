const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const redisClient = redis.createClient(keys.redisUrl);
// redisClient.get = util.promisify(redisClient.get);
redisClient.hget = util.promisify(redisClient.get);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
    // this refer to the EXACT Query object, whick call this function
    this.useCache = true;

    // allow to have different key, and make it become a string
    this.hashKey = JSON.stringify(options.key || '');

    // we want it to behavior like a devorator, so need to return a Query object itself
    return this;
};

// Crazy: hijack mongoose function and monkey-patch it for reusability
mongoose.Query.prototype.exec = async function() {
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    // Crazy: use query and collection as a unique key for redis
    const key = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        })
    );

    // TODO: DO NOT copy and paste. We need to define our own data strucutrue.
    // Thus, not absoulately need to use hget and hget
    // See if we have a value for 'key' in radis
    // const cachedValue = await redisClient.get(key);
    const cachedValue = await redisClient.hget(this.hashKey, key);

    // If we do, return that
    if (cachedValue) {
        const doc = JSON.parse(cachedValue);

        // turn object into Mongoose Document type
        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }

    // Otherwise issue the query and store the result in redis
    // result is a Mongoose Document type
    const result = await exec.apply(this, arguments);

    // 10 seconds to expire
    // redisClient.set(key, JSON.stringify(result), 'EX', 10);
    redisClient.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

    return result;
};

module.exports = {
    clearHash(hashKey) {
        redisClient.del(JSON.stringify(hashKey));
    }
};
