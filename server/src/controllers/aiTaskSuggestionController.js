import { AITaskSuggestionService } from '../services/aiTaskSuggestionService.js';

export const AITaskSuggestionController = {
  async getTaskSuggestions(req, res) {
    try {
      console.log("=== AI TASK SUGGESTIONS REQUEST ===");
      console.log("Request body:", req.body);
      
      const { childAge, childName, context = 'general' } = req.body;
      
      if (!childAge || !childName) {
        return res.status(400).json({ 
          success: false, 
          message: "childAge and childName are required" 
        });
      }

      if (childAge < 2 || childAge > 18) {
        return res.status(400).json({ 
          success: false, 
          message: "childAge must be between 2 and 18" 
        });
      }

      const suggestions = await AITaskSuggestionService.generateTaskSuggestions({
        childAge: parseInt(childAge),
        childName: childName.trim(),
        context: context.trim()
      });

      console.log(`Generated ${suggestions.length} task suggestions`);
      
      res.status(200).json({
        success: true,
        suggestions,
        count: suggestions.length
      });

    } catch (error) {
      console.error("AI task suggestions error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate task suggestions",
        error: error.message
      });
    }
  },

  async getContextualSuggestions(req, res) {
    try {
      const { childAge, childName, timeOfDay, weather, mood } = req.body;
      
      if (!childAge || !childName) {
        return res.status(400).json({ 
          success: false, 
          message: "childAge and childName are required" 
        });
      }

      // Build context based on additional parameters
      let context = 'general';
      if (timeOfDay) context += `, ${timeOfDay}`;
      if (weather) context += `, ${weather} weather`;
      if (mood) context += `, child is feeling ${mood}`;

      const suggestions = await AITaskSuggestionService.generateTaskSuggestions({
        childAge: parseInt(childAge),
        childName: childName.trim(),
        context
      });

      res.status(200).json({
        success: true,
        suggestions,
        count: suggestions.length,
        context
      });

    } catch (error) {
      console.error("Contextual AI suggestions error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate contextual suggestions",
        error: error.message
      });
    }
  }
};
