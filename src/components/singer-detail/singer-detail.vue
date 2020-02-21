<template>
  <transition name="transform" appear>
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import { getSingerDetail } from "api/singer";
import musicList from "components/music-list/music-list";
import { ERR_OK } from "api/config";
import { createSong, processSongsUrl, isValidMusic } from "common/js/song";

export default {
  data() {
    return {
      songs: []
    };
  },

  created() {
    this.getDetail();
    //在歌手详情还未被获取到的时候退回到歌手列表界面  常见边界处理
    if (!this.singer.id) {
      this.$router.push({
        path: "/singer/"
      });
    }
  },
  computed: {
    title() {
      return this.singer.name;
    },
    bgImage() {
      return this.singer.avatar;
    },
    ...mapGetters(["singer"])
  },
  methods: {
    getDetail() {
      getSingerDetail(this.singer.id).then(res => {
        if (res.code === ERR_OK) {
          processSongsUrl(this._normalizeSongs(res.data.list)).then(songs => {
            this.songs = songs;
          });
          // console.log(songs);
        }
      });
    },
    _normalizeSongs(list) {
      let ret = [];
      list.forEach(item => {
        let { musicData } = item;
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData));
        }
      });
      return ret;
    }
  },
  components: {
    musicList
  }
};
</script>


<style lang="stylus" scoped>
@import '~common/stylus/variable';

// 单页面网页所谓的路由，实际上就是一个覆盖了之前界面的层
.transform-enter, .transform-leave-to {
  transform: translateX(100%);
}

.transform-enter-active, .transform-leave-active {
  transition: all 0.3s;
}
</style>