<template>
  <div class="progress-bar" ref="progressBar" @click="changeClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div
        class="progress-btn-wrapper"
        ref="progressBtn"
        @touchstart.prevent="touchStart"
        @touchmove.prevent="touchMove"
        @touchend="touchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { prefixStyle } from "common/js/dom";
const btnWidth = 16;
const transform = prefixStyle("transform");
export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  watch: {
    percent(newVal) {
      // 防止watch事件一直使拖动跳动，加上判断逻辑
      if (newVal > 0 && !this.touch.initiated) {
        const barWidth = this.$refs.progressBar.clientWidth - btnWidth;
        const offsetWidth = newVal * barWidth;
        this._offset(offsetWidth);
      }
    }
  },
  created() {
    //   创建一个空对象用于事件之间的通讯
    this.touch = {};
  },
  methods: {
    // 点击跳转滚动条
    changeClick(e) {
      const rect = this.$refs.progressBar.getBoundingClientRect();
      const offsetWidth = e.pageX - rect.left;
      this._offset(offsetWidth);
      // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
      // this._offset(e.offsetX)
      this._triggerPercent();
    },
    _offset(width) {
      this.$refs.progress.style.width = `${width}px`;
      this.$refs.progressBtn.style[transform] = `translate3d(${width}px,0,0)`;
    },

    touchStart(e) {
      this.touch.initiated = true;
      this.touch.startX = e.touches[0].pageX;
      this.touch.left = this.$refs.progress.clientWidth; // 表示已经走过的宽度
    },
    touchMove(e) {
      //   console.log(e);
      if (!this.touch.initiated) {
        // 如果没有touchstart就进入这个阶段，直接返回
        return;
      }
      let deltaX = e.touches[0].pageX - this.touch.startX;
      let offsetWidth = Math.min(
        this.$refs.progressBar.clientWidth,
        Math.max(0, deltaX + this.touch.left)
      );
      this._offset(offsetWidth);
    },
    touchEnd() {
      this.touch.initiated = false;
      this._triggerPercent();
    },
    _triggerPercent() {
      const percent =
        this.$refs.progress.clientWidth /
        (this.$refs.progressBar.clientWidth - btnWidth);
      this.$emit("percentChange", percent);
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.progress-bar {
  height: 30px;

  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);

    .progress {
      position: absolute;
      height: 100%;
      background: $color-theme;
    }

    .progress-btn-wrapper {
      position: absolute;
      left: -8px;
      top: -13px;
      width: 30px;
      height: 30px;

      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid $color-text;
        border-radius: 50%;
        background: $color-theme;
      }
    }
  }
}
</style>