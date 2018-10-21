require('module-alias/register');

// PACKAGE IMPORTS
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const timeout = require('connect-timeout');
var helmet = require('helmet')

if (process.env.THREAD_COUNT == "CPU_COUNT" || process.env.THREAD_COUNT == "CPU") {
    threadCount = require('os').cpus().length;
} else {
    try {
        threadCount = parseInt(process.env.THREAD_COUNT)
    } catch (e) {
        console.log("INVALID \"INSTANCE_COUNT\" environment variable. Exiting...")
        process.exit()
    }
}

// LOCAL IMPORTS
const constants = require('@config');

// EXPRESS SET UP
var app = express();

app.use(timeout(constants.express.RESPONSE_TIMEOUT_MILLI));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cors());
app.use(helmet())

// MAIN ENDPOINTS
app.get('/', function (req, res, next) {
    res.status(200).send("Welcome to the API!");
});

app.get('/ping', function (req, res, next) {
    res.status(200).send("pong");
});

app.use(require('./routes'));

app.use(haltOnTimedout);

function haltOnTimedout(req, res, next) {
    if (!req.timedout)
        next();
}

var server = app.listen(process.env.PORT, function () {
    console.log("SERVER STARTED on PORT " + process.env.PORT);
});