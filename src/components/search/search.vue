<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
      <!-- 当元素过多的时候让其可以滚动 -->
      <!-- 需要注意的是，scroll组件只会作用于第一个子元素，且需要子元素的高度大于视口的高度 -->
      <!-- 所以加上一个div进行包裹，并且需要将两部分的数据总和起来传给scroll -->
      <scroll ref="shortcut" class="shortcut" :data="shortCut">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li
                @click="addQuery(item.k)"
                class="item"
                v-for="(item, index) in hotKeys"
                :key="index"
              >
                <span :class="showSpecial(index)">{{item.k}}</span>
              </li>
            </ul>
          </div>
          <transition name="searches">
            <div class="search-history" v-show="searchHistory.length">
              <h1 class="title">
                <span class="text">搜索历史</span>
                <span class="clear" @click="clearHistory">
                  <i class="icon-clear"></i>
                </span>
              </h1>
              <search-list :searches="searchHistory" @select="addQuery" @delete="deleteQuery"></search-list>
            </div>
          </transition>
        </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest ref="suggest" @select="saveSearch" :query="query"></suggest>
    </div>
    <confirm ref="confirm" @confirm="clearAllHistory" @cancel="doNothing" text="该操作将清空所有的歌曲列表"></confirm>
  </div>
</template>

<script>
import SearchBox from "base/search-box/search-box";
import { getHotKey } from "api/search";
import { ERR_OK } from "api/config";
import Suggest from "components/suggest/suggest";
import { mapActions, mapGetters } from "vuex";
import SearchList from "base/search-list/search-list";
import Confirm from "base/confirm/confirm";
import Scroll from "base/scroll/scroll";
import { playlistMixin } from "common/js/mixin";

export default {
  mixins: [playlistMixin],
  data() {
    return {
      hotKeys: [],
      query: ""
    };
  },
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
  },
  created() {
    this._getHotKey();
  },
  methods: {
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? "60px" : "";
      this.$refs.shortcutWrapper.style.bottom = bottom;
      this.$refs.shortcut.refresh();
    },
    saveSearch() {
      this.saveSearchHistory(this.query);
    },

    onQueryChange(query) {
      this.query = query;
    },
    _getHotKey() {
      getHotKey().then(res => {
        if (res.code === ERR_OK) {
          this.hotKeys = res.data.hotkey.slice(0, 10); // 取数组的前十个数据
        }
      });
    },
    showSpecial(index) {
      if (index === 0) {
        return `special`;
      }
    },
    addQuery(query) {
      // 可以通过引用来调用引用中的属性和方法
      this.$refs.searchBox.setQuery(query);
    },
    deleteQuery(item) {
      this.deleteSearchHistory(item);
    },
    clearHistory() {
      // console.log("被点击");
      this.$refs.confirm.show();
      // this.clearAllHistory();
    },
    doNothing() {
      return;
    },
    ...mapActions([
      "saveSearchHistory",
      "deleteSearchHistory",
      "clearAllHistory"
    ])
  },
  computed: {
    shortCut() {
      return this.hotKeys.concat(this.searchHistory);
    },
    ...mapGetters(["searchHistory"])
  },
  // 因为是基于 bs 做的滚动而不是原生的滚动，bs 的滚动依赖内部计算，当 DOM 发生变化后需要重新计算。
  watch: {
    query(newQuery) {
      if (!newQuery) {
        setTimeout(() => {
          this.$refs.shortcut.refresh();
        }, 20);
      }
    }
  }
};
</script>
<style lang="stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.search {
  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut-wrapper {
    position: fixed;
    top: 178px;
    bottom: 0;
    width: 100%;

    .shortcut {
      height: 100%;
      overflow: hidden;

      .hot-key {
        margin: 0 20px 20px 20px;

        .title {
          margin-bottom: 20px;
          font-size: $font-size-medium;
          color: $color-text-l;
        }

        .item {
          display: inline-block;
          padding: 5px 10px;
          margin: 0 20px 10px 0;
          border-radius: 6px;
          background: $color-highlight-background;
          font-size: $font-size-medium;
          color: $color-text-d;

          .special {
            color: $color-theme;
          }
        }
      }

      .search-history {
        position: relative;
        margin: 0 20px;

        &.searches-enter-active, &.searches-leave-active {
          transition: all 0.5s;
        }

        &.searches-enter, &.searches-leave-to {
          opacity: 0;
          height: 0;
        }

        .title {
          display: flex;
          align-items: center;
          height: 40px;
          font-size: $font-size-medium;
          color: $color-text-l;

          .text {
            flex: 1;
          }

          .clear {
            extend-click();

            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
    }
  }

  .search-result {
    position: fixed;
    width: 100%;
    top: 178px;
    bottom: 0;
  }
}
</style>
