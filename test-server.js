'use strict';

const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  console.log(req.url);
  const path = req.url === '/' ? './dist/index.html' : './dist/' + req.url;
  fs.readFile(path, (err, data) => {
    res.end(data);
  });
}).listen(8081);
