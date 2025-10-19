import { Router } from "express";
import { PaymentController } from "../controllers/paymentController.js";
import { verifyToken } from "../middlewares/validationMiddleware.js";

const router = Router();

// All payment routes require authentication
router.use(verifyToken);

// Pull funds from a payment method
router.post('/pull-funds', PaymentController.pullFunds);

// Get user's payment methods
router.get('/methods/:userId', PaymentController.getPaymentMethods);

// Get transaction history
router.get('/transactions/:userId', PaymentController.getTransactionHistory);

// Get specific transaction status
router.get('/transaction/:transactionId', PaymentController.getTransactionStatus);

export default router;
