<template>
  <div class="search-list" v-show="searches.length">
    <!-- transition-group 渲染一个真实的DOM元素 -->
    <transition-group name="list" tag="ul">
      <li :key="item" class="search-item" @click="selectItem(item)" v-for="item in searches">
        <span class="text">{{item}}</span>
        <!-- 防止冒泡到父级的点击事件上 -->
        <span class="icon" @click.stop="deleteOne(item)">
          <i class="icon-delete"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  props: {
    searches: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  methods: {
    selectItem(item) {
      this.$emit("select", item);
      // console.log("select")
    },
    deleteOne(item) {
      this.$emit("delete", item);
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.search-list {
  .search-item {
    display: flex;
    align-items: center;
    height: 40px;
    overflow: hidden;

    &.list-enter-active, &.list-leave-active {
      transition: all 0.2s;
    }

    &.list-enter, &.list-leave-to {
      transform: translate3d(100%, 0, 0);
    }

    .text {
      flex: 1;
      color: $color-text-l;
    }

    .icon {
      extend-click();

      .icon-delete {
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }
  }
}
</style>