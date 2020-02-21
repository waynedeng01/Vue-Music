import { mapGetters } from 'vuex'

export const playlistMixin = {
    // 点击currentSong的时候 playlist 发生了变化
    computed: {
        ...mapGetters(['playlist'])
    },
    mounted() {
        this.handlePlaylist(this.playlist)
    },
    // 针对动态组件的生命周期钩子
    activated() {
        this.handlePlaylist(this.playlist)
    },
    watch: {
        playlist(newVal) {
            this.handlePlaylist(newVal)
        }
    },
    methods: {
        handlePlaylist() {
            // 这个主要函数不在mixin中编写逻辑，这里只给出提示，让混入它的组件去实现该函数
            throw new Error('you must implement handlePlaylist method')
        }
    },
}