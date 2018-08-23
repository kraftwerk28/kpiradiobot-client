<template>
  <transition name="player">
    <div class="pl-root bg-dark text-white rounded"
      :class="{'is-fixed':playerFixed}">
      <div class="btn-group">
        <button class="btn btn-secondary"
          @click="$emit('prev-track')">
          <span>fast_rewind</span>
        </button>
        <button class="btn btn-secondary"
          @click="$emit('toggle-play')">
          <transition>
            <span v-if="paused">play_arrow</span>
            <span v-else>pause</span>
          </transition>
        </button>
        <button class="btn btn-secondary"
          @click="$emit('next-track')">
          <span>fast_forward</span>
        </button>
      </div>
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

      <button class="btn btn-danger"
        @click="$emit('close')">
        <span>close</span>
      </button>
    </div>
  </transition>
</template>

<script>
import Seeker from './ProgressSeeker.vue';

export default {
  data() {
    return {
      playerFixed: false
    }
  },
  props: {
    paused: Boolean,
    time: Number,
    volume: Number,
  },
  components: {
    Seeker
  },
  mounted() {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50 && !this.playerFixed) {
        this.playerFixed = true;
      } else if (window.scrollY <= 50 && this.playerFixed)
        this.playerFixed = false;
    });
  }
}
</script>

<style lang="scss" scoped>
@import "../scss/style";

.player-leave-active,
.player-enter-active {
  transition: transform 0.5s, opacity 0.5s;
}

.player-leave-to,
.player-enter {
  opacity: 0;
  transform: translateY(-50px);
}

.pl-root {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;

  > div:nth-of-type(2) {
    flex: 3;
  }
  > div:nth-of-type(3) {
    cursor: pointer;
  }
  > div:nth-of-type(4) {
    flex: 1;
  }
}

.is-fixed {
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  z-index: 3;
}
</style>
