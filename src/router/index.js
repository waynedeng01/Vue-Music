import Vue from 'vue'
import Router from 'vue-router'
import Recommend from 'components/recommend/recommend'
import Singer from 'components/singer/singer'
import Rank from 'components/rank/rank'
import Search from 'components/search/search'
import SingerDetail from 'components/singer-detail/singer-detail'
import Disc from 'components/disc/disc'
import RankDetail from 'components/rank-detail/rank-detail'

Vue.use(Router)

//使用vue-router注册组件不是用字符串，而是直接用组件名

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      component: Recommend,
      children: [{
        path: ':id',
        component: Disc
      }]
    },
    {
      path: '/singer',
      component: Singer,
      //singer详情页面为singer页面的子路由页面
      children: [
        {
          //通过id来获取到相关的歌手  动态路径参数 以冒号开头  另外要注意以 / 开头的嵌套路径会被当作根路径。
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/rank',
      component: Rank,
      children: [{
        path: ':id',
        component: RankDetail
      }]
    },
    {
      path: '/search',
      component: Search,
      children: [
        {
          //通过id来获取到相关的歌手  动态路径参数 以冒号开头  另外要注意以 / 开头的嵌套路径会被当作根路径。
          path: ':id',
          component: SingerDetail
        }
      ]
    },
  ]
})
