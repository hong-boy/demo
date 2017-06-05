'use strict';

const isLogin = function () {
    return false;
};

const checkPermission = function (permList, perm) {
    return true;
};

const requireAuth = function (allowList, to, from, next) {
    if (checkPermission(allowList, to.path)) {
        next();

    }
};

export default {}