const Mongo = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const mongoUtils = require('../utils/mongo_utils');

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    try {
        let db = mongoUtils.getDb();
        db.collection('acts').find({}).toArray((err, docs) => {
            console.log(docs);
            res.send(docs);
        });
    } catch (err) {
        console.log(err);
        res.send(err)
    }
});

/* POST act info. */
router.post('/', function (req, res, next) {
    try {
        let db = mongoUtils.getDb();
        req.body['time'] = new Date().getTime();
        db.collection('acts').insertOne(req.body, (err, docs) => {
            if (err) {
                console.log(err);
                res.status(500).send("error adding the act")
            }
            console.log("added");
            res.send(`${req.body.name} added`);
        });
    } catch (err) {
        console.log(err);
        res.send(err)
    }
});

/* edit act. */
router.post('/edit', function (req, res, next) {    
    let data = {...req.body};
    delete data.id;

    console.log(req.body)

    let db = mongoUtils.getDb();
    db.collection('acts').findOneAndUpdate({_id: new ObjectId(req.body.id)}, {$set: data}, (err, docs) => {
        if(err) {
            res.status(500).send("Update query failed. Body: " + JSON.stringify(req.body) + ". " + JSON.stringify(err))
            return;
        }
        console.log(docs)
        res.send("updated");
    });
});

/* delete act. */
router.delete('/delete', function (req, res, next) { 

    let db = mongoUtils.getDb();
    db.collection('acts').deleteOne({_id: new ObjectId(req.body.id)}, (err, docs) => {
        if(err) {
            res.status(500).send("Delete query failed. Body: " + JSON.stringify(req.body) + ". " + JSON.stringify(err))
            return;
        }
        console.log(docs)
        res.send("deleted");
    });
});

module.exports = router;