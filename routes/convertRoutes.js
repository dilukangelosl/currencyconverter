const express = require('express');
const router = express.Router();
const controller = require('../controllers/convertCtrl');



router.post('/', controller.convert);

module.exports = router;