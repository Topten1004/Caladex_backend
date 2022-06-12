const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const uploadImage = require('../utils/uploadImage');
const uploadPDF = require('../utils/uploadPDF');


router.post('/get', tokenController.getAllTokens);
router.post('/get/:id', tokenController.getToken);
router.post('/update/:id', tokenController.updateToken);
router.post('/delete/:id', tokenController.deleteToken);
router.post('/add', uploadImage, tokenController.addToken);
router.post('/approve/:id', tokenController.approveToken);
router.post('/deny/:id', tokenController.denyToken);
router.post('/search', tokenController.search);
router.post('/upload/:id', uploadPDF, tokenController.upload);




module.exports = router;