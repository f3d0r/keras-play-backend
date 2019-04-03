const router = require('express').Router();

router.use('/api', require('./api/main'));

module.exports = router;
