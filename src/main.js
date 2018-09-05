window.origin = 'krb';
// window.origin = 'http://kpiradiobot.ga';

import Vue from 'vue';
import App from './components/App.vue';

window.addEventListener('error', (msg, url, line, column) => {
  fetch('/err', {
    body: `${new Date()}%0A${navigator.userAgent}%0A%09${line}:${column}%09${msg}%0A%0A`,
    method: 'POST',
  });
});

window.addEventListener('load', function () {
  fetch('/session', { method: 'GET' });
});

window.vm = new Vue({
  el: '#zalupa',
  render(h) {
    return h(App);
  }
});
