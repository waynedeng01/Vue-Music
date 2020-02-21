<template>
  <transition appear name="slide">
    <music-list :bgImage="bgImage" :title="title" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from "components/music-list/music-list";
import { getSongList } from "api/reccomend";
import { ERR_OK } from "api/config";
import { mapGetters } from "vuex";
import { createSong, isValidMusic, processSongsUrl } from "common/js/song";
export default {
  data() {
    return {
      songs: []
    };
  },
  created() {
    this._getSongList();
  },
  methods: {
    _getSongList() {
      if (!this.disc.dissid) {
        this.$router.push({
          path: "/recommend"
        });
        return;
      }
      getSongList(this.disc.dissid).then(res => {
        if (res.code === ERR_OK) {
          // console.log(res);
          processSongsUrl(this._normalizeSongs(res.cdlist[0].songlist)).then(
            songs => {
              this.songs = songs;
            }
          );
        }
      });
    },
    _normalizeSongs(list) {
      let ret = [];
      list.forEach(musicData => {
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData));
        }
      });
      return ret;
    }
  },
  computed: {
    bgImage() {
      return this.disc.imgurl;
    },
    title() {
      return this.disc.dissname;
    },
    ...mapGetters(["disc"])
  },
  components: {
    MusicList
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s;
}

.slide-enter, .slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>