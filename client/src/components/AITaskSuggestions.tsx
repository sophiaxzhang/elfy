import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../config/api';
import { AITaskSuggestionService } from '../services/aiTaskSuggestionService';
import { TaskService, CreateTaskRequest } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';

interface TaskSuggestion {
  id: string;
  name: string;
  description: string;
  gems: number;
  location: string;
  category: string;
  isAISuggestion: boolean;
}

interface AITaskSuggestionsProps {
  childAge: number;
  childName: string;
  childId?: number; // Add child ID for task creation
  onSuggestionSelect?: (suggestion: TaskSuggestion) => void; // Make optional
  onTaskCreated?: (task: any) => void; // Callback for when task is created
  context?: string;
  timeOfDay?: string;
  weather?: string;
  mood?: string;
  enableTaskCreation?: boolean; // Flag to enable/disable task creation
}

const AITaskSuggestions: React.FC<AITaskSuggestionsProps> = ({
  childAge,
  childName,
  childId,
  onSuggestionSelect,
  onTaskCreated,
  context = 'general',
  timeOfDay,
  weather,
  mood,
  enableTaskCreation = false,
}) => {
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [creatingTask, setCreatingTask] = useState<string | null>(null); // Track which task is being created
  
  const auth = useAuth();
  const user = auth?.user;
  const navigation = useNavigation();

  useEffect(() => {
    loadSuggestions();
  }, [childAge, childName, context]);

  const getFallbackSuggestions = (age: number) => {
    const ageGroup = getAgeGroup(age);
    
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
  };

  const getAgeGroup = (age: number) => {
    if (age <= 3) return "Toddler (2-3 years)";
    if (age <= 5) return "Preschooler (4-5 years)";
    if (age <= 8) return "Early Elementary (6-8 years)";
    if (age <= 12) return "Late Elementary (9-12 years)";
    return "Teenager (13+ years)";
  };

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestBody: any = {
        childAge,
        childName,
        context,
      };

      // Add contextual information if provided
      if (timeOfDay) requestBody.timeOfDay = timeOfDay;
      if (weather) requestBody.weather = weather;
      if (mood) requestBody.mood = mood;

      // Use the service instead of direct fetch
      const data = timeOfDay || weather || mood 
        ? await AITaskSuggestionService.getContextualSuggestions(requestBody)
        : await AITaskSuggestionService.getTaskSuggestions(requestBody);

      setSuggestions(data.suggestions || []);
      setUsingFallback(false);
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
      console.log('🔄 Using fallback suggestions due to network error');
      
      // Use fallback suggestions when network fails
      const fallbackSuggestions = getFallbackSuggestions(childAge);
      setSuggestions(fallbackSuggestions);
      setUsingFallback(true);
      
      // Don't show error message, just use fallbacks silently
      // setError('Failed to load suggestions. Please make sure you are logged in and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = async (suggestion: TaskSuggestion) => {
    // If task creation is enabled and we have the required data
    if (enableTaskCreation && childId && user?.id) {
      await createTaskFromSuggestion(suggestion);
    } else if (onSuggestionSelect) {
      // Fallback to the original callback
      onSuggestionSelect(suggestion);
    } else {
      // Show alert if neither task creation nor callback is available
      Alert.alert(
        'Suggestion Selected',
        `"${suggestion.name}" - ${suggestion.description}`,
        [{ text: 'OK' }]
      );
    }
  };

  const createTaskFromSuggestion = async (suggestion: TaskSuggestion) => {
    if (!childId || !user?.id) {
      Alert.alert('Error', 'Missing required information to create task');
      return;
    }

    try {
      setCreatingTask(suggestion.id);

      const taskData: CreateTaskRequest = {
        name: suggestion.name,
        gems: suggestion.gems,
        location: suggestion.location,
        desc: suggestion.description,
        child_id: childId,
        parent_id: user.id,
      };

      console.log('Creating task from AI suggestion:', taskData);
      const createdTask = await TaskService.createTask(taskData);
      console.log('Task created successfully:', createdTask);

      Alert.alert(
        'Task Added! 🎉',
        `"${suggestion.name}" has been added to ${childName}'s task list.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onTaskCreated?.(createdTask);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating task from suggestion:', error);
      Alert.alert(
        'Error',
        'Failed to add task. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setCreatingTask(null);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      chore: '#FF6B6B',
      learning: '#4ECDC4',
      creative: '#45B7D1',
      physical: '#96CEB4',
      responsibility: '#FFEAA7',
      nature: '#DDA0DD',
      helping: '#98D8C8',
      planning: '#F7DC6F',
      service: '#BB8FCE',
      'life skills': '#85C1E9',
      hygiene: '#F8C471',
      organization: '#82E0AA',
      general: '#A9A9A9',
    };
    return colors[category.toLowerCase()] || colors.general;
  };

  const getLocationIcon = (location: string) => {
    const icons: { [key: string]: string } = {
      bedroom: '🛏️',
      bathroom: '🚿',
      kitchen: '🍳',
      living: '🛋️',
      playroom: '🧸',
      outdoor: '🌳',
      anywhere: '📍',
      home: '🏠',
      community: '🏘️',
    };
    return icons[location.toLowerCase()] || '📍';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={styles.loadingText}>Generating AI suggestions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSuggestions}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No suggestions available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSuggestions}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={loadSuggestions}>
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>AI Task Suggestions</Text>
        <Text style={styles.subtitle}>
          Perfect for {childName} (age {childAge})
        </Text>
        {usingFallback && (
          <Text style={styles.fallbackText}>
            📱 Using offline suggestions
          </Text>
        )}
      </View>

      <ScrollView 
        style={styles.suggestionsList}
        showsVerticalScrollIndicator={false}
      >
        {suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={[
              styles.suggestionCard,
              creatingTask === suggestion.id && styles.suggestionCardCreating
            ]}
            onPress={() => handleSuggestionPress(suggestion)}
            disabled={creatingTask === suggestion.id}
          >
            <View style={styles.suggestionHeader}>
              <Text style={styles.suggestionName}>{suggestion.name}</Text>
              <View style={styles.gemsContainer}>
                {creatingTask === suggestion.id ? (
                  <ActivityIndicator size="small" color="#856404" />
                ) : (
                  <Text style={styles.gemsText}>💎 {suggestion.gems}</Text>
                )}
              </View>
            </View>
            
            <Text style={styles.suggestionDescription}>
              {suggestion.description}
            </Text>
            
            <View style={styles.suggestionFooter}>
              <View style={styles.categoryContainer}>
                <View 
                  style={[
                    styles.categoryBadge, 
                    { backgroundColor: getCategoryColor(suggestion.category) }
                  ]}
                >
                  <Text style={styles.categoryText}>
                    {suggestion.category}
                  </Text>
                </View>
              </View>
              
              <View style={styles.locationContainer}>
                <Text style={styles.locationText}>
                  {getLocationIcon(suggestion.location)} {suggestion.location}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Snow Mist
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#C5F4E0', // Arctic Mint
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB', // Snow Mist
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C5F4E0', // Arctic Mint
  },
  backButtonText: {
    fontSize: 14,
    color: '#A23E48', // Mulled Wine
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B', // Midnight Slate
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#1E293B', // Midnight Slate
    marginBottom: 12,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#C5F4E0', // Arctic Mint
    borderRadius: 16,
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#1E293B', // Midnight Slate
    fontWeight: '600',
  },
  fallbackText: {
    fontSize: 12,
    color: '#1E293B', // Midnight Slate
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
  },
  suggestionsList: {
    flex: 1,
    padding: 16,
  },
  suggestionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#A23E48', // Mulled Wine
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionCardCreating: {
    opacity: 0.7,
    backgroundColor: '#F9FAFB', // Snow Mist
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B', // Midnight Slate
    flex: 1,
    marginRight: 8,
  },
  gemsContainer: {
    backgroundColor: '#D4AF37', // Winter Gold
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gemsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#1E293B', // Midnight Slate
    marginBottom: 12,
    lineHeight: 20,
  },
  suggestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  locationContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  locationText: {
    fontSize: 12,
    color: '#1E293B', // Midnight Slate
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1E293B', // Midnight Slate
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#C45C65', // Lighter Mulled Wine
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#1E293B', // Midnight Slate
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2E8B57', // Evergreen Velvet
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AITaskSuggestions;
