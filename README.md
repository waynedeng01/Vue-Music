# vue-music

> 音乐播放器

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## 有关npm的部分补充

* dependencies：一直依赖  `npm i --save`

* devDependencies：只在开发阶段依赖 `npm i --save-dev`

## better-scroll学习笔记

+ better-scroll需要一个容器包裹，它会默认处理容器中的第一个子元素，其他元素都会被忽略

+ 滚动原理同浏览器类似，必须是子元素内容的高度大于视口时才会发生滚动

## VUe-music 学习总结

### 脚手架配置

* 安装相关预处理器的loader
* 配置路径alias，结合node的`__dirname，path.join()`
```javascript
function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

```

* 配置eslint相关
* 安装`ES6`相关编译的工具(`babel-polyfill等`)
* 移动端使用`fastclick`解决点击延迟问题

>使用的是vue-cli 2.x的版本

### vue-router 配置

* 配置`path`和`recommend`
* 使用`router-view`来装载路由的组件，`router-link`做跳转
* 主意命名规范
    * 组件一般使用驼峰命名，页面中使用连字符

### vuex学习总结

> 见store中的代码注释
> 参考vuex官方文档
* 补充
    + vuex插件选项
        - vuex的插件就相当于一个函数，接收`store`作为唯一参数
        - 

### jsonp

* 因为script标签没有同源策略，所以可以使用jsonp解决跨域，原理是给网页动态创建一个script标签
* `url`地址我们要求尽可能的纯净，所以一般都是将参数动态绑定到`url`上
    + 注意处理undefined的情况，通常处理为空字符串
    + 了解常见URL的写法格式
    + `data`用对象保存，可以利用`Object.assign()`方法将公共参数与该请求下独有的参数拼接起来，再到jsonp处理那里转化成URL
>使用了jsonp的库

### 轮播图

* 基础结构
    * 视口和图片，超出视口的hidden掉
    * 使用better-scroll来实现
* 外部数据控制
    * 传props控制轮播图一些属性
* 时机问题要严格控制好
* 路由切换设置为动态组件可以减少性能消耗`keep-alive`
* 有定时器的时候最好是在销毁的生命周期中将其清除

### 歌单

* 5开头的错误表示服务端错误，有时候接口会限制你的`refer`和`host`，可以用服务器发送http请求的方式去处理
    * 保护接口的相关策略
        + IP限制
        + 要求带签名参数等（参数跃迁）

* `v-html`指令可以转义HTML元素

* `better-scroll`初始化封装到一个基础scroll组件上
    + 在进行初始化的时候为了避免报错，先手动规避值为undefined的情况
    + 让外层props来控制组件，解耦，`probrtype:this.probetype`
    + 在组件内代理bs的方法，也要考虑好时机，所有的操作都是在scroll初始化之后执行的。`&&`
    + 使用`watch`当data发生变化时，自动刷新
        >- `bs`DOM结构改变的时候都需要重新刷新，不然会失效

* 注意在计算高度的时候，有图片的容器其真实高度很可能是在图片获得以后才被撑开的，所以可以在图片load的时候`refresh()`

* `vue-lazyLoader`实现懒加载

* 在数据未加载上来的时候上`loading`组件

### 歌手

* 歌手数据处理 --数据结构处理
    + 同样的数据可以封装成类，在构建数据结构的时候，使用面向对象的思想更加鲜明
        >需要注意的是，对象的遍历是无序的，所以如果对遍历结果的顺序有明确的要求话，应该将其转换成有序的数组
        >将加入到非热门数据的title做排序
        ```javascript
            let ret = []
            if(val.title.match(/[a-zA-Z]/)) {
                ret.push(val)
            }
            ...
            // 升序排列
            ret.sort(a,b) {
                return a.title.charCodeAt(0) - b.title.charCodeAt(0)
            }

        ```
* 右侧入口实现

    + 调用组件的界面是不需要再编写组件样式的

    + 计算属性中的值也可以作为`v-for`中的数组
        >字符串方法：`substr()`切割字符串，约定开始位置和结束位置
    
    + `data-`自定义属性，可以在`el.dataset`中获取到

    + 添加滑动事件
        - 在create hook 中创建一个对象touch{},用于函数之间的数据沟通(共享)，不需要渲染到DOM上的数据可以使用此方法。
        - `touchStart,touchMove`中的`touches[0]`是有间隔的，表示了手指滑动时前两个点的位置差，通过`touch = {}`保存下来，除以右边锚点的高度得到间隔了几个锚点，再调用bs滚动元素的方法
        - ` | 0 ` 向下取整
        - >字符串加上数字类型会变成字符串，在进行计算的时候要注意强制类型转换
    
    + 左右联动实现
        - bs 的`this`是指向`better-scroll`这个对象的，所以在bs对象中内嵌函数的时候应当`var that = this`来保存外层vue实例的this指向
        - 通过bs的scroll事件实时监听 y 坐标的位置，是相对于最开始bs顶部的位置（0）
        - 计算出左侧每个部分的高度，push到数组中 `clientHeight`
            * 用上下限来看是否属于某块区域
            * 顶部，中间，底部分为三块逻辑分别判断
            * `watch`y位置的改变
    
    + 固定标题实现
        - 设置一个绝对定位在顶端的标题，跟随区域变化而改变
        - 解决过渡问题：当两标题顶在一起的时候将上面的标题向上顶
          > 计算距离差diff，当`diff<title`的时候，`diff(new) - TITLE_HEIGHT`即为应该向上偏移的高度
    
### 歌手详情页

* 跳转到详情页
    + 使用二级路由 -- 配置子组件
    > `children` 中配置 需要传入的参数前面加上`:`做占位（实际在写路由的时候不需要将冒号写出来），使用router-view承载组件
    + 基础组件一般都不处理业务，只是将相关方法和数据派发出去，让父级调用
    + ```javascript
        // 函数式编程跳转路由
        this.$router.push({
            path:'',
        })
       ```

### 搜索界面

* 上拉刷新实现
    + scroll组件中判断是否触底
        - `scrollEnd`获取滚动停止时所到达的位置
          ```javascript
            if(this.scroll.y < (this.scroll.maxScrollY + 50)) {
                // 50 是一个缓冲值
                // maxScrollY 一般为负值，表示bs可以滚动的最大范围
                this.$emit('toEnd')
            }
          ```
    + 每次获取数据的时候判断是否还有数据可以获取
        - 设置标志位来进行判断
        - 当前搜索的数据是否 <= 总数
    
    + 将获取到的结果追加在结果上
        - `array.prototype.concat()`
    
    + 使用loading组件使过渡平滑，将是否具有下一页搜索值的标志位传为`v-show`的标志
    >better-scroll Dom 结构发生变化后都需要刷新 refresh


    
        













