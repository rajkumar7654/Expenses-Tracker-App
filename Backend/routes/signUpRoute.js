const express = require('express');
const router = express.Router();
const userSignUpController = require('../controllers/signUpController');

router.post('/signup', userSignUpController.userSignUp);


module.exports = router;