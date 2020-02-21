<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <!-- v-model双向绑定 -->
    <input v-model="query" ref="query" class="box" :placeholder="placeholder" />
    <i @click="clear" class="icon-dismiss" v-show="query"></i>
  </div>
</template>

<script type="text/ecmascript-6">
import { debounce } from "common/js/util";
export default {
  props: {
    //   因为添加歌曲的placeholder和搜索的不一样，所以需要通过props来控制
    placeholder: {
      type: String,
      default: "搜索歌曲、歌手"
    }
  },
  data() {
    return {
      query: ""
    };
  },
  computed: {},
  methods: {
    clear() {
      this.query = "";
    },
    setQuery(query) {
      // 定义接口，方便外层调用
      this.query = query;
    }
  },
  created() {
    this.$watch(
      "query",
      debounce(newVal => {
        this.$emit("query", newVal);
      }, 500)
    );
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.search-box {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: 0 6px;
  height: 40px;
  background: $color-highlight-background;
  border-radius: 6px;

  .icon-search {
    font-size: 24px;
    color: $color-background;
  }

  .box {
    flex: 1;
    margin: 0 5px;
    line-height: 18px;
    background: $color-highlight-background;
    color: $color-text-l;
    font-size: $font-size-medium;
    outline: 0;

    &::placeholder {
      color: $color-text-d;
    }
  }

  .icon-dismiss {
    font-size: 16px;
    color: $color-background;
  }
}
</style>