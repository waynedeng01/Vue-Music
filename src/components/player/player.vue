<template>
  <div class="player" v-show="playlist.length>0">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterenter"
      @leave="leave"
      @after-leave="afterleave"
    >
      <div class="normal-player" v-show="fullScreen">
        <!-- 背景图设一个大图虚化，中间正常小图 -->
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image" />
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>

        <div class="middle" @click="changeLyric">
          <!-- 多个元素过渡时要使用 v-if/else 使用 v-show 会报错 -->
          <transition name="lyric">
            <div class="middle-l" ref="middleL" v-if="showLyric">
              <div class="cd-wrapper" ref="cdWrapper">
                <div class="cd" ref="imageWrapper">
                  <img ref="image" :class="cdCls" class="image" :src="currentSong.image" />
                </div>
              </div>
            </div>
            <!-- && 表示前面逻辑执行成功后才会执行后序的逻辑 -->
            <scroll
              class="middle-r"
              ref="lyricList"
              :data="currentLyric&&currentLyric.lines"
              v-if="!showLyric"
            >
              <div class="lyric-wrapper">
                <div v-if="currentLyric">
                  <p
                    ref="lyricLine"
                    :class="{'current': currentLyricLine ===index}"
                    class="text"
                    v-for="(item, index) in currentLyric.lines"
                    :key="index"
                  >{{item.txt}}</p>
                </div>
                <div class="pure-music" v-show="isPureMusic">{{PureMusicLyric}}</div>
              </div>
            </scroll>
          </transition>
        </div>

        <div class="bottom">
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="percentChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="playModeChange">
              <i :class="playModeIcon"></i>
            </div>
            <div class="icon i-left" :class="disCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disCls">
              <i :class="playIcon" @click="togglePlay"></i>
            </div>
            <div class="icon i-right" :class="disCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper" ref="miniWrapper">
            <img ref="miniImage" :class="cdCls" width="40" height="40" :src="currentSong.image" />
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <i :class="playIconMini" @click.stop="togglePlay"></i>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio
      :src="currentSong.url"
      ref="audio"
      @progress="bufferedProgress"
      @canplay="isCanPlay"
      @error="isError"
      @timeupdate="updateTime"
      @ended="end"
    ></audio>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import animations from "create-keyframe-animation";
import { prefixStyle } from "common/js/dom";
import progressBar from "base/progress-bar/progress-bar";
import { playMode } from "common/js/config";
import { shuffle } from "common/js/util";
import Lyric from "lyric-parser";
import Scroll from "base/scroll/scroll";

const transform = prefixStyle("transform");

