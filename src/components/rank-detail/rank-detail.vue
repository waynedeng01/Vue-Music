<template>
  <transition name="transform" appear>
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import musicList from "components/music-list/music-list";
import { ERR_OK } from "api/config";
import { createSong, processSongsUrl, isValidMusic } from "common/js/song";
import { getMusicList } from "api/rank";

export default {
  data() {
    return {
      songs: [],
      rank: true
    };
  },

  created() {
    this._getMusicList();
  },
  computed: {
    title() {
      return this.topList.topTitle;
    },
    bgImage() {
      return this.topList.picUrl;
    },
    ...mapGetters(["topList"])
  },
  methods: {
    _getMusicList() {
      if (!this.topList.id) {
        this.$router.push("/rank");
        return;
      }
      getMusicList(this.topList.id).then(res => {
        if (res.code === ERR_OK) {
          processSongsUrl(this._normalizeSongs(res.songlist)).then(songs => {
            this.songs = songs;
          });
        }
      });
    },
    _normalizeSongs(list) {
      let ret = [];
      list.forEach(item => {
        const musicData = item.data;
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