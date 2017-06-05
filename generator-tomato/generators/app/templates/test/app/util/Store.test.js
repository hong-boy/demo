'use strict';
const assert = require('power-assert');
const StoreUtil = require('../.././util/Store.js').StoreUtil;

describe('app/util/Store.js', function () {
    beforeEach(function () {
        this.key = 'TEST_KEY';
        this.value = {sth: 'some thing...'};
        this.maxAge = 1000 * 10; // 10s
    });

    describe('存储模式：NodeJS内存', function () {
        let store = new StoreUtil();
        it('#set() - should return OK', function (done) {
            assert.ok(store.set(this.key, this.value, this.maxAge), '存储失败');
            done();
        });

        it('#get() - should return OK', function (done) {
            assert.ok(store.get(this.key), '获取失败');
            done();
        });

        it('#del() - should return OK', function (done) {
            assert.ok(store.del(this.key) == undefined, '删除失败');
            done();
        });
    });

    describe('存储模式：Redis', function () {
        let store = new StoreUtil('redis');
        it('#set() - should return OK', async function () { // TODO - PS: 使用async/await时，回调函数不能加上done参数
            let result = await store.set(this.key, this.value, this.maxAge);
            assert.ok(result, '存储失败');
            console.log(result);
        });

        it('#get() - should return OK', async function () {
            let result = await store.get(this.key);
            assert.ok(result, '获取失败');
            console.log(result);
        });

        it('#del() - should return OK', async function () {
            let result = await store.del(this.key);
            assert.ok(result === undefined, '删除失败');
            console.log(result);
        });
    });

});
