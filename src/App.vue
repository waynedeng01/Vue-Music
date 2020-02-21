<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  <!-- 贯穿大部分组件，所以直接定义在APP.vue中 -->
    <player></player>
  </div>
</template>

<script type="text/ecmascript-6">
import mHeader from "components/m-header/m-header";
import Tab from "components/tab/tab";
import Player from "components/player/player";

export default {
  components: {
    mHeader,
    Tab,
    Player
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
</style>