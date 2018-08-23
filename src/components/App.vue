<template>
  <div class="container-fluid p-0">
    <div id="loadIndicator"
      class="progress bg-transparent"
      v-if="loadProgress > 0">
      <div class="progress-bar bg-danger"
        role="progressbar"
        :style="{ width: loadProgress + '%' }">
      </div>
    </div>

    <nav class="navbar navbar-dark bg-primary">
      <a class="navbar-brand"
        href="#">
        KPIRADIOBOT
      </a>
      <Player :paused="paused"
        v-show="playerVisible"
        @toggle-play="togglePlay"
        @close="closePlayer"
        :time="timePlaying"
        :volume="volume"
        @seek="seek($event)"
        @volume="setVolume($event)"
        @toggle-volume="toggleVolume"
        @prev-track="prevTrack"
        @next-track="nextTrack" />
    </nav>

    <div class="pl-3 pr-3">
      <div class="row mt-2 mb-2">
        <div class="input-group col-md-4"
          title="Coming soon...">
          <div class="input-group-prepend">
            <span class="input-group-text material-icons">date_range</span>
          </div>
          <input type="date"
            class="form-control"
            disabled />
        </div>

        <div class="input-group col-md-8">
          <input type="text"
            :disabled="searching"
            placeholder="пошук"
            class="form-control"
            v-model="searchPattern">
          <div class="input-group-append">
            <button class="btn"
              :disabled="searchPattern.length < 1"
              @click="searching = !searching"
              :class="{ 'btn-outline-secondary': !searching, 'btn-danger': searching }">
              <span v-if="searching">close</span>
              <span v-else>search</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="!searching && !loadingSongs">
        <ul v-for="(group, i) in splitByPairs"
          :key="i"
          class="list-group">
          <li class="list-group-item bg-info text-white text-center align-middle mt-3">
            <h3>
              <span class="material-icons">arrow_downward</span>
              {{groupHeader(i)}}
              <span class="material-icons">arrow_downward</span>
            </h3>
          </li>
          <Track v-for="(song, i) in group"
            :index="i"
            :songId="song.path"
            :key="i"
            :songInfo="song"
            @play="loadSong(song.path, i)" />
        </ul>
      </div>

      <ul v-else-if="searching && songsDataFiltered.length > 0"
        class="list-group">
        <Track :index="i"
          v-for="(song, i) in songsDataFiltered"
          :songId="song.path"
          :key="i"
          :songInfo="song"
          @play="loadSong(song.path, i)" />
      </ul>
      <div v-else-if="searching"
        class="alert alert-warning text-center">
        Нічого не знайдено...
      </div>

    </div>

  </div>
</template>

<script>
import Track from './Track.vue';
import Player from './Player.vue';
import Seeker from './ProgressSeeker.vue';

export default {
  data() {
    return {
      loadingSongs: true,
      musicPlaying: false,
      songsData: {},

      loadingSong: false,
      paused: true,
      volume: 0.5,
      oldVolume: null,
      playerVisible: false,
      loadProgress: 0,
      currentSong: null,
      currentSongId: null,

      searchPattern: '',
      searching: false,

      mainXHR: null,
      songs: {},
      timePlaying: 0
    }
  },
  watch: {
    paused: function (val) {
      if (!val) this.currentSong.play()
      else this.currentSong.pause()
      if (!val) this.playerVisible = true;
    },
    timePlaying(v) {
      this.timePlaying = v;
    },
    volume(val) {
      this.currentSong.volume = val;
    }
  },
  computed: {
    splitByPairs() {
      const res = {};
      for (let i = 0; i < this.songsData.length; i++) {
        const pn = this.songsData[i].para_num;
        if (!res[pn]) {
          res[pn] = [];
        }
        const toPush = this.songsData[i];
        toPush['globalIndex'] = i
        res[pn].push(toPush);
      }
      return res;
    },
    songsDataFiltered() {
      const r = this.songsData.filter((song) => {
        const regex = new RegExp(this.searchPattern, 'i');
        return regex.test(song.title) || regex.test(song.artist)
      });
      return r;
    },
  },
  methods: {
    loadSong(path) {
      if (path === this.currentSongId) {
        this.togglePlay();
        return;
      }
      if (this.songs[path] !== undefined) {
        this.playSong(path);
      } else {

        let xhr = this.mainXHR;
        xhr = new XMLHttpRequest();

        xhr.onprogress = (e) => {
          this.loadProgress =
            Math.round((e.loaded / e.total) * 100);
        };

        xhr.onreadystatechange = (e) => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            this.songs[path] = new Audio(xhr.responseText);
            this.playSong(path);
            this.loadProgress = 0;
          }
        };

        xhr.open('GET', window.origin + '/history/play/' + path);
        xhr.setRequestHeader('Content-Type', 'text/plain');
        xhr.send();
      }
    },
    playSong(id) {
      this.currentSongId = id;
      if (this.currentSong) {
        this.paused = true;
      }
      this.$nextTick(() => {
        this.currentSong = this.songs[id];
        this.currentSong.currentTime = 0;
        this.currentSong.volume = this.volume;
        this.currentSong.ontimeupdate = () => {
          this.timePlaying = this.currentSong ? this.currentSong.currentTime / this.currentSong.duration : 0;
        };
        this.paused = false;
        this.playerVisible = true;
      });

    },

    togglePlay(val) {
      if (this.currentSong !== null) {
        if (val !== undefined) {
          this.paused = val;
        } else {
          this.paused = !this.paused;
        }
      }
    },
    seek(val) {
      this.currentSong.currentTime =
        Math.round((val / 100) * this.currentSong.duration);
    },
    setVolume(val) {
      this.volume = val;
    },
    toggleVolume() {
      if (this.oldVolume === null) {
        this.oldVolume = this.volume;
        this.volume = 0;
      } else {
        this.volume = this.oldVolume;
        this.oldVolume = null;
      }
    },
    closePlayer() {
      this.togglePlay(true);
      this.musicPlaying = false;
      this.playerVisible = false;
    },

    prevTrack() {
      const ind = this.songsData.findIndex(song => song.path === this.currentSongId);
      if (ind >= 1 && ind < this.songsData.length)
        this.loadSong(this.songsData[ind - 1].path);
    },
    nextTrack() {
      const ind = this.songsData.findIndex(song => song.path === this.currentSongId);
      if (ind >= 0 && ind < this.songsData.length - 1)
        this.loadSong(this.songsData[ind + 1].path);
    },

    groupHeader(i) {
      return i < 1 ? 'До первой пары' : 'После ' + i + ' пары';
    },
  },
  components: {
    Track,
    Player,
    Seeker
  },
  mounted() {
    fetch(window.origin + '/history/getday', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Math.round((Date.now()) / 1000)
    })
      .then(res => res.json())
      .then(obj => {
        this.songsData = obj;
        this.loadingSongs = false;
      });
  }
}
</script>

<style lang="scss">
@import "../scss/style";

#loadIndicator {
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  height: 5px;
  z-index: 4;
  > .progress-bar {
    transition: all 0.2s;
  }
}
</style>
