//完成异步提交或是提交多个mutation的时候  选择封装一个action
//action函数接收的参数是context 有store的所有属性和方法
// 因此可以使用参数解构来简化代码
// 第二个参数为传入的payload
// 在 action 中组合异步操作可以通过封装 promise 的方式来完成
// mapAction 映射成 this.$store.dispatch()

import * as types from './mutation-types'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'
import { saveSearch, deleteSearch, clearSearch } from 'common/js/cache'

function findIndex(list, song) {
	return list.findIndex((item) => item.id === song.id)
}

export const selectPlay = function({ commit, state }, { list, index }) {
	commit(types.SET_SEQUENCE_LIST, list)
	if (state.mode === playMode.random) {
		let randomList = shuffle(list)
		commit(types.SET_PLAYLIST, randomList)
		index = findIndex(randomList, list[index])
	} else {
		commit(types.SET_PLAYLIST, list)
	}
	commit(types.SET_CURRENT_INDEX, index)
	commit(types.SET_FULL_SCREEN, true)
	commit(types.SET_PLAYING_STATE, true)
}

export const randomPlay = function({ commit }, { list }) {
	commit(types.SET_PLAY_MODE, playMode.random)
	commit(types.SET_SEQUENCE_LIST, list)
	let randomList = shuffle(list)
	commit(types.SET_PLAYLIST, randomList)
	commit(types.SET_CURRENT_INDEX, 0)
	commit(types.SET_FULL_SCREEN, true)
	commit(types.SET_PLAYING_STATE, true)
}

// 在搜索页那里点击歌曲的逻辑与在歌手界面点击的不同
// 歌手界面是把整个playlist都更新了，而搜索只是在当前的playlist中插入歌曲
export const insertSong = function({ commit, state }, song) {
	// 从state中调出需要操作的数据
	// 注意这里playlist和sequencelist都是从state中直接取出的引用，修改会反馈到state中的状态，导致非mutation修改而报错
	// 所以需要使用副本来代替
	let playlist = state.playlist.slice()
	let currentIndex = state.currentIndex
	let sequenceList = state.sequenceList.slice()

	let currentSong = playlist[currentIndex]
	// 判断当前播放列表中是否已经含有当前歌曲，如果有的话应当替代。没有的话直接插入
	let fpIndex = findIndex(playlist, song)
	// 插入歌曲，索引加一，由splice的特性决定，插入到开始位置的前一位
	currentIndex++
	// 列表中没有该歌曲的情况，直接插入
	playlist.splice(currentIndex, 0, song)
	// 列表中有该歌曲，删掉原有的歌曲
	if (fpIndex > -1) {
		// 原有歌曲在插入歌曲之前
		if (currentIndex > fpIndex) {
			playlist.splice(fpIndex, 1)
		} else if (currentIndex < fpIndex) {
			playlist.splice(fpIndex + 1, 1)
		}
	}
	// 在顺序列表中插入，逻辑与之前类似
	let currentSIndex = findIndex(sequenceList, currentSong) + 1
	let fsIndex = findIndex(sequenceList, song)
	sequenceList.splice(currentSIndex, 0, song)
	if (fsIndex > -1) {
		if (currentSIndex > fsIndex) {
			sequenceList.splice(fsIndex, 1)
		} else {
			sequenceList.splice(fsIndex + 1, 1)
		}
	}
	commit(types.SET_PLAYLIST, playlist)
	commit(types.SET_SEQUENCE_LIST, sequenceList)
	commit(types.SET_CURRENT_INDEX, currentIndex)
	commit(types.SET_FULL_SCREEN, true)
	commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = function({ commit }, query) {
	// commit saveSearch() 的返回值
	commit(types.SET_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = function({ commit }, query) {
	commit(types.SET_HISTORY, deleteSearch(query))
}

// 清空所有
export function clearAllHistory({ commit }) {
	commit(types.SET_HISTORY, clearSearch())
}
