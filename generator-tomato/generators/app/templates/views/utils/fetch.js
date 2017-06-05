import es6Promise from 'es6-promise'
import iFetch from 'isomorphic-fetch'
import path from 'path'
import _ from 'lodash'
import {Message} from 'element-ui';

es6Promise.polyfill(); // 浏览器兼容Promise

const BASE_API_URL = '';

const regx4url = /^\//;

const OPTIONS = {
    method: 'POST',
    body: null,
    mode: 'same-origin',
    cache: 'default',
    credentials: 'include', // 开启cookie支持
    headers: {
        'X-Requested-With': 'Fetch', //兼容express4 req.xhr
        'Connection': 'keep-alive',
        'Content-Type': 'application/json; charset=UTF-8'
    }
};

function _formatUrl(url) {
    return [BASE_API_URL, url].join('').replace(regx4url, '');
}

function _handleResponse(resp) {
    if (resp.status === 200) {
        // 默认只处理JSON
        return resp.json();
    }
    let error = new Error();
    // 处理http request error
    switch (resp.status) {
        case 401:
        {
            // 没有权限
            console.error(resp);
            Message.error({
                showClose: true,
                message: '没有权限'
            });
            break;
        }
        case 408:
        {
            // session超时或者为空
            console.error(resp);
            IOT.removeUserInfo();
            IOT.redirect2Home();
            break;
        }
        default:
        {
            error.status = 500;
            error.msg = '一般错误';
            console.error(error);
        }
    }
    return error;
}

/**
 * 向后台请求JSON格式数据
 * @param url
 * @param data
 * @param overlay
 * @returns {Promise}
 */
export function fetch(url, data, overlay) {
    let option = _.extend({}, OPTIONS, {body: JSON.stringify(data)});
    let promise = new Promise(async (resolve, reject)=> {
        let resp = await iFetch(_formatUrl(url), option);
        let result = _handleResponse(resp);
        resolve(result);
    });
    return promise;
}
