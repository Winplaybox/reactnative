var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send('<h1 style="font-size:130px;margin:0;">&#x1F44C;</h1><div>0.0.1</div>');
});

module.exports = router;
