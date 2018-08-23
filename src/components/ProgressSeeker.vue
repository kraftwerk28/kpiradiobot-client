<template>
  <div>
    <div ref="clickarea"
      class="progress ml-1 mr-1"
      draggable="false"
      @mousedown="mDown($event)"
      @mouseup="mUp"
      @mousemove="mMove">
      <div class="progress-bar"
        draggable="false"
        :style="style"></div>
    </div>
  </div>

</template>

<script>

export default {
  data() {
    return {
      val: this.value,
      clicked: false
    }
  },
  props: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    value: { type: Number, default: 0 },
    disabled: Boolean,
    flex: Number,
    icon: { type: String, default: '' }
  },
  watch: {
    value(v) {
      this.val = v * this.max;
    }
  },
  computed: {
    progress() {
      return Math.round((this.val / this.max) * 100);
    },
    style() {
      return {
        width: this.progress + '%'
      }
    }
  },
  methods: {
    movHandler(e) {
      const left = this.$refs.clickarea.offsetLeft;
      const w = this.$refs.clickarea.offsetWidth;
      this.val = ((e.clientX - left) / w) * this.max;
    },
    mDown(evt) {
      if (evt.button === 0 && !this.disabled) {
        this.clicked = true;
        const left = this.$refs.clickarea.offsetLeft;
        const w = this.$refs.clickarea.offsetWidth;
        this.val = ((evt.clientX - left) / w) * this.max;
        document.addEventListener('mousemove', this.movHandler);
        this.$emit('change', this.val);
      }
    },
    mMove(evt) {
      if (this.clicked) this.mDown(evt);
    },
    mUp() {
      this.clicked = false;
      document.removeEventListener('mousemove', this.movHandler);
    }
  },
  mounted() {
    document.addEventListener('mouseup', () => { this.mUp(); });
  }
}
</script>

<style lang="scss">
@import "../scss/style";
div.progress {
  cursor: pointer;
  user-select: none;
  > div {
    user-select: none;
    transition-duration: 0s;
  }
}
</style>
