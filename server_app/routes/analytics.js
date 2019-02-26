const Mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const mongoUtils = require('../utils/mongo_utils');

var express = require('express');
var router = express.Router();

/* login. */
router.post('/share', function (req, res, next) {
    let { emp_id, dob } = req.body;
    let db = mongoUtils.getDb();
    db.collection('analytics').insertOne(req.body, (err, docs) => {
        if(err) {
            res.status(500).send(JSON.stringify(err));
            return;
        }
        console.log(docs);
        res.send(`anlytics submitted`);
    });
});


module.exports = router;