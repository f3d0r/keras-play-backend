var router = require('express').Router();
var multer = require('multer');
var sharp = require('sharp');
var fs = require('fs');
var uniqueString = require('unique-string');
const constants = require('@config');
var sql = require('@sql');

var upload = multer({
    storage: storage
});

router.get('/', function (req, res, next) {
    res.status(200).send("Welcome to the main endpoint!");
});

router.get('/ping', function (req, res, next) {
    res.status(200).send("pong");
});

module.exports = router;