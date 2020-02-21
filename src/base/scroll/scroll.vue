<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from "better-scroll";
export default {
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: null
    },
    listenScroll: {
      type: Boolean,
      default: false
    },
    bounce: {
      type: Boolean,
      default: true
    },
    pullup: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    setTimeout(() => {
      this._initScroll();
    }, 20);
  },
  methods: {
    // scroll组件只是一个基础组件，并非业务组件，只需要到达某种条件向外暴露事件就行了
    _initScroll() {
      if (!this.$refs.wrapper) {
        return;
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click,
        bounce: this.bounce
      });
      if (this.listenScroll) {
        let me = this; //保存vue实例的 this 对象  获得当前所在的位置
        this.scroll.on("scroll", pos => {
          me.$emit("scroll", pos);
        });
      }
      if (this.pullup) {
        this.scroll.on("scrollEnd", () => {
          if (this.scroll.y <= this.scroll.maxScrollY + 50) {  // 50是buffer
            this.$emit("scrollToEnd");
          }
        });
      }
    },
    enable() {
      this.scroll && this.scroll.enable();
      //表示当 this.scroll 存在的时候 执行 && 后面的语句
      // 相当于
      // if (this.scroll) {
      //   this.scroll.enable();
      // }
    },
    disable() {
      this.scroll && this.scroll.disable();
    },
    refresh() {
      this.scroll && this.scroll.refresh();
    },
    //apply 用于指定this的指向 然后方便传入一个数组参数
    scrollTo() {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
    },
    scrollToElement() {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
    }
  },
  watch: {
    data() {
      setTimeout(() => {
        this.refresh();
      }, 20);
    }
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus"></style>