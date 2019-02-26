const Mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const uuidv1 = require('uuid/v1');

var express = require('express');
var router = express.Router();

const multer = require('multer');
const mUpload = multer({ storage: multer.memoryStorage() });
const mongoUtils = require('../utils/mongo_utils');

const { uploadBufferToS3 } = require('./../utils/S3Handler');

/* GET media listing. */
router.get('/', function (req, res, next) {
    try {
        let db = mongoUtils.getDb();
        db.collection('media').find({}).toArray((err, docs) => {
            console.log(docs);
            res.send('media');
        });
    } catch (err) {
        console.log(err);
        res.send(err)
    }
});

/* GET media by id. */
router.get('/:id', function (req, res, next) {
    try {
        let db = mongoUtils.getDb();
        db.collection('media').find({ "_id": req.params.id }).toArray((err, docs) => {
            console.log(docs);
            res.send(docs);
        });
    } catch (err) {
        console.log(err);
        res.send(err)
    }
});

/* GET media by id. */
router.get('/test/route', function (req, res, next) {
    console.log('working')
    res.send('working')
});

/* Upload media. */
router.post('/', mUpload.single('file'), function (req, res, next) {
    let usrId = req.body.user_id || "12772";
    let file = req.file;
    let fileName = `${uuidv1()}_${usrId}_${file.originalname}`;
    let filePath = `images/${fileName}`;
    let db = mongoUtils.getDb();

    console.log("file upload")
    console.log(req.body)
    console.log(file)

    uploadBufferToS3(file.buffer, filePath, () => { //error        
        res.send(`${file.originalname} upload failed`);
    }, () => { //success
        let doc = {
            post_id: req.body.post_id || "",
            post_type: req.body.post_id.length > 0 ? "activity" : "private",
            user_id: usrId,
            media_type: "img",
            name: fileName,
            desc: req.body.desc || "",
            time: new Date().getTime(),
            model: req.body.desc || "",
            view_count: 0
        }
        db.collection('media').insertOne(doc, (err, docs) => {
            if(err) {
                res.status(500).send(JSON.stringify(err));
                return;
            }
            console.log(docs);
            res.send(`${file.originalname} successfully uploaded`);
        });
    });
});

module.exports = router;