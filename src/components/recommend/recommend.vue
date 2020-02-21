<template>
  <div class="recommend" ref="recommend">
    <!-- 要在有元素撑开之后初始化bette-scroll才对 -->
    <scroll class="recommend-content" :data="discList" ref="scroll">
      <div>
        <!-- 虽然会造成页面渲染时闪动的问题，但是考虑到有可能因为网络问题造成图片显示不出来，这里还是使用条件渲染 -->
        <div v-if="reccomends.length" class="slider-wrapper" ref="sliderWrapper">
          <slider>
            <div v-for="(item, index) in reccomends" :key="index">
              <a :href="item.linkUrl">
                <img :src="item.picUrl" @load="loadImg" />
              </a>
            </div>
          </slider>
        </div>

        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li
              @click="selectItem(item)"
              v-for="(item, index) in discList"
              :key="index"
              class="item"
            >
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl" />
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- 通过外层包裹一个div来控制元素的位置和显示 -->
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import { getRecommend, getDiscList } from "api/reccomend.js";
import { ERR_OK } from "api/config.js";
import Slider from "base/slider/slider";
import Scroll from "base/scroll/scroll";
import Loading from "base/loading/loading";
import { mapMutations } from "vuex";
import { playlistMixin } from "common/js/mixin";

export default {
  mixins: [playlistMixin],
  data() {
    return {
      reccomends: [],
      discList: []
    };
  },

  created() {
    this._getRecommend();
    this._getDiscList();
  },
  methods: {
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? "60px" : "";
      this.$refs.recommend.style.bottom = bottom;
      this.$refs.scroll.refresh();
    },
    selectItem(item) {
      this.$router.push({
        path: `/recommend/${item.dissid}`
      });
      this.setDisc(item);
    },
    _getRecommend() {
      //提前封装好的promise对象
      getRecommend().then(res => {
        if (res.code === ERR_OK) {
          this.reccomends = res.data.slider;
        }
      });
    },
    _getDiscList() {
      getDiscList().then(res => {
        this.discList = res.data.list;
        // console.log(res.data.list);
      });
    },
    // 监听图片的onload事件，当图片渲染完成后重新刷新better-scroll的高度
    loadImg() {
      // 只有当图片加载完成才会触发这个事件
      // 还可以使用图片的complete属性
      //保证只刷新一次，避免性能浪费
      if (!this.loaded) {
        this.$refs.scroll.refresh();
        this.loaded = true;
      }
    },
    ...mapMutations({
      setDisc: "SET_DISC"
    })
  },
  //注册组件
  components: {
    Slider,
    Scroll,
    Loading
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  .recommend-content {
    height: 100%;
    overflow: hidden;

    .slider-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;
    }

    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-theme;
      }

      .item {
        display: flex;
        box-sizing: border-box;
        align-items: center;
        padding: 0 20px 20px 20px;

        .icon {
          flex: 0 0 60px;
          width: 60px;
          padding-right: 20px;

          img {
            border-radius: 5px;
          }
        }

        .text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;

          .name {
            margin-bottom: 10px;
            color: $color-text;
          }

          .desc {
            color: $color-text-d;
          }
        }
      }
    }

    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
