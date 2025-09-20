const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.get('/logout', authController.logout);

router.get('/forgot', authController.getForgot);
router.post('/forgot', authController.postForgot);

router.get('/reset/:token', authController.getReset);
router.post('/reset/:token', authController.postReset);

module.exports = router;
