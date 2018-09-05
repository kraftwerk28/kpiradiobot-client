'use strict';

const qs = require('querystring');
const MongoClient = require('mongodb').MongoClient;
const url = `mongodb://localhost:27017`;
const dbName = 'admin';

const newSession = (data) => {
  MongoClient.connect(url, (err, client) => {
    const collection = client.db(dbName).collection('kpiradiobot');
    collection.update(
      { 'totalSessions': { $exists: true } },
      { $inc: { 'totalSessions': 1 } }
    );
    collection.update(
      { 'totalSessions': { $exists: true } },
      { $push: { 'users': qs.unescape(data) } }
    );

    client.close();
  });
};

module.exports = { newSession };
