'use strict';

const http = require('http');
const fs = require('fs');

function getPostData(request) {
  return new Promise((resolve, reject) => {
    let data = ''
    request.on('data', (c) => {
      data += c;
    });
    request.on('error', (err) => reject(err));
    request.on('end', () => { resolve(data) });
  });
};

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/krb')) {
    // proxying...

    const proxyUrl = req.url.slice(4);
    const isAudio = proxyUrl.includes('/play2');

    getPostData(req).then(postdata => {
      const proxy = http.request({
        method: req.method,
        host: 'kpiradiobot.ga',
        port: '80',
        path: proxyUrl,
        headers: {
          'Content-Type': req.headers['content-type'] ? req.headers['content-type'] : '*/*',
        }
      }, (_res) => {
        res.setHeader('Content-Length', _res.headers['content-length']);
        if (isAudio) {
          res.setHeader('Content-Disposition', 'inline; filename="kpiradiobot.mp3"');
          //   res.setHeader('Accept-Ranges', 'bytes');
          //   res.setHeader('Content-Range', 'bytes */' + _res.headers['content-length']);
        }
        _res.on('data', (c) => {
          res.write(c);
        });
        _res.on('end', () => {
          res.end();
        });
      });

      proxy.end(req.method === 'POST' && postdata);
    });

  } else {
    const path = req.url === '/' ? './dist/index.html' : './dist/' + req.url;
    fs.readFile(path, (err, data) => {
      res.end(data);
    });
  }

}).listen(8081);
