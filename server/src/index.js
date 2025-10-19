import express from 'express';
import 'dotenv/config'
import userRoutes from './routes/userRoutes.js'
import choreRoutes from './routes/choreRoutes.js'
import payoutRoutes from './routes/payoutRoutes.js'
import paymentMethodRoutes from './routes/paymentMethodRoutes.js'
import aiTaskSuggestionRoutes from './routes/aiTaskSuggestionRoutes.js'
import cors from 'cors';
import { verifyToken } from './middlewares/validationMiddleware.js';
import { MockPayoutController } from './controllers/mockPayoutController.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);
app.use('/chore', choreRoutes);
app.use('/api', payoutRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/ai', aiTaskSuggestionRoutes);

// Test endpoint for AI suggestions (no auth required for testing) - moved up
app.post('/test-ai-suggestions', async (req, res) => {
  try {
    const { AITaskSuggestionService } = await import('./services/aiTaskSuggestionService.js');
    const { childAge, childName, context = 'general' } = req.body;
    
    console.log('AI Suggestions request:', { childAge, childName, context });
    
    const suggestions = await AITaskSuggestionService.generateTaskSuggestions({
      childAge: parseInt(childAge),
      childName: childName.trim(),
      context: context.trim()
    });
    
    console.log('AI Suggestions response:', suggestions);
    
    res.json({
      success: true,
      suggestions,
      count: suggestions.length
    });
  } catch (error) {
    console.error('Test AI suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate suggestions',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint for Visa Direct (no auth required for testing)
app.post('/test-visa', MockPayoutController.testTriggerPayout);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Test the server at: http://localhost:${PORT}`);
    console.log(`Test from phone at: http://100.110.184.54:${PORT}`);
});
