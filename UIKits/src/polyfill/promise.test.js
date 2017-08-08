'use strict';
var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
        console.log('promise done');
        resolve('ok');
    }, 3000);
});

promise.then(function () {
    console.log(arguments)
}).catch(function () {
    console.error(arguments)
});

/********************Promise.all**********************/
var asyncPromise1 = new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve('asyncPromise1');
    }, 2000);
});

var asyncPromise2 = new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve('asyncPromise2');
        //reject('asyncPromise2');
    }, 1500);
});

Promise.all(asyncPromise1, asyncPromise2)
    .then(function (args) {
        console.log('Promise.all ', args);
    })
    .catch(function (e) {
        console.error('Promise.all ', e);
    });

/********************Promise.catch**********************/
var catchPromise = new Promise(function (resolve, reject) {
    setTimeout(function () {
        reject('catchPromise');
    }, 1500);
});

catchPromise.then(function (ret) {
    console.log(ret);
}).catch(function (err) {
    console.error('catchPromise catch: ', err);
});