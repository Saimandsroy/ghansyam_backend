const express = require('express');
const router = express.Router();
const controller = require('../controllers/debugController');
router.get('/wallet/:email', controller.debugWallet);
module.exports = router;
