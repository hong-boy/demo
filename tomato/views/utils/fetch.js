import es6Promise from 'es6-promise'
import iFetch from 'isomorphic-fetch'
import path from 'path'
import _ from 'lodash'

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
    case 500:
    {
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
 * 向后台请求数据
 * （默认暴露）
 * @method POST
 * @param{string} url - 请求路径|必须
 * @param{json object|formdata} data - 请求参数|必须
 * @param{function} succ - 请求成功时回调函数|必须
 * @param{function} fail - 请求失败时回调|可选
 * @param{json object} overlay - loading框效果|可选
 * @returns{Promise}
 */
export function fetchBak(url, data, succ, fail, overlay) {
  let option = _.extend({}, OPTIONS, {body: JSON.stringify(data)});
  return iFetch(_formatUrl(url), option)
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
