<template>
  <transition name="track-li"
    mode="out-in"
    duration="500"
    appear>
    <li class="list-group-item d-flex justify-content-between align-items-center"
      :class="{ 'bg-light': $parent.currentSongId === songId }"
      :style="style">
      <span class="badge badge-dark">
        <span>
          {{playTime[0] + '-'}}
        </span>
        <span>
          {{playTime[1]}}
        </span>
      </span>

      <div class="head-scroll">
        <h6 v-if="songInfo.artist.length"
          class="text-secondary d-inline">
          {{songArtist}} —
        </h6>
        <h5 class="text-nowrap d-inline">
          {{songTitle}}
        </h5>
        <div></div>
      </div>

      <a class="btn btn-secondary btn-sm p-0 border-dark mr-1"
        role="button"
        title="Завантажити"
        :href="'/krb/history/play2/' + songId"
        :download="songId + '.mp3'">
        <span class="medium material-icons align-middle">file_download</span>
      </a>
      <a class="btn btn-secondary btn-sm p-0 telegram-logo border-dark mr-1"
        role="button"
        title="відкрити в Telegram"
        :href="'https://telegram.me/kpiradio_bot?start=' + songId">
        <span class="medium material-icons align-middle">file_download</span>
      </a>
      <button class="btn btn-primary"
        @click="$emit('play')"
        title="Грати цю пісню">
        <span v-if="!$parent.paused && $parent.currentSongId === songId">
          pause
        </span>
        <span v-else-if="$parent.loadingSong && $parent.currentSongId === songId"
          class="loader">
          autorenew
        </span>
        <span v-else>play_arrow</span>
      </button>
    </li>
  </transition>
</template>

<script>
import { parseDate } from '../stuff.js';
import '../assets/telegram-logo.png';

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
  > span.badge {
    display: flex;
    flex-flow: row wrap;
    span {
      font-size: 150%;
    }
  }
  > div:nth-child(2) {
    flex: 1;
    position: relative;
    flex-basis: 400px;
    overflow-x: scroll;
    padding-left: 20px;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  overflow-x: hidden;
}

.telegram-logo {
  background-image: url("../assets/telegram-logo.png");
  background-size: 20px;
  background-position: center center;
  background-repeat: no-repeat;
  > span {
    opacity: 0;
  }
}

.loader {
  @keyframes a {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  animation: a 1s linear 0s infinite;
}

@media screen and (max-width: 640px) {
  li.list-group-item {
    padding-left: 5px;
    padding-right: 5px;

    span.badge span {
      font-size: inherit;
    }

    > div:nth-child(2) {
      padding-left: 5px;
    }
  }
}
</style>
