const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');


router.post('/login', authController.login);
router.post('/signup', authController.signup);


// Protect all routes after this middleware
router.use(authController.protect);

router.post('/changepassword', authController.changePassword);

router.post('/logout', authController.logout);


module.exports = router;