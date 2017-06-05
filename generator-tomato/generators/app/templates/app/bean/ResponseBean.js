'use strict';
/**
 * 用于封装传递给前端的数据
 */
class ResponseBean {
    constructor(status, msg, data) {
        /**
         * 状态码（代表该次操作成功与否）
         * @type {*|number}
         */
        this.status = status || 200;
        this.msg = msg || '';
        this.data = data || null;
    }

    toString() {
        return `{"status":${this.status}, "msg":${this.msg}, "data":${JSON.stringify(this.data)}}`;
    }
}

/**
 * 状态码枚举
 * （酌情添加）
 */
const STATUS = {
    'OK': 200,
    'ERROR': 500,
    'ERROR_OF_PARAM_MISSING': 501,
    'ERROR_OF_PARAM_VALIDATION': 502
};

/**
 * 状态码说明
 */
const STATUS_MESSAGE = {
    200: 'OK',
    500: '服务器端错误', // 可能是RESTful服务端，亦可能是NodeJS服务端
    501: '前端传入参数的缺失',
    502: '前端传入参数格式不正确'
};

ResponseBean.STATUS = STATUS;
ResponseBean.STATUS_MESSAGE = STATUS_MESSAGE;

module.exports = ResponseBean;
