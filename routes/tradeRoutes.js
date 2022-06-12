const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/tradeController');

router.post('/get', tradeController.getAllTrades);
router.post('/get/:id', tradeController.getTrade);
router.post('/getbuy', tradeController.getBuyTrades);
router.post('/getsell', tradeController.getSellTrades);
router.post('/update/:id', tradeController.updateTrade);
router.post('/delete/:id', tradeController.deleteTrade);
router.post('/add', tradeController.addTrade);




module.exports = router;