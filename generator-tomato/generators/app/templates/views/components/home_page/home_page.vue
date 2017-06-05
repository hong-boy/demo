<template>
    <div>
        <header-bar></header-bar>
        <router-view class="page el-row"></router-view>
        <footer-bar></footer-bar>
    </div>
</template>

<script type="text/ecmascript-6">
    import HeaderBar from '../common/header_bar'
    import FooterBar from '../common/footer_bar'

    export default {
        components: {
            'header-bar': HeaderBar,
            'footer-bar': FooterBar
        }
    }
</script>
