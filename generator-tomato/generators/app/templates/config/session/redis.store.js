'use strict';
const Redis = require('ioredis');
const Store = require('koa-session2').Store;
const REDIS_CONFIG = require('../env.js').redis;
const PREFIX = 'SESSION';

/**
 * 参考自express-session-redis
 */
class RedisStore extends Store {
    constructor() {
        super();
        this.redis = new Redis(REDIS_CONFIG);
    }

    async get(sid) {
        let data = await this.redis.get(`${PREFIX}:${sid}`);
        return JSON.parse(data);
    }

    async set(session, {sid=this.getID(24), maxAge=1000000}={}) {
        try {
            await this.redis.set(`${PREFIX}:${sid}`, JSON.stringify(session), 'EX', maxAge / 1000);
        } catch (e) {
            console.error(e);
        }
        return sid;
    }

    async destroy(sid) {
        return await this.redis.del(`${PREFIX}:${sid}`);
    }
}

module.exports = RedisStore;
