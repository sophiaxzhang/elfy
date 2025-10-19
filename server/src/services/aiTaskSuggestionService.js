import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const AITaskSuggestionService = {
  async generateTaskSuggestions({ childAge, childName, context = 'general' }) {
    try {
      const prompt = this.buildPrompt(childAge, childName, context);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates age-appropriate task suggestions for children. Always respond with a valid JSON array of task objects."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      
      // Parse the JSON response
      const suggestions = JSON.parse(response);
      
      // Validate and format the suggestions
      return this.formatSuggestions(suggestions);
      
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      // Return fallback suggestions if API fails
      return this.getFallbackSuggestions(childAge);
    }
  },

  buildPrompt(childAge, childName, context) {
    const ageGroup = this.getAgeGroup(childAge);
    
    return `Generate 8-10 age-appropriate task suggestions for a ${childAge}-year-old child named ${childName}. 
    
Context: ${context}

Age Group: ${ageGroup}

Please provide tasks that are:
- Age-appropriate and safe
- Educational or skill-building
- Varied in difficulty and type
- Include both indoor and outdoor options
- Consider the child's developmental stage

For each task, provide:
- name: A clear, engaging task title (max 50 characters)
- description: A brief description of what the child needs to do (max 100 characters)
- gems: Suggested reward amount (1-10 gems based on difficulty)
- location: Where the task should be done (indoor/outdoor/specific room)
- category: The type of task (chore, learning, creative, physical, etc.)

Return ONLY a valid JSON array of task objects. Example format:
[
  {
    "name": "Make Bed",
    "description": "Tidy up your bed and arrange pillows nicely",
    "gems": 2,
    "location": "bedroom",
    "category": "chore"
  }
]`;
  },

  getAgeGroup(age) {
    if (age <= 3) return "Toddler (2-3 years)";
    if (age <= 5) return "Preschooler (4-5 years)";
    if (age <= 8) return "Early Elementary (6-8 years)";
    if (age <= 12) return "Late Elementary (9-12 years)";
    return "Teenager (13+ years)";
  },

  formatSuggestions(suggestions) {
    if (!Array.isArray(suggestions)) {
      throw new Error('Invalid response format from OpenAI');
    }

    return suggestions.map((suggestion, index) => ({
      id: `ai_suggestion_${Date.now()}_${index}`,
      name: suggestion.name || `Task ${index + 1}`,
      description: suggestion.description || '',
      gems: Math.max(1, Math.min(10, suggestion.gems || 2)),
      location: suggestion.location || 'home',
      category: suggestion.category || 'general',
      isAISuggestion: true
    }));
  },

  getFallbackSuggestions(childAge) {
    const ageGroup = this.getAgeGroup(childAge);
    
    const fallbackTasks = {
      "Toddler (2-3 years)": [
        { name: "Put Toys Away", description: "Put all toys back in their boxes", gems: 2, location: "playroom", category: "chore" },
        { name: "Brush Teeth", description: "Brush teeth for 2 minutes", gems: 1, location: "bathroom", category: "hygiene" },
        { name: "Help Set Table", description: "Put napkins and utensils on table", gems: 2, location: "dining room", category: "chore" },
        { name: "Water Plants", description: "Help water the house plants", gems: 2, location: "indoor", category: "nature" },
        { name: "Sort Colors", description: "Sort colored blocks by color", gems: 3, location: "playroom", category: "learning" }
      ],
      "Preschooler (4-5 years)": [
        { name: "Make Bed", description: "Straighten sheets and arrange pillows", gems: 2, location: "bedroom", category: "chore" },
        { name: "Feed Pet", description: "Give food and water to the pet", gems: 3, location: "home", category: "responsibility" },
        { name: "Help with Laundry", description: "Sort clothes by color", gems: 3, location: "laundry room", category: "chore" },
        { name: "Read a Book", description: "Read for 15 minutes", gems: 4, location: "anywhere", category: "learning" },
        { name: "Draw a Picture", description: "Create a drawing for the family", gems: 3, location: "anywhere", category: "creative" }
      ],
      "Early Elementary (6-8 years)": [
        { name: "Vacuum Room", description: "Vacuum your bedroom floor", gems: 4, location: "bedroom", category: "chore" },
        { name: "Practice Math", description: "Complete 10 math problems", gems: 3, location: "anywhere", category: "learning" },
        { name: "Help Cook", description: "Help prepare a simple meal", gems: 5, location: "kitchen", category: "life skills" },
        { name: "Organize Desk", description: "Clean and organize your study area", gems: 3, location: "bedroom", category: "organization" },
        { name: "Write a Story", description: "Write a short story or poem", gems: 4, location: "anywhere", category: "creative" }
      ],
      "Late Elementary (9-12 years)": [
        { name: "Clean Bathroom", description: "Clean the bathroom sink and mirror", gems: 6, location: "bathroom", category: "chore" },
        { name: "Research Project", description: "Research a topic of interest", gems: 5, location: "anywhere", category: "learning" },
        { name: "Garden Work", description: "Help with yard work or gardening", gems: 6, location: "outdoor", category: "nature" },
        { name: "Teach Sibling", description: "Help younger sibling with homework", gems: 7, location: "anywhere", category: "helping" },
        { name: "Plan Activity", description: "Plan a family activity for the weekend", gems: 5, location: "anywhere", category: "planning" }
      ],
      "Teenager (13+ years)": [
        { name: "Deep Clean Room", description: "Thoroughly clean and organize room", gems: 8, location: "bedroom", category: "chore" },
        { name: "Cook Dinner", description: "Plan and cook dinner for the family", gems: 10, location: "kitchen", category: "life skills" },
        { name: "Volunteer Work", description: "Do volunteer work in the community", gems: 10, location: "community", category: "service" },
        { name: "Learn Skill", description: "Learn a new practical skill", gems: 8, location: "anywhere", category: "learning" },
        { name: "Budget Planning", description: "Help create a family budget", gems: 9, location: "anywhere", category: "life skills" }
      ]
    };

    const tasks = fallbackTasks[ageGroup] || fallbackTasks["Early Elementary (6-8 years)"];
    
    return tasks.map((task, index) => ({
      id: `fallback_suggestion_${Date.now()}_${index}`,
      name: task.name,
      description: task.description,
      gems: task.gems,
      location: task.location,
      category: task.category,
      isAISuggestion: false
    }));
  }
};
