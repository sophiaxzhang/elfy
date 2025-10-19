import express from 'express';
import { PaymentMethodController } from '../controllers/paymentMethodController.js';
import { verifyToken } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// All payment method routes require authentication
router.use(verifyToken);

// Create a new payment method
router.post('/', PaymentMethodController.createPaymentMethod);

// Get all payment methods for a user
router.get('/user/:userId', PaymentMethodController.getUserPaymentMethods);

// Set default payment method
router.put('/:id/set-default', PaymentMethodController.setDefaultPaymentMethod);

// Delete payment method
router.delete('/:id', PaymentMethodController.deletePaymentMethod);

export default router;
