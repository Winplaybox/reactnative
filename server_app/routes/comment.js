const Mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

var express = require('express');
var router = express.Router();

/* GET comments. */
router.get('/', function (req, res, next) {
    try {
        let db = require('../utils/mongo_utils').getDb();
        db.collection('comments').find({}).toArray((err, docs) => {
            console.log(docs);
            res.send(docs);
        });
    } catch (err) {
        console.log(err);
        res.send(err)
    }
});

/* ADD comment. */
router.post('/', function (req, res, next) {
    let { user, post } = req.body;
    let comment = { usr_id: user, pid: post }
    let db = require('../mongo_utils').getDb();
    db.collection('comments').insertOne(comment, (err, docs) => {
        console.log(docs);
        res.send(docs);
    });
});

/* Delete comment. */
router.delete('/:id', function (req, res, next) {
    let o_id = new ObjectId(args.id)
    let db = require('../mongo_utils').getDb();
    db.collection('comments').deleteOne({ _id: o_id }, (err, docs) => {
        console.log(docs);
        res.send(docs);
    });
});

/* Delete post > comments */
router.delete('/post/:id', function (req, res, next) {
    let { post_id } = req.params.body;
    let db = require('../mongo_utils').getDb();
    db.collection('comments').deleteMany({ pid: post_id }, (err, docs) => {
        console.log(docs);
        res.send(docs);
    });
});

module.exports = router;