const express = require('express');
const router = express.Router();
const userSignUpController = require('../controllers/signUpController');

router.get('/signup', userSignUpController.getUserSignUp);
router.post('/signup', userSignUpController.userSignUp);


module.exports = router;