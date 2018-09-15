<template>
  <transition name="player">
    <div class="pl-root bg-dark text-white rounded"
      :class="{'is-fixed':playerFixed}">
      <div class="btn-group">
        <button class="btn btn-outline-light"
          @click="$emit('prev-track')">
          <span>fast_rewind</span>
        </button>
        <button class="btn btn-outline-light"
          @click="$emit('toggle-play')">
          <span v-if="paused"
            :key="1">play_arrow</span>
          <span v-else
            :key="2">pause</span>
        </button>
        <button class="btn btn-outline-light"
          @click="$emit('next-track')">
          <span>fast_forward</span>
        </button>
      </div>

      <div>
        <div>
          <Seeker :flex="1"
            :disabled="false"
            :value="time"
            :icon="'volume_up'"
            @change="$emit('seek', $event)" />
        </div>
        <div class="material-icons ml-2"
          @click="$emit('toggle-volume')">
          <span v-if="$parent.oldVolume"
            class="material-icons">volume_off</span>
          <span v-else
            class="material-icons">volume_up</span>
        </div>
        <div>
          <Seeker :flex="1"
            :disabled="false"
            :start-val="100"
            :value="volume"
            :max="1"
            @change="$emit('volume', $event)" />
        </div>
      </div>

      <div class="align-items-center">
        <div>{{songTitle}}</div>
        <button class="btn btn-danger"
          @click="$emit('close')">
          <span>close</span>
        </button>
      </div>

    </div>
  </transition>
</template>

<script>
import Seeker from './ProgressSeeker.vue';

export default {
  data() {
    return {

    }
  },
  props: {
    paused: Boolean,
    time: Number,
    volume: Number,
    songTitle: String,
    playerFixed: Boolean
  },
  components: {
    Seeker
  },
  mounted() {
  }
}
</script>

<style lang="scss" scoped>
@import "../scss/style";

.pl-root {
  flex: 1;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  flex-basis: 400px;

  > div:nth-child(2) {
    // seekers
    display: flex;
    flex: 4 1 400px;
    align-items: center;
    flex-flow: row nowrap;
    > div:nth-child(1) {
      flex: 3;
    }
    > div:nth-child(2) {
      cursor: pointer;
      user-select: none;
    }
    > div:nth-child(3) {
      flex: 1;
    }
  }
  > div:nth-child(3) {
    // song name and close button
    display: flex;
    flex: 1 1 auto;
    justify-content: space-between;
    flex-flow: row nowrap;
    overflow: hidden;
    > div {
      flex: 1;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding-left: 10px;
      padding-right: 10px;
      max-width: 200px;
      &::-webkit-scrollbar {
        display: none;
      }
    }
    > button {
      flex: 0;
      align-self: flex-end;
    }
  }
}

.player-leave-active,
.player-enter-active {
  transition: transform 0.5s, opacity 0.5s;
}

.player-leave-to,
.player-enter {
  opacity: 0;
  transform: translateY(-50px);
}

.is-fixed {
  position: fixed;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 3;
}

.play-pause-leave-active {
  transition: transform 0.2s, opacity 0.2s;
  z-index: 10;
}
.play-pause-leave-to {
  transform: scale(10);
  opacity: 0;
}
</style>
