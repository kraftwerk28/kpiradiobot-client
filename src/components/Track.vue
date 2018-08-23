<template>
  <transition name="track-li"
    mode="out-in"
    duration="500"
    appear>
    <li id="header"
      class="list-group-item d-flex justify-content-between align-items-center"
      :style="style">
      <h5>
        <span class="badge badge-dark">{{playTime}}</span>
      </h5>

      <h5 class="text-nowrap">
        {{songTitle}}
      </h5>
      <button class="btn btn-primary"
        @click="$emit('play')">
        <span v-if="!$parent.paused && $parent.currentSongId === songId">
          pause
        </span>
        <span v-else>play_arrow</span>
      </button>
    </li>
  </transition>
</template>

<script>
const { date_yyyymmdd, parseDate } = require('../stuff.js');

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

      return `${parseDate(start)} - 
      ${parseDate(stop)}`;
    },
    style() {
      return {
        transitionDelay: this.index * 50 + 'ms'
      }
    },
    songTitle() {
      return decodeURI(this.songInfo.title);
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

*:nth-child(2) {
  overflow-x: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
}

#header {
  overflow-x: hidden;
}
</style>
