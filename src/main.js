window.origin = 'krb';
// window.origin = 'http://kpiradiobot.ga';

import Vue from 'vue';
import App from './components/App.vue';

window.vm = new Vue({
  el: '#zalupa',
  render(h) {
    return h(App);
  }
})
