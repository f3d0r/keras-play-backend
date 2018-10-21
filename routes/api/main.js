var router = require('express').Router();
var multer = require('multer');
var fs = require('fs');
var cmd = require('node-cmd');

router.get('/', function (req, res) {
    res.status(200).send("Welcome to the main endpoint!");
});

router.get('/ping', function (req, res) {
    res.status(200).send("pong");
});

router.get('/run_keras', function (req, res) {
    var body = JSON.stringify(req.body);
    fs.writeFile('/home/fedor/current_body.json', body, (err) => {
        if (err) {
            res.status(500).send("ERROR WRITING FILE!");
        } else {
            cmd.get(
                'python3 /home/fedor/json_to_hdf5.py',
                function (err, data, stderr) {
                    if (err) {
                        res.status(500).send("ERROR: " + err);
                    } else {
                        res.send("output: " + stderr);
                    }

                }
            );
        }

    });
});

module.exports = router;