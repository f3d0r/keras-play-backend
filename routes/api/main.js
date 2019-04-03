require('express-async-errors');
const cmd = require('node-cmd');
const fs = require('fs');
const os = require('os');
const router = require('express').Router();

router.get('/', async (req, res) => {
  res.send('Welcome to the main endpoint!');
});

router.get('/ping', async (req, res) => {
  res.send('pong');
});

router.get('/run_keras', async (req, res) => {
  const body = JSON.stringify(req.body);
  await fs.writeFile('/home/fedor/current_body.json', body);
  await cmd.get('cd /home/fedor && python3 /home/fedor/json_to_hdf5.py');
  const resOut = await os.execCommand('cd /home/fedor && python3 /home/fedor/hdf5_keras.py');
  res.send(`output: ${resOut}`);
});

module.exports = router;
