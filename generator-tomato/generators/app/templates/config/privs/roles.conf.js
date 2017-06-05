'use strict';
/**
 * 定义系统角色
 * @usage
 *  {
 *    ROLE_ID: {
 *      ROLE_NAME: '',
 *      PRIVS_LIST: [PRIVS_ID]
 *    }
 *  }
 */
module.exports = {
    '1': {
        name: "管理员",
        privs: ['01', '02', '0201', '0202', '0203']
    },
    '2': {
        name: "普通用户",
        privs: ['01', '02', '0201']
    },
};
