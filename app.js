// PACKAGE IMPORTS
require('express-async-errors');
const bodyParser = require('body-parser');
const constants = require('./config');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const timeout = require('connect-timeout');

// EXPRESS SET UP
const app = express();

app.use(timeout(constants.express.RESPONSE_TIMEOUT_MILLI));
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

// MAIN ENDPOINTS
app.get('/', async (req, res) => {
  res.send('Welcome to the API!');
});

app.get('/ping', async (req, res) => {
  res.send('pong');
});

app.use(require('./routes'));

function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}

app.use(haltOnTimedout);

const server = app.listen(process.env.PORT, () => {
  console.log(`SERVER STARTED on PORT ${process.env.PORT}`);
});

module.exports = server;
