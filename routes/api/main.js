var router = require('express').Router();
var fs = require('fs');
var cmd = require('node-cmd');
const exec = require('child_process').exec;

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
                'cd /home/fedor && python3 /home/fedor/json_to_hdf5.py',
                function (err, data, stderr) {
                    if (err) {
                        res.status(500).send("ERROR: " + err);
                    } else {
                        os.execCommand('cd /home/fedor && python3 /home/fedor/hdf5_keras.py').then(resOut => {
                            res.send("output: " + resOut)
                        }).catch(err => {
                            console.log("os >>>", err);
                        })
                    }
                }
            );
        }
    });
});

function os_func() {
    this.execCommand = function (cmd) {
        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(stdout)
            });
        })
    }
}
var os = new os_func();

module.exports = router;