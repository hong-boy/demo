'use strict';
let isProd = false;
let configure = {};
if (process && process.env && process.env.NODE_ENV) {
    let env = process.env.NODE_ENV;
    isProd = (env === 'production');
    console.info('Current NODE_ENV is %s...', env);
} else {
    console.info('No NODE_ENV specified! It will use [dev.conf.js] as default...');
}

configure = isProd ? require('./env/prod.conf') : require('./env/dev.conf');

module.exports = configure;