export default {
  data() {
    return {
      isPureMusic: false,
      playReady: false,
      currentTime: 0,
      currentLyric: null,
      showLyric: true,
      currentLyricLine: 0,
      PureMusicLyric: "死心吧JOJO，这首歌没歌词"
    };
  },
  mounted() {},
  methods: {
    bufferedProgress() {
      const audioBuffer = this.$refs.audio.buffered;
      console.log(`start:${audioBuffer.start(0)},end:${audioBuffer.end(0)}`);
    },
    changeLyric() {
      this.showLyric = !this.showLyric;
    },
    end() {
      if (this.mode === playMode.loop) {
        this.loop();
      } else {
        this.next();
      }
    },
    loop() {
      this.$refs.audio.currentTime = 0;
      this.$refs.audio.play();
    },
    playModeChange() {
      let currentMode = (this.mode + 1) % 3;
      this.setPlayMode(currentMode);
      // 点击的时候变化模式的同时切换播放列表
      let list = null;
      if (this.mode === playMode.random) {
        // console.log("随机");
        list = shuffle(this.sequenceList);
      } else {
        list = this.sequenceList;
        // console.log("顺序");
      }
      // 改变播放列表，当前播放的歌曲也会发生改变
      this.resetCurrentIndex(list);
      this.setPlayList(list);
    },
    resetCurrentIndex(list) {
      // 切换的同时，让当前歌曲不发生改变
      // findIndex 返回满足条件的第一个元素的索引
      // filter 返回一个新数组
      // find 返回满足要求的值

      let index = list.findIndex(item => item.id === this.currentSong.id);
      this.setCurrentIndex(index);
    },
    percentChange(percent) {
      // console.log(percent)
      const currentTime = this.currentSong.duration * percent;
      this.$refs.audio.currentTime = currentTime;
      if (!this.playing) {
        this.togglePlay();
      }
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000);
      }
    },
    updateTime(e) {
      this.currentTime = e.target.currentTime;
    },
    format(interval) {
      let time = interval | 0;
      let min = (time / 60) | 0;
      let sec = this._pad(time % 60);
      return `${min}:${sec}`;
    },
    _pad(num, n = 2) {
      //补位
      let len = num.toString().length;
      while (len < n) {
        num = "0" + num;
        len++;
      }
      return num;
    },
    togglePlay() {
      if (!this.playReady) {
        return;
      }
      this.setPlayState(!this.playing);
      if (this.currentLyric) {
        this.currentLyric.togglePlay();
      }
    },
    back() {
      this.setFullScreen(false);
    },
    open() {
      this.setFullScreen(true);
    },
    enter(el, done) {
      const { x, y, scale } = this._getPosAndScale();
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      };
      animations.registerAnimation({
        name: "move",
        animation,
        presets: {
          duration: 400,
          easing: "linear"
        }
      });
      animations.runAnimation(this.$refs.cdWrapper, "move", done); //执行done后跳转到另一阶段
    },
    afterenter() {
      //移除相关style
      animations.unregisterAnimation("move");
      this.$refs.cdWrapper.style.animation = "";
    },
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = "all 0.4s";
      const { x, y, scale } = this._getPosAndScale();
      this.$refs.cdWrapper.style[
        transform
      ] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
      const timer = setTimeout(done, 400);
      this.$refs.cdWrapper.addEventListener("transitionend", () => {
        clearTimeout(timer);
        done();
      });
    },
    afterleave() {
      this.$refs.cdWrapper.style.transition = "";
      this.$refs.cdWrapper.style[transform] = "";
    },
    _getPosAndScale() {
      const targetWidth = 40;
      const paddingLeft = 40;
      const paddingBottom = 30;
      const paddingTop = 80;
      const width = window.innerWidth * 0.8;
      const scale = targetWidth / width;
      const x = -(window.innerWidth / 2 - paddingLeft);
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
      return {
        //初始scale及移动的x,y值
        x,
        y,
        scale
      };
    },
    isCanPlay() {
      //歌曲能播放时会触发该函数  所以可以直接设置一个标志位来反应状态
      this.playReady = true;
    },
    //当出现网络问题或者是其他异常情况时，为保证功能能继续执行
    isError() {
      this.playReady = true;
    },
    prev() {
      if (!this.playReady) {
        return;
      }
      let index = this.currentIndex - 1;
      if (index === -1) {
        index = this.playlist.length - 1;
      }
      this.setCurrentIndex(index);
      if (!this.playing) {
        //暂停状态切歌
        this.togglePlay();
      }
      this.playReady = false;
    },
    next() {
      if (!this.playReady) {
        return;
      }
      let index = this.currentIndex + 1;
      if (index === this.playlist.length) {
        index = 0;
      }
      this.setCurrentIndex(index);
      if (!this.playing) {
        //暂停状态切歌
        this.togglePlay();
      }
      this.playReady = false;
    },
    // 封装一个获取解析后歌词的方法
    getLyric() {
      this.currentSong.getLyric().then(res => {
        this.currentLyric = new Lyric(res, this.handleLyric);
        this.isPureMusic = !this.currentLyric.length;
        if (this.playing) {
          this.currentLyric.play();
        }
      });
    },
    handleLyric({ lineNum, txt }) {
      // this.$refs 只能获取到渲染在页面上的元素，所以这些时机逻辑一定要写完整
      if (!this.$refs.lyricLine) {
        return;
      }
      this.currentLyricLine = lineNum;
      // 当歌词不断滚动时，为保证每次被选中的歌词在中间，使用如下方法
      // this.$nextTick(() => {
      //   console.log(this.$refs.lyricList);
      // });

      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5];
        this.$refs.lyricList.scrollToElement(lineEl, 1000);
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000);
      }
      // this.playingLyric = txt;
    },

    ...mapMutations({
      setFullScreen: "SET_FULL_SCREEN",
      setPlayState: "SET_PLAYING_STATE",
      setCurrentIndex: "SET_CURRENT_INDEX",
      setPlayMode: "SET_PLAY_MODE",
      setPlayList: "SET_PLAYLIST"
    })
  },
  components: {
    progressBar,
    Scroll
  },
  computed: {
    playModeIcon() {
      return playMode.sequence == this.mode
        ? "icon-sequence"
        : playMode.loop == this.mode
        ? "icon-loop"
        : "icon-random";
    },

    ...mapGetters([
      "fullScreen",
      "playlist",
      "currentSong",
      "playing",
      "currentIndex",
      "mode",
      "sequenceList"
    ]), //playing为播放的状态
    percent() {
      return this.currentTime / this.currentSong.duration;
    },
    playIcon() {
      return this.playing ? "icon-pause" : "icon-play";
    },
    playIconMini() {
      return this.playing ? "icon-pause-mini" : "icon-play-mini";
    },
    cdCls() {
      return this.playing ? "play" : "play pause";
    },
    disCls() {
      return this.playReady ? "" : "disabled";
    }
  },
  watch: {
    currentSong(newVal, oldVal) {
      //currentSong的变化在DOMready之前，所以在监听到currentSong变化时还没有audio标签，因此需要加一个延时
      if (newVal.id == oldVal.id) {
        return;
      }
      // 切歌的时候清空所有的属性值
      if (this.currentLyric) {
        this.currentLyric.stop();
        this.currentTime = 0;
        this.playingLyric = "";
        this.currentLineNum = 0;
      }
      // 歌词滚动时同样造成了DOM改变，手动刷新
      if (!newVal) {
        setTimeout(() => {
          this.$refs.lyricList.refresh();
        }, 20);
      }
      this.$nextTick(() => {
        this.$refs.audio.play();
        this.getLyric();
      });
    },
    playing(newPlaying) {
      this.$nextTick(() => {
        newPlaying ? this.$refs.audio.play() : this.$refs.audio.pause();
      });
    }
  }
};
</script>



