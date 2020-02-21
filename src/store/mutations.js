// 整体导入，当成命名空间来使用
// 在被导入模块中，可以单个单个导出
// 使用计算属性名，直接将计算好的值作为函数的名称
// 混入组件的methods对象中，第一个参数为 state ，第二个参数为载荷
// 在 mapMutation 中映射为 this.$store.commit()

import * as types from './mutation-types'

const mutations = {
    [types.SET_SINGER](state, singer) {
        state.singer = singer
    },
    [types.SET_PLAYING_STATE](state, flag) {
        state.playing = flag
    },
    [types.SET_FULL_SCREEN](state, flag) {
        state.fullScreen = flag
    },
    [types.SET_PLAYLIST](state, list) {
        state.playlist = list
    },
    [types.SET_SEQUENCE_LIST](state, list) {
        state.sequenceList = list
    },
    [types.SET_PLAY_MODE](state, mode) {
        state.mode = mode
    },
    [types.SET_CURRENT_INDEX](state, index) {
        state.currentIndex = index
    },
    [types.SET_DISC](state, disc) {
        state.disc = disc
    },
    [types.SET_TOPLIST](state, topList) {
        state.topList = topList
    },
    [types.SET_HISTORY](state, searchHistory) {
        state.searchHistory = searchHistory
    }
}

export default mutations