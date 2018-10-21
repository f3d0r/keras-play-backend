var router = require('express').Router();
var multer = require('multer');
var fs = require('fs');

router.get('/', function (req, res, next) {
    res.status(200).send("Welcome to the main endpoint!");
});

router.get('/ping', function (req, res, next) {
    res.status(200).send("pong");
});

module.exports = router;