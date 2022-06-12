const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');


router.post('/getall', orderController.getAllOrders);
router.post('/get', orderController.getOrders);
router.post('/get/:id', orderController.getOrder);
router.post('/getbuy', orderController.getBuyOrders);
router.post('/getsell', orderController.getSellOrders);
router.post('/getallbuy', orderController.getAllBuyOrders);
router.post('/getallsell', orderController.getAllSellOrders);
router.post('/update/:id', orderController.updateOrder);
router.post('/delete/:id', orderController.deleteOrder);
router.post('/add', orderController.addOrder);




module.exports = router;