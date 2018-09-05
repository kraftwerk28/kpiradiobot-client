'use strict';

const MongoClient = require('mongodb').MongoClient;
const url = `mongodb://localhost:27017`;
const dbName = 'admin';

const newSession = () => {
  MongoClient.connect(url, (err, client) => {
    const collection = client.db(dbName).collection('kpiradiobot');
    collection.update(
      { 'totalSessions': { $exists: true } },
      { $inc: { 'totalSessions': 1 } }
    );

    client.close();
  });
};

module.exports = { newSession };
