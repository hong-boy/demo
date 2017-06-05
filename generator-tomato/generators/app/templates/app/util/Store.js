//'use strict';
const Redis = require('ioredis');
const conf = require('../../config/env.js');
const redisConf = conf.redis;
const store = conf.store;
const PREFIX = 'koa:store';

/**
 * Store基类（默认存储在内存中）
 */
class Store {
    constructor() {
        this._map = new Map();
        this._timers = new Map();
        console.warn('You are using memory cache. Please make sure change to "RedisStore" in production!');
    }

    getID(key) {
        return `${PREFIX}:${key}`;
    }

    get(key) {
        let id = this.getID(key);
        if (!this._map.has(id)) {
            return;
        }
        return JSON.parse(this._map.get(id));
    }

    set(key, value, maxAge) {
        let id = this.getID(key);
        if (this._map.has(id) && this._timers.has(id)) {
            // 若之前已存在，则立即关闭定时任务
            let _timer = this._timers.get(id);
            !!timer && (clearTimeout(_timer));
        }
        // 检测是否需要开启定时任务
        if (maxAge) {
            this._timers.set(id, setTimeout(()=> {
                this.delete(key)
            }, maxAge))
        }
        try {
            this._map.set(id, JSON.stringify(value));
        } catch (e) {
            console.error('Set property error:', e);
        }
        return id;
    }

    delete(key) {
        let id = this.getID(key);
        // 清除记录
        this._map.delete(id);
        // 关闭定时任务
        let _timer = this._timers.get(id);
        !!_timer && (clearTimeout(_timer));
        this._timers.delete(id);
    }
}

/**
 * RedisStore
 */
class RedisStore extends Store {
    constructor() {
        super();
        this._redis = new Redis(redisConf);
    }

    async get(key) {
        let id = this.getID(key);
        let data = await this._redis.get(id);
        return JSON.parse(data);
    }

    async set(key, value, maxAge) {
        let id = this.getID(key);
        try {
            await this._redis.set(id, JSON.stringify(value), 'EX', maxAge / 1000);
        } catch (e) {
            console.error('Set property error:', e);
        }
        return id;
    }

    async delete(key) {
        let id = this.getID(key);
        try {
            await this._redis.del(id);
        } catch (e) {
            console.error('Del property error:', e);
        }
    }
}

/**
 * StoreUtil 用于暴露给调用者
 */
class StoreUtil {
    constructor(store) {
        // 默认使用Store实例
        this._store = store === 'redis' ? new RedisStore() : new Store();
    }

    get(key) {
        return this._store.get(key);
    }

    set(key, value, maxAge) {
        return this._store.set(key, value, maxAge);
    }

    del(key) {
        return this._store.delete(key);
    }
}

/**
 * 返回单例
 * @type {StoreUtil}
 */
exports = module.exports = new StoreUtil(store);
// For test unit
exports.StoreUtil = StoreUtil;
