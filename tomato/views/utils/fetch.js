import es6Promise from 'es6-promise'
import iFetch from 'isomorphic-fetch'
import path from 'path'
import _ from 'lodash'

es6Promise.polyfill(); // 浏览器兼容Promise

const BASE_API_URL = 'api/';

const OPTIONS = {
    method: 'POST',
    body: null,
    mode: 'same-origin',
    cache: 'default',
    credentials: 'include', // 开启cookie支持
    headers: {
        'X-Requested-With': 'XMLHttpRequest', //兼容express4 req.xhr
        'Connection': 'keep-alive',
        'Content-Type': 'application/json; charset=UTF-8'
    }
};
/**
 * 向后台请求数据
 * （默认暴露）
 * @method POST
 * @param{string} url - 请求路径|必须
 * @param{json object|formdata} data - 请求参数|必须
 * @param{function} succ - 请求成功时回调函数|必须
 * @param{function} fail - 请求失败时回调|可选
 * @param{json object} overlay - loading框效果|可选
 */
export function fetch(url, data, succ, fail, overlay) {
    let option = _.extend({}, OPTIONS, {body: JSON.stringify(data)});
    iFetch(path.join(BASE_API_URL, url), option)
        .then(function (resp) {
            if (resp.status != 200) {
                let error = Error(resp.statusText);
                error.code = resp.status;
                error.response = resp;
                throw error;
            }
            return resp.json();
        })
        .then(function (ret) {
            _.isFunction(succ) && succ.call(null, ret);
        })
        .catch(function (err) {
            if (err.code === 301 || err.code === 302) {
                err.response.json().then(function (ret) {
                    location.href = ret.url;
                });
                return;
            }
            fail = _.isFunction(fail) ? fail : console.error;
            fail(err);
        });
}