import express from 'express';
import { PayoutController } from '../controllers/payoutController.js';
import { verifyToken } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// All payout routes require authentication
router.use(verifyToken);

// Trigger payout when child reaches goal
router.post('/trigger-payout', PayoutController.triggerPayout);

// Get transaction history for a parent
router.get('/transactions/:parentId', PayoutController.getTransactionHistory);

// Get parent information
router.get('/parent/:parentId', PayoutController.getParentInfo);

// Get child information
router.get('/child/:childId', PayoutController.getChildInfo);

export default router;
