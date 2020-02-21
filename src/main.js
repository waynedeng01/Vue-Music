import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import fastclick from 'fastclick'
// 在入口文件中注入希望在所有元素上使用的样式
import 'common/stylus/index.styl'
import VueLazyload from 'vue-lazyload'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import store from './store'

Vue.use(ElementUI)

Vue.use(VueLazyload, {
  preLoad: 1.3,
  loading: require('common/image/dio.png'), //webpack 会解析require，并通过publicpath做路径替换
  attempt: 1
})

fastclick.attach(document.body)

/* eslint-disable no-new */

// 全局注册vue-router 和 vuex的store
new Vue({
  el: '#app',
  router,
  store,  // 所有子组件将能通过 this.$store 访问到导出的store仓库
  render: h => h(App), //表示渲染APP组件来替代index.html中的#app div

})

//h 为官方对createElement的公认简写
