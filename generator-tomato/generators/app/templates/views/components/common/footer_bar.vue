<template>
    <el-row>
        <el-col :span="24" class="footer-bar">
            {{desc}}
        </el-col>
    </el-row>
</template>

<script type="text/ecmascript-6">
    export default {
        data() {
            return {desc: 'footer bar...'};
        }
    }
</script>

<style lang="less">
    .footer-bar{
        position:relative;
        height:30px;
        background-color:rgba(26, 37, 53, 0.91);
    }
</style>
