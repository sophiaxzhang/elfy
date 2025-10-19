import express from 'express';
import 'dotenv/config'
import userRoutes from './routes/userRoutes.js'
<<<<<<< Updated upstream
import choreRoutes from './routes/choreRoutes.js'
=======
import payoutRoutes from './routes/payoutRoutes.js'
import paymentMethodRoutes from './routes/paymentMethodRoutes.js'
>>>>>>> Stashed changes
import cors from 'cors';
import { verifyToken } from './middlewares/validationMiddleware.js';
import { MockPayoutController } from './controllers/mockPayoutController.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);
<<<<<<< Updated upstream
app.use('/chore', choreRoutes);
=======
app.use('/api', payoutRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint for Visa Direct (no auth required for testing)
app.post('/test-visa', MockPayoutController.testTriggerPayout);
>>>>>>> Stashed changes

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});
