<template>
    <el-row>
        <el-col :span="24" class="header-bar">
            {{desc}}
        </el-col>
    </el-row>
</template>

<script type="text/ecmascript-6">
    export default {
        data() {
            return {desc: 'header bar...'};
        }
    }
</script>

<style lang="less">
    .header-bar{
        position:relative;
        height:70px;
        background-color:rgba(119, 209, 118, 0.91);
    }
</style>
