const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const user = 'zeal';
const pass = 'q3nzbT99jgHm3aht';
const uri = `mongodb://${user}:${pass}@ds163014.mlab.com:63014/zeal`; 
const dbName = 'zeal';
let db;

module.exports = {
    connectToServer: function (callback) {
        MongoClient.connect(uri, { useNewUrlParser: true }, (err, client) => {
            assert.equal(null, err);
            callback();
            console.log("Connected correctly to server");
            db = client.db(dbName);
        });
    },
    getDb: function () {
        return db;
    }
}