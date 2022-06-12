const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');

router.post('/get', balanceController.getAllBalances);
router.post('/get/:address', balanceController.getBalance);
router.post('/set', balanceController.setBalance);




module.exports = router;