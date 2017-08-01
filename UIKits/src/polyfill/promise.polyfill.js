'use strict';
var Promise = (function () {
    var STATUS = {
        PENDING: 0, // 阻塞
        FULFILL: 1, // 完成
        REJECT: 2 // 失败
    };

    function nextTick(fn) {
        setTimeout(fn, 0);
    }

    function isFunc(fn) {
        return typeof fn === 'function';
    }

    /**
     * 状态转换：pending-->fulfill
     * （这里要注意：Promise.prototype.then(onFulfill, onReject)中，onFulfill可能返回的仍然是一个Promise对象）
     */
    function resolve(newValue) {
        var self = this;

        try {
            if (newValue === self) {
                throw Error('Can not return self-referenced');
            }
            if (newValue instanceof Promise) {
                // 若返回的是一个新的Promise对象，则手动执行其then方法
                var promise = newValue;
                doResolve(promise.then.bind(promise), resolve.bind(promise), reject.bind(promise));
                return;
            }

            self.status = STATUS.FULFILL;
            self.value = newValue;
            finale.call(self);
        } catch (e) {
            reject.call(self, e);
        }
    }

    /**
     * 状态转换：pending-->reject
     */
    function reject(reason) {
        var self = this;
        self.status = STATUS.REJECT;
        self.value = reason;
        finale.call(self);
    }

    /**
     * 最终章
     * （遍历this.deferreds列表，依次执行deferred）
     */
    function finale() {
        var self = this;
        for (var i = 0, len = self.deferreds.length; i < len; i++) {
            handle.call(self, self.deferreds[i]);
        }
        self.deferreds = [];
    }

    /**
     * 包装resolve/reject方法，保证只会被执行一次
     * @param fn
     * @param resolve
     * @param reject
     */
    function doResolve(fn, resolve, reject) {
        var done = false;
        var onFulfill = function (value) {
            if (done) {
                return;
            }
            done = true;
            resolve(value);
        };
        var onReject = function (reason) {
            if (done) {
                return;
            }
            done = true;
            reject(reason);
        };
        try {
            fn(onFulfill, onReject);
        } catch (e) {
            onReject(e);
        }
    }

    /**
     *
     * @param deferred
     */
    function handle(deferred) {
        var self = this; // 指代前一个promise对象
        if (self.status === STATUS.PENDING) {
            // 若promise.status为pending状态，则将thenable对象压入队列稍后执行
            self.deferreds.push(deferred);
            return;
        }
        // 异步执行
        nextTick(function () {
            // 若promise.status为fulfill/reject状态，则执行相应的回调函数
            var callback = deferred[self.status === STATUS.FULFILL ? 'onFulfill' : 'onReject'];
            if (typeof callback !== 'function') {
                // 若Promise.prototype.then方法中没有传入onFulfill/onReject，则直接调用resolve/reject
                callback = deferred[self.status === STATUS.FULFILL ? 'resolve' : 'reject'];
                callback(self.value);
                return;
            }
            // 若Promise.prototype.then方法中有传入onFulfill/onReject
            // 则先执行该回调函数
            try {
                var ret = callback(self.value);
                // 引起状态突变
                deferred.resolve(ret);
            } catch (e) {
                // 引起状态突变
                deferred.reject(e);
            }
        });
    }

    var Promise = function (cb) {
        // 默认状态：pending
        this.status = STATUS.PENDING;
        // 返回值
        this.value = null;
        // 存放thenable函数
        this.deferreds = [];
        // 启动
        //nextTick(cb.bind(this, resolve.bind(this), reject.bind(this)));
        nextTick(doResolve.bind(null, cb.bind(this), resolve.bind(this), reject.bind(this)));
    };

    Promise.prototype = {
        /**
         * 构造方法执行Promise（否则默认指向的是Object）
         */
        constructor: Promise,
        /**
         * 定义thenable函数
         * （总是返回一个新的Promise对象，以便链式调用）
         * （onFullfill/onReject允许为空）
         * @param onFulfill
         * @param onReject
         */
        then: function (onFulfill, onReject) {
            var self = this;
            return new Promise(function (resolve, reject) {
                handle.call(self, {
                    onFulfill: isFunc(onFulfill) ? onFulfill.bind(self) : null,
                    onReject: isFunc(onReject) ? onReject.bind(self) : null,
                    resolve: resolve,
                    reject: reject
                });
            });
        },
        /**
         * 等价于Promise.prototype.then(null, onReject)
         * @param onReject
         */
        catch: function (onReject) {
            var self = this;
            self.then(null, onReject);
        }
    };

    /**
     * 等待一组Promise对象都返回时，才进入到下一个thenable函数
     * 实现原理：
     * 当promise状态更新完毕后，此时我们仍然可以再为其添加thenable函数（即：通过Promise.prototype.then方法追加一个thenable函数）。
     * 由于thenable函数的执行依赖于前一个promise对象的状态（参考handle函数的实现：若前一个promise对象的状态为pending，则将thenable函数压入队列；
     * 若前一个promise对象的状态为fulfill/reject，则直接执行thenable函数。）
     */
    Promise.all = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        var returnVals = []; // 用于存放返回结果
        var remains = args.length;
        return new Promise(function (resolve, reject) {
            var process = function (i, value) {
                try {
                    if (value instanceof Promise) {
                        var promise = value;
                        promise.then(function (ret) {
                            // 递归调用（ret可能是promise对象）
                            process(i, ret);
                        }, reject);
                        return;
                    }
                    returnVals[i] = value;
                    remains--;
                    if (remains === 0) {
                        // 递归出口
                        resolve(returnVals);
                    }
                } catch (e) {
                    reject(e);
                }
            };
            for (var i = 0, len = args.length; i < len; i++) {
                process(i, args[i]);
            }
        });
    };

    /**
     * 等待一组Promise对象中最先返回的结果，并将该结果传入下一个thenable函数
     * 实现原理：
     *
     */
    Promise.race = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        return new Promise(function (resolve, reject) {
            for (var i = 0, len = args.length; i < len; i++) {
                Promise.resolve(args[i]).then(resolve, reject);
            }
        });
    };

    /**
     * 将普通对象包装成一个Promise对象，并将该对象传入下一个thenable函数
     * 状态：pending-->fulfill
     */
    Promise.resolve = function (value) {
        var promise = null;
        if (value instanceof Promise) {
            try {
                promise = new Promise(value.then.bind(value));
            } catch (e) {
                promise = Promise.reject(e);
            }
        }
        return promise || new Promise(function (resolve) {
                resolve(value);
            });
    };

    /**
     * 将普通对象包装成一个Promise对象，并将该对象传入下一个thenable函数
     * 状态：pending-->reject
     */
    Promise.reject = function (value) {
        return new Promise(function (resolve, reject) {
            reject(value);
        });
    };

    Promise.try = function () {
    };

    return Promise;
})();