<style lang="stylus" scoped>
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;

    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }

    .top {
      position: relative;
      margin-bottom: 25px;

      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;

        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
      }

      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }

      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }

    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;

      .lyric-enter-active, .lyric-leave-active {
        transition: all 0.2s;
      }

      .lyric-enter, .lyric-leave-to {
        opacity: 0;
      }

      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;

        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;

          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;

            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }

            .play {
              animation: rotate 20s linear infinite;
            }

            .pause {
              animation-play-state: paused;
            }
          }
        }

        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;

          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }

      .middle-r {
        position: fixed;
        top: 80px;
        bottom: 170px;
        vertical-align: top;
        width: 100%;
        // height: 100%;
        overflow: hidden;

        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;

          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;

            &.current {
              color: $color-text;
            }
          }

          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }

    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;

      .dot-wrapper {
        text-align: center;
        font-size: 0;

        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;

          &.active {
            width: 20px;
            border-radius: 5px;
            background: $color-text-ll;
          }
        }
      }

      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;

        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 30px;
          line-height: 30px;
          width: 30px;

          &.time-l {
            text-align: left;
          }

          &.time-r {
            text-align: right;
          }
        }

        .progress-bar-wrapper {
          flex: 1;
        }
      }

      .operators {
        display: flex;
        align-items: center;

        .icon {
          flex: 1;
          color: $color-theme;

          &.disable {
            color: $color-theme-d;
          }

          i {
            font-size: 30px;
          }
        }

        .i-left {
          text-align: right;
        }

        .i-center {
          padding: 0 20px;
          text-align: center;

          i {
            font-size: 40px;
          }
        }

        .i-right {
          text-align: left;
        }

        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }

    // 父元素选择器，选择当前元素的父级
    &.normal-enter-active, &.normal-leave-active {
      transition: all 0.4s;

      .top, .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }

    &.normal-enter, &.normal-leave-to {
      opacity: 0;

      .top {
        transform: translate3d(0, -100px, 0);
      }

      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }

  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;

    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.4s;
    }

    &.mini-enter, &.mini-leave-to {
      opacity: 0;
    }

    .icon {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      padding: 0 10px 0 20px;

      .imgWrapper {
        height: 100%;
        width: 100%;

        img {
          border-radius: 50%;

          &.play {
            animation: rotate 10s linear infinite;
          }

          &.pause {
            animation-play-state: paused;
          }
        }
      }
    }

    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        margin-bottom: 2px;
        no-wrap();
        font-size: $font-size-medium;
        color: $color-text;
      }

      .desc {
        no-wrap();
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }

    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;

      .icon-play-mini, .icon-pause-mini, .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }

      .icon-mini {
        font-size: 32px;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
