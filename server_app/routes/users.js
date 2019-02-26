const Mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const mongoUtils = require('../utils/mongo_utils');

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    try {
        let db = mongoUtils.getDb();
        db.collection('users').find({}).toArray((err, docs) => {
            console.log(docs);
            //res.send(docs);
        });
        res.send('users')
    } catch (err) {
        console.log(err);
        res.send(err)
    }
});

/* ADD user. */
router.get('/import', function (req, res, next) {
    let users = [];
    let errs = 0;
    // var lineReader = require('readline').createInterface({
    //     input: require('fs').createReadStream('users_email.csv')
    // });
    // lineReader.on('line', function (line) {
    //     let user = line.split(",");
    //     let offset = new Date().getTimezoneOffset() * 60000;
    //     let doj = new Date(user[2])
    //     doj.setTime(doj.getTime() - offset);
    //     let dob = new Date(user[5])
    //     dob.setTime(dob.getTime() - offset);

    //     users.push({
    //         firstName: user[0],
    //         lastName: user[1],
    //         doj: doj,
    //         emp_id: user[3],
    //         email: user[4]
    //     })
    // });
    // lineReader.on('close', () => {
    //     console.log(errs)

    //     require('fs').writeFile('users_email.json', JSON.stringify(users, null, 4), (err) => {
    //         if (err) {
    //             console.log(err)
    //         }
    //         console.log("written");
    //     })
    //     res.send(users)
    // });



    // let db = mongoUtils.getDb();
    // db.collection('users').insertMany(userData, (err, docs) => {
    //     console.log(docs);
    //     res.send(docs);
    // });

    // require('fs').readFile('routes/users.json', 'utf8', (err, users) => {
    //     if (err) {
    //         console.log(err)
    //         return
    //     }
    //     users = JSON.parse(users);
    //     users.forEach((user, i) => {
    //         users[i].doj = new Date(user.doj)
    //         users[i].dob = new Date(user.dob)
    //     });
    //     let db = mongoUtils.getDb();
    //     db.collection('users').insertMany(users, (err, docs) => {
    //         //console.log(docs);
    //     });
    //     res.send(users)
    // })
});

/* GET user info. */
router.get('/:id', function (req, res, next) {
    try {
        let db = mongoUtils.getDb();
        db.collection('users').find({ "emp_id": req.params.id }).toArray((err, docs) => {
            console.log(docs);
            res.send(docs);
        });
    } catch (err) {
        console.log(err);
        res.send(err)
    }
});


/* login. */
router.post('/login', function (req, res, next) {
    let { emp_id, dob } = req.body;
    let db = mongoUtils.getDb();
    db.collection('users').findOne({ emp_id: emp_id }, (err, docs) => {
        if (docs == null) {
            res.send({
                status: false,
                msg: "incorrect id"
            });
            return;
        }

        let d = new Date(docs.dob);
        let _dob = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
        console.log(dob + "_|_" + _dob)
        if (dob == _dob) {
            res.send({
                status: true, id: emp_id, data: docs, timeZoneOffset: new Date().getTimezoneOffset()
            })
        } else {
            res.send({
                status: false,
                dob: docs.dob,
                cdob: _dob,
                data: docs,
                timeZoneOffset: new Date().getTimezoneOffset()
            })
        }
    });
});

let settings = {
	"female": [
		{ "name": "eye", "title": "Eyes", "count": 53 },
		{ "name": "head", "title": "Hair", "count": 33 },
		{ "name": "mouth", "title": "Mouth", "count": 17 },
		{ "name": "clothes", "title": "Clothes", "count": 59 },
		{ "name": "face", "title": "Face", "count": 4 },
		{ "name": "background", "title": "Background", "count": 5 }
	],
	"male": [
		{ "name": "eye", "title": "Eyes", "count": 32 },
		{ "name": "head", "title": "Hair", "count": 36 },
		{ "name": "mouth", "title": "Mouth", "count": 26 },
		{ "name": "clothes", "title": "Clothes", "count": 65 },
		{ "name": "face", "title": "Face", "count": 4 },
		{ "name": "background", "title": "Background", "count": 5 }
	]
}

let randomNum = (max) => {
    return Math.floor((Math.random() * max) + 1);
}
let generateConfig = (gender) => {
    let eyes = randomNum(settings[gender][0].count);
    let head = randomNum(settings[gender][1].count);
    let mouth = randomNum(settings[gender][2].count);
    let clothes = randomNum(settings[gender][3].count);
    let face = randomNum(settings[gender][4].count);

    return `${eyes}:${head}:${mouth}:${clothes}:${face}`
}

/* GET user info. */
// router.get('/avatar/a/a', function (req, res, next) {
//     let db = mongoUtils.getDb();
//     console.log('gen avatar')
//     require('fs').readFile('routes/users.json', 'utf8', (err, users) => {
//         if (err) {
//             console.log('file not found')
//             console.log(err)
//             return
//         }
//         let usersData = [];
        
//         users = JSON.parse(users);
//         users.forEach((user, i) => {
//             let gender = user.gender;
//             let avatar = generateConfig(gender);
//             usersData.push({
//                 emp_id: user.emp_id,
//                 avatar: avatar
//             });
//             let objx = {avatar: avatar}

//             db.collection('users').updateOne({emp_id: user.emp_id}, {$set: objx}, (erro, docs) => {
//                 if(erro) {
//                     console.log(user.emp_id + ' update failed')
//                 } else {
//                     console.log(user.emp_id + ' updated')
//                 }
//             });
//         });

        
        
//         res.send(usersData)
//     })
// });

module.exports = router;