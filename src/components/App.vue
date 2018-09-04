<template>
  <div class="container-fluid p-0">
    <div id="loadIndicator"
      class="progress bg-transparent"
      v-show="loadProgress > 0">
      <div class="progress-bar bg-danger"
        role="progressbar"
        :style="{ width: loadProgress + '%' }">
      </div>
    </div>

    <nav class="navbar navbar-dark bg-primary pt-2">
      <a class="navbar-brand"
        href="https://t.me/kpiradio_bot"
        title="Developed by @kraftwerk28">
        KPIRADIOBOT
      </a>
      <Player :paused="paused"
        v-show="playerVisible"
        :songTitle="songName"
        @toggle-play="togglePlay"
        @close="closePlayer"
        :time="timePlaying"
        :volume="volume"
        @seek="seek($event)"
        @volume="setVolume($event)"
        @toggle-volume="toggleVolume"
        @prev-track="prevTrack"
        @next-track="nextTrack"
        :playerFixed="playerFixed" />
    </nav>

    <div id="tracks"
      class="pl-2 pr-2">
      <div class="row mt-2 mb-2">
        <div class="input-group col-md-4"
          title="Виберіть день">
          <div class="input-group-prepend">
            <span class="input-group-text material-icons">date_range</span>
          </div>
          <input type="date"
            :value="new Date(timeStamp).yyyymmdd()"
            :max="new Date().yyyymmdd()"
            @change="setTimeStamp($event)"
            class="form-control" />
        </div>

        <div class="input-group col-md-8">
          <input type="text"
            :disabled="searching"
            placeholder="пошук"
            class="form-control"
            v-model="searchPattern"
            @keyup.enter="searching = true">
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

      <div v-if="loadingSongs"
        class="text-center"
        style="text-align: -webkit-center;">
        <div class="alert alert-dark">
          Завантаження...
        </div>
        <div class="spin-loader"
          style="margin: auto">
          <img src="../assets/ebalo-bota.png"
            alt="">
        </div>
      </div>

      <div v-else-if="songsData.length === 0"
        class="alert alert-info text-center">
        Тут поки що пусто...
      </div>

      <div v-else-if="!searching && !loadingSongs">
        <ul v-for="(group, i) in splitByPairs"
          :key="i"
          class="list-group">
          <li v-if="groupHeader(i) !== null"
            class="list-group-item bg-dark text-white text-center align-middle mt-3">
            <h3>
              <span class="material-icons align-middle">arrow_downward</span>
              {{groupHeader(i)}}
              <span class="material-icons align-middle">arrow_downward</span>
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
    <footer v-if="!loadingSongs"
      class="footer pt-5 pb-4 text-center font-weight-bold">
      <img src="../assets/kpi.png"
        alt=""
        width="40"
        height="40"> Для КПИ by
      <a href="https://t.me/svinerus">@svinerus</a>
      &
      <a href="https://t.me/kraftwerk28">@kraftwerk28</a>
    </footer>

    <transition name="scrollup">
      <button v-if="playerFixed"
        class="scrollup btn btn-dark"
        @click="scrollUpFull">
        <span>arrow_upward</span>
      </button>
    </transition>
  </div>
</template>

<script>
import Track from './Track.vue';
import Player from './Player.vue';
import Seeker from './ProgressSeeker.vue';
import '../assets/kpi.png';
import '../assets/ebalo-bota.png';

Date.prototype.yyyymmdd = function () {
  let mm = this.getMonth() + 1; // getMonth() is zero-based
  let dd = this.getDate();

  return [this.getFullYear(),
  (mm > 9 ? '' : '0') + mm,
  (dd > 9 ? '' : '0') + dd
  ].join('-');
}

Date.ms = function (str) { // YYYY-MM-DD
  // console.log(str.slice(0, 4), str.slice(5, 7), str.slice(8, 10));
  return new Date(+str.slice(0, 4), +str.slice(5, 7) - 1, +str.slice(8, 10));
}

export default {
  data() {
    return {
      timeStamp: Date.now(),

      loadingSongs: true,
      musicPlaying: false,
      songsData: [],

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
      timePlaying: 0,

      playerFixed: false
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
      if (this.currentSong)
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
    songName() {
      const song = this.songsData.find(s => s.path === this.currentSongId);
      if (song) {
        return (song.artist ? song.artist + ' — ' : '') + song.title;
      }
    }
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

        const audio = new Audio();
        audio.src = window.origin + '/history/play2/' + path;
        audio.load();

        // audio.onprogress = (e) => {
        //   console.log('loading...', audio.buffered.end(0) / audio.duration);
        //   this.loadProgress =
        //     Math.round((audio.buffered.end(0) / audio.duration) * 100);
        // };

        audio.onloadeddata = (e) => {
          this.playSong(path);
        };

        audio.onended = () => {
          this.nextTrack();
        }

        this.songs[path] = audio;
        this.loadProgress = 0;


        // let xhr = this.mainXHR;
        // xhr = new XMLHttpRequest()

        // xhr.onprogress = (e) => {
        //   this.loadProgress =
        //     Math.round((e.loaded / e.total) * 100);
        // };


        // xhr.onreadystatechange = (e) => {
        //   if (xhr.readyState === 4 && xhr.status === 200) {
        //     this.songs[path] = new Audio(xhr.responseText);
        //     this.playSong(path);
        //     this.loadProgress = 0;
        //   }
        // };

        // xhr.open('GET', window.origin + '/history/play2/' + path);
        // xhr.setRequestHeader('Content-Type', 'text/plain');
        // xhr.send();
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
      return i < 1 ? null : 'Після ' + i + ' пари';
    },

    setTimeStamp(e) {
      this.timeStamp = Date.ms(e.target.value);
      this.ajaxifySongs(this.timeStamp);
    },
    ajaxifySongs(dateTime) {
      const tm = Math.round(dateTime / 1000);
      this.loadingSongs = true;
      fetch(window.origin + '/history/getday/' + tm, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(obj => {
          this.songsData = obj;
          this.loadingSongs = false;
        });
    },

    scrollUpFull() {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  },
  components: {
    Track,
    Player,
    Seeker
  },
  mounted() {
    this.ajaxifySongs(Date.now());

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50 && !this.playerFixed) {
        this.playerFixed = true;
      } else if (window.scrollY <= 50 && this.playerFixed)
        this.playerFixed = false;
    });

    const vol = localStorage.getItem('krbVolume');
    if (vol !== undefined && !isNaN(vol)) {
      this.volume = +vol;
    }
    if (this.volume <= 0) this.volume = 0.5;
    window.addEventListener('beforeunload', () => {
      localStorage.setItem('krbVolume', this.volume);
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
  height: 10px;
  z-index: 20;
  > .progress-bar {
    transition: all 0.2s;
  }
}

#tracks {
  overflow-x: hidden;
}

.spin-loader > img {
  width: 100px;
  height: 100px;
  // background: $primary;
  border-radius: 10px;
  animation: r 1s ease 0s infinite;
  flex-basis: 100%;

  @keyframes r {
    0% {
      transform: rotate(0deg) scale(1);
    }
    25% {
      transform: rotate(0deg) scale(1.2);
    }
    50% {
      transform: rotate(0deg) scale(1);
    }
    100% {
      transform: rotate(360deg) scale(1);
    }
  }
}

.scrollup {
  position: fixed;
  right: 20px;
  bottom: 10px;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  z-index: 5;
  box-shadow: 0px 0px 20px $secondary;
}

.scrollup-enter-active,
.scrollup-leave-active {
  transition: transform 0.5s;
}

.scrollup-enter,
.scrollup-leave-to {
  transform: translateY(100px);
}
</style>
