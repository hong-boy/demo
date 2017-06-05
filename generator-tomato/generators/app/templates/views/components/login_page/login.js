'use strict';
import _ from 'lodash'
import md5 from 'md5'
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
                    let param = {
                        username: thiz.form.username,
                        password: md5(thiz.form.password)
                    };
                    let result = await IOT.fetch('/login', param);
                    if (result.status === 200) {
                        thiz.$message({
                            showClose: true,
                            message: '登录成功'
                        });
                        IOT.redirect2Home();
                    } else {
                        thiz.$message({
                            showClose: true,
                            message: result.msg || '登录失败',
                            type: 'error'
                        });
                    }
                }
                return false;
            });
            return false;
        }
    }
}
