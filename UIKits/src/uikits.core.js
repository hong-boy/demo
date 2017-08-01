'use strict';
(function ($, undefined) {
    $.fn.uikits = {};
    $.fn.uikits = {
        register: function (pluginName, fn) {
            if ($.fn.hasOwnProperty(pluginName)) {
                throw 'Plugin Name ' + pluginName + ' is already existed!';
            }
            $.fn[pluginName] = fn;
        }
    };
})(jQuery);

/**
 * ES6 - Promise polyfill
 * 重点：
 * 1. 保证异步函数顺序执行
 */
var Promise = (function () {
    // 首先定义状态
    var STATUS = {
        PENDING: 0, // pending
        FULFILL: 1, // fulfill
        REJECT: 2 // reject
    };

    var nextTick = function (cb) {
        setTimeout(cb, 0);
    };

    /**
     * 调用deferred函数
     * （this指向当前promise对象）
     */
    var handle = function (deferred) {
        var self = this;
        // 若当前promise对象状态为pending，则表示尚未执行完成，将deferred压入队列
        if (self.status === STATUS.PENDING) {
            self.deferreds.push(deferred);
            return;
        }
        nextTick(function () {
            // 根据状态取出回调
            //var deferred = self.deferred;
            var cb = deferred[self.status === STATUS.FULFILL ? 'onFulfill' : 'onReject'];
            if (typeof cb !== 'function') {
                // 状态突变
                cb = self.status === STATUS.FULFILL ? deferred.resolve : deferred.reject;
                cb(self.value);
                return;
            }
            try {
                var ret = cb(self.value);
                // 状态突变
                deferred.resolve(ret);
            } catch (e) {
                // 状态突变
                deferred.reject(e);
            }
        });
    };

    /**
     * 依次执行余下的thenable函数
     */
    var finale = function () {
        var self = this;
        for (var i = 0, len = self.deferreds.length; i < len; i++) {
            handle.call(self, self.deferreds[i]);
        }
        self.deferreds = [];
    };

    /**
     * 包装resolve和reject函数，并执行fn
     * @param fn
     * @param resolve
     * @param reject
     */
    var doResolve = function (fn, resolve, reject) {
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
    };

    var Promise = function (cb) {
        // 定义默认状态
        this.status = STATUS.PENDING;
        // 返回值（reject/resolve）
        this.value = null;
        // 存放thenable对象
        this.deferreds = [];
        // 启动
        //nextTick(cb.bind(this, this.resolve.bind(this), this.reject.bind(this)));
        doResolve(cb, this.resolve.bind(this), this.reject.bind(this));
    };
    /**
     * 使用prototype定义方法
     * （因为Promise.prototype={}，所以会导致Promise.prototype.constructor指向Object；因此需要显示
     * 指明constructor指向Promise）
     * （resolve/reject方法用于引起状态突变）
     * @type {{constructor: Promise, then: Promise.then}}
     */
    Promise.prototype = {
        constructor: Promise,
        /**
         * pending->resolve
         * @param newValue
         */
        resolve: function (newValue) {
            var self = this;
            try {
                if (newValue === self) {
                    throw TypeError('A promise cannot be resolved with itself.');
                }
                if (newValue instanceof Promise) {
                    doResolve(newValue.then.bind(newValue), newValue.resolve.bind(newValue), newValue.reject.bind(newValue));
                    return;
                }
                self.status = STATUS.FULFILL;
                self.value = newValue;
                finale.call(self);
            } catch (e) {
                self.reject(e);
            }
        },
        /**
         * pending->rejected
         * @param newValue
         */
        reject: function (newValue) {
            this.status = STATUS.REJECT;
            this.value = newValue;
            finale.call(this);
        },
        /**
         * 定义thenable函数
         * （为了实现异步函数顺序执行，因此需要返回一个新的Promise对象）
         * @param onFulfill
         * @param onReject
         */
        then: function (onFulfill, onReject) {
            var self = this;
            return new self.constructor(function (resolve, reject) {
                handle.call(self, {
                    onFulfill: onFulfill,
                    onReject: onReject,
                    resolve: resolve,
                    reject: reject
                });
            });
        }
    };

    Promise.resolve = function (value) {
        var promise = null;
        if (value instanceof Promise) {
            try {
                promise = new Promise(value.then.bind(value));
            } catch (e) {
                promise = Promise.reject(e);
            }
        }
        return promise || new Promise(function (resolve, reject) {
                resolve(value);
            });
    };

    Promise.reject = function (value) {
        return new Promise(function (resolve, reject) {
            reject(value);
        });
    };

    /**
     * 接收多个promise对象，将最先返回的promise结果作为最终获取到的值
     * @param{...Promise} args 动态参数
     */
    Promise.race = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        return new Promise(function (resolve, reject) {
            args.forEach(function (item) {
                // doResolve方法中加入done来保证resolve/reject只被执行一次
                Promise.resolve(item).then(resolve, reject);
            });
        })
    };

    /**
     * 接收多个promise对象，等待全部promise对象都返回结果才执行结束
     * @param{...Promise} args 动态参数
     */
    Promise.all = function () {
        var returnVals = [];
        var args = Array.prototype.slice.call(arguments, 0);
        var remain = args.length;
        return new Promise(function (resolve, reject) {
            // 定义一个处理函数
            function process(i, promise) {
                try {
                    if (promise instanceof Promise) {
                        // 若为promise对象，则调用then函数
                        promise.then.call(
                            promise,
                            function (val) {
                                // 递归调用process方法，因为val可能仍然为promise对象
                                process(i, val);
                            },
                            promise.reject
                        );
                        return;
                    }
                    // 若为普通对象，则直接赋值（此时promise为普通对象）
                    returnVals[i] = promise;
                    remain--;
                    if (remain === 0) {
                        // 出口
                        resolve(returnVals);
                    }
                } catch (e) {
                    reject(e);
                }
            }

            // 启动
            args.forEach(function (item, i) {
                process(i, item);
            });
        });
    };

    return Promise;
})();

var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
        //resolve(12);
        reject('not ok');
        console.log(12);
    }, 3000);
});

//promise = Promise.resolve('good');
promise = Promise.reject('not good');

var newPromise = promise.then(
    function (args) {
        console.info('promise args: ', args);
    },
    function (e) {
        console.error(e);
    }
);

newPromise.then(
    function (args) {
        console.info('newPromise args: ', args);
    },
    function (e) {
        console.error(e);
    }
);

var asyncPromise1 = new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve('asyncPromise1');
    }, 2000);
});
var asyncPromise2 = new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve('asyncPromise2');
    }, 1500);
});

Promise.race(asyncPromise1, asyncPromise2).then(function () {
    console.log('Promise.race ', arguments);
});

var syncPromise1 = new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve('syncPromise1');
    }, 2000);
});
var syncPromise2 = new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve('syncPromise2');
    }, 1500);
});

Promise.all(syncPromise1, syncPromise2).then(function (args) {
    console.log('Promise.all ', args);
});

