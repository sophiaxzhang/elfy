# AI Task Suggestions Integration

This guide explains how to set up and use the AI-powered task suggestions feature.

## Setup

### 1. Server Setup

1. **Install OpenAI package** (already done):
   ```bash
   cd server
   npm install openai
   ```

2. **Set up environment variables**:
   Create a `.env` file in the `server` directory with:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Get OpenAI API Key**:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Add it to your `.env` file

### 2. API Endpoints

The following endpoints are available:

- `POST /api/ai/suggestions` - Get basic AI task suggestions
- `POST /api/ai/suggestions/contextual` - Get contextual suggestions

### 3. Request Format

**Basic Suggestions:**
```json
{
  "childAge": 8,
  "childName": "Emma",
  "context": "general"
}
```

**Contextual Suggestions:**
```json
{
  "childAge": 8,
  "childName": "Emma",
  "context": "weekend",
  "timeOfDay": "morning",
  "weather": "sunny",
  "mood": "energetic"
}
```

### 4. Response Format

```json
{
  "success": true,
  "suggestions": [
    {
      "id": "ai_suggestion_1234567890_0",
      "name": "Make Bed",
      "description": "Straighten sheets and arrange pillows",
      "gems": 2,
      "location": "bedroom",
      "category": "chore",
      "isAISuggestion": true
    }
  ],
  "count": 8
}
```

## Frontend Usage

### 1. Basic Component Usage

```tsx
import AITaskSuggestions from '../src/components/AITaskSuggestions';

<AITaskSuggestions
  childAge={8}
  childName="Emma"
  onSuggestionSelect={(suggestion) => {
    // Handle suggestion selection
    console.log('Selected:', suggestion);
  }}
/>
```

### 2. Button Integration

```tsx
import AITaskSuggestionsButton from '../src/components/AITaskSuggestionsButton';

<AITaskSuggestionsButton
  childAge={child.age}
  childName={child.name}
  onSuggestionSelect={(suggestion) => {
    // Fill form with suggestion data
    setFormData({
      name: suggestion.name,
      gems: suggestion.gems.toString(),
      location: suggestion.location,
      description: suggestion.description,
    });
  }}
/>
```

### 3. Service Usage

```tsx
import { AITaskSuggestionService } from '../src/services/aiTaskSuggestionService';

const suggestions = await AITaskSuggestionService.getTaskSuggestions({
  childAge: 8,
  childName: "Emma",
  context: "weekend"
});
```

## Features

### 1. Age-Appropriate Suggestions
- Toddler (2-3 years): Simple tasks like putting toys away
- Preschooler (4-5 years): Basic chores and learning activities
- Early Elementary (6-8 years): More complex tasks with skill building
- Late Elementary (9-12 years): Advanced chores and responsibilities
- Teenager (13+ years): Life skills and community service

### 2. Contextual Intelligence
- Time of day awareness (morning, afternoon, evening, night)
- Weather considerations (indoor/outdoor tasks)
- Mood-based suggestions (energetic, calm, focused, etc.)
- Custom context (weekend, school day, vacation, etc.)

### 3. Smart Categorization
- **Chore**: Cleaning, organizing, maintenance
- **Learning**: Educational activities, reading, research
- **Creative**: Art, music, writing, crafts
- **Physical**: Exercise, sports, outdoor activities
- **Responsibility**: Pet care, helping others
- **Life Skills**: Cooking, budgeting, planning

### 4. Fallback System
If the OpenAI API is unavailable, the system automatically falls back to pre-defined suggestions based on the child's age group.

## Testing

### 1. Test the API directly:
```bash
curl -X POST http://localhost:3000/api/ai/suggestions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"childAge": 8, "childName": "Emma", "context": "general"}'
```

### 2. Test the frontend:
- Use the `AITaskSuggestionsScreen` for testing
- Or integrate the `AITaskSuggestionsButton` into your existing screens

## Cost Considerations

- OpenAI API calls cost approximately $0.002 per request
- Each suggestion request generates 8-10 task suggestions
- Consider implementing caching to reduce API calls
- Fallback suggestions are free and always available

## Customization

### 1. Modify the AI prompt:
Edit `server/src/services/aiTaskSuggestionService.js` to change how suggestions are generated.

### 2. Add new categories:
Update the `getCategoryColor` function in `AITaskSuggestions.tsx`.

### 3. Adjust fallback suggestions:
Modify the `getFallbackSuggestions` function in the service.

## Troubleshooting

### 1. API Key Issues
- Ensure your OpenAI API key is valid
- Check that the key has sufficient credits
- Verify the key is properly set in the `.env` file

### 2. Network Issues
- Check that the server is running
- Verify the API endpoints are accessible
- Check console logs for error messages

### 3. Suggestion Quality
- Try different contexts (weekend, morning, etc.)
- Adjust the temperature parameter in the OpenAI call
- Modify the prompt for better results

## Security Notes

- All API calls require authentication
- Sensitive data (child names, ages) is only used for generating suggestions
- No personal data is stored by OpenAI
- Consider rate limiting for production use
