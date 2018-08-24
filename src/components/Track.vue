<template>
  <transition name="track-li"
    mode="out-in"
    duration="500"
    appear>
    <li id="header"
      class="list-group-item d-flex justify-content-between align-items-center"
      :style="style">
      <div class="badge badge-dark">
        <span>
          {{playTime[0]}} -
        </span>
        <span>
          {{playTime[1]}}
        </span>
      </div>

      <div>
        <h6 v-if="songInfo.artist.length"
          class="text-secondary d-inline">
          {{songArtist}} —
        </h6>
        <h5 class="text-nowrap d-inline">
          {{songTitle}}
        </h5>
      </div>

      <button class="btn btn-primary"
        @click="$emit('play')"
        title="Грати цю пісню">
        <span v-if="!$parent.paused && $parent.currentSongId === songId">
          pause
        </span>
        <span v-else>play_arrow</span>
      </button>
    </li>
  </transition>
</template>

<script>
import { parseDate } from '../stuff.js';

export default {
  data() {
    return {}
  },
  props: {
    songInfo: Object,
    index: Number,
    songId: String
  },
  computed: {
    playTime() {
      const start = new Date(this.songInfo.time_start),
        stop = new Date(this.songInfo.time_stop);

      return [parseDate(start), parseDate(stop)];
    },
    style() {
      return {
        transitionDelay: this.index * 50 + 'ms'
      }
    },
    songTitle() {
      return decodeURI(this.songInfo.title);
    },
    songArtist() {
      return decodeURI(this.songInfo.artist);
    }
  },
  mounted() {
  }
}
</script>

<style lang="scss" scoped>
@import "../scss/style";
.track-li-enter-active,
.track-li-leave-active {
  transition: transform 0.5s, opacity 0.5s;
}
.track-li-enter,
.track-li-leave-to {
  opacity: 0;
  transform: translateY(-50px);
}

li {
  > div:nth-child(1) {
    display: flex;
    flex-flow: row wrap;
  }
  > div:nth-child(2) {
    flex: 1;
    flex-basis: 400px;
    overflow-x: scroll;
    padding-left: 20px;
    &::-webkit-scrollbar {
      display: none;
    }
  }
}
#header {
  overflow-x: hidden;
}
</style>
