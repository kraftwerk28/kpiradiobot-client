'use strict';

const http = require('http');
const fs = require('fs');
const mongo = require('./lib/mongo');

const router = {
  '\/err$': (req) => {
    getPostData(req).then(data => {
      fs.appendFileSync('errorlog', data);
    });
  },
  '\/session$': (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    getPostData(req).then(data => {
      mongo.newSession(data);
    });

  },
  '\/$': (req, res) => {
    console.log('/index.html');
    fs.readFile(__dirname + '/dist/index.html', 'utf8', (err, data) => {
      res.statusCode = 200;
      res.end(data);
    });
  },
  '\/.*\.png$': (req, res) => {
    res.setHeader('Content-Type', 'image/png');
    fs.readFile(__dirname + '/dist' + req.url, (err, data) => {
      res.statusCode = 200;
      res.end(data);
    })
  },
  '\/.*$': (req, res) => {
    console.log(req.url);
    const path = '/dist' + req.url;
    fs.readFile(__dirname + path, 'utf8', (err, data) => {
      res.statusCode = 200;
      res.end(data);
    });
  }
}

function getPostData(request) {
  return new Promise((resolve, reject) => {
    let data = '';
    request.on('data', (c) => {
      data += c;
    });
    request.on('error', (err) => reject(err));
    request.on('end', () => { resolve(data) });
  });
};

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/krb')) {
    console.log('proxying...');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');

    const proxyUrl = req.url.slice(4);
    const isAudio = proxyUrl.includes('/play');

    getPostData(req).then(postdata => {
      const proxy = http.get({
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
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Content-Range', 'bytes */' + _res.headers['content-length']);
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
    for (let key in router) {
      const regex = new RegExp(key).test(req.url);
      if (regex) {
        router[key](req, res);
        break;
      }
    }
  }

});

server.listen(8081, () => { console.log('Server listening on http://localhost:8081'); });
