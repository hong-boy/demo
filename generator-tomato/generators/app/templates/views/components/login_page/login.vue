<template>
    <el-row class="login-page" type="flex" justify="center" align="middle">
        <el-col :span="6">
            <h2 class="h2">欢迎登陆</h2>
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" type="password"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button class="width-100" @click="submitForm('form')" type="primary">登录</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script type="text/ecmascript-6" src="./login.js"></script>

<style lang="less" src="./login.less"></style>
