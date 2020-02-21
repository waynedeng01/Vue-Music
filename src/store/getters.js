// getters 相当于 state 的一个计算属性，接收两个参数(state,getters)
// 第二个参数可选，可以getters.xxx调用其他getters 方法
// 同理，导出名和计算名相同可以简化语法糖的写法
// 在组件computed中对 mapGetters 等语法糖使用对象展开符是为了将该对象融入到计算属性中
// 即将 mapGetters对象 中的所有属性全部拷贝为 computed 的属性
// 方便通过 this 直接调用


export const singer = state => state.singer

export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const playlist = state => state.playlist

export const sequenceList = state => state.sequenceList

export const mode = state => state.mode

export const currentIndex = state => state.currentIndex

export const currentSong = (state) => {
    return state.playlist[state.currentIndex] || {}
}

export const disc = state => state.disc

export const topList = state => state.topList

export const searchHistory = state => state.searchHistory