var router = require('express').Router();
var multer = require('multer');
var fs = require('fs');

router.get('/', function (req, res) {
    res.status(200).send("Welcome to the main endpoint!");
});

router.get('/ping', function (req, res) {
    res.status(200).send("pong");
});

router.get('/run_keras', function(req, res)) {
    
}

module.exports = router;