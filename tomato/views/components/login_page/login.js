'use strict';
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
            this.$refs[form].validate(function (valid) {
                if (valid) {
                    IOT.fetch('/login/signin', thiz.form, function (ret) {
                        if (ret.code == 200) {
                            IOT.restoreSession(ret.data);
                            IOT.gotoHomepage();
                        } else {
                            console.error(ret);
                        }
                    });
                }
                return false;
            });
            return false;
        }
    }
}