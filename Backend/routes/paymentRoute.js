const express = require('express');

const router = express.Router();

const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/create-order', authMiddleware, paymentController.processPayment);
router.get('/status/:orderId', paymentController.getPaymentStatus);
router.get('/success', paymentController.getPaymentSuccess);


module.exports = router;