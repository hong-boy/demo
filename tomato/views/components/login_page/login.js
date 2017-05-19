'use strict';
import _ from 'lodash'
export default {
  data() {
    return {
      desc: 'Login Page...',
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'}
        ]
      }
    };
  },
  methods: {
    submitForm(form) {
      let thiz = this;
      thiz.$refs[form].validate(async function (valid) {
        if (valid) {
          let result = await IOT.fetch('/user/signin', thiz.form);
          if (_.isError(result)) {
            thiz.$message({
              showClose: true,
              message: result.message || '登录失败',
              type: 'error'
            });
            console.error(result);
          } else {
            thiz.$message({
              showClose: true,
              message: '登录成功'
            });
            IOT.restoreSession('userInfo', result);
            IOT.redirect2Home();
          }
        }
        return false;
      });
      return false;
    }
  }
}
