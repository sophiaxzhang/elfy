import { Router } from "express";
import { AITaskSuggestionController } from "../controllers/aiTaskSuggestionController.js";
import { verifyToken } from "../middlewares/validationMiddleware.js";

const router = Router();

// All AI routes require authentication
router.use(verifyToken);

// Get AI-generated task suggestions
router.post('/suggestions', AITaskSuggestionController.getTaskSuggestions);

// Get contextual task suggestions (with additional context like time, weather, mood)
router.post('/suggestions/contextual', AITaskSuggestionController.getContextualSuggestions);

export default router;
