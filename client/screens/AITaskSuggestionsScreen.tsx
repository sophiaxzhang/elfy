import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AITaskSuggestions from '../src/components/AITaskSuggestions';
import { TaskSuggestion } from '../src/services/aiTaskSuggestionService';
import { useAuth } from '../context/AuthContext';
import { Child } from '../types/childTypes';

type RootStackParamList = {
  AITaskSuggestions: { child: Child };
};

type AITaskSuggestionsRouteProp = RouteProp<RootStackParamList, 'AITaskSuggestions'>;
type AITaskSuggestionsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AITaskSuggestions'>;

const AITaskSuggestionsScreen: React.FC = () => {
  const route = useRoute<AITaskSuggestionsRouteProp>();
  const { child } = route.params;
  
  const [showSuggestions, setShowSuggestions] = useState(true); // Start with suggestions shown
  
  const auth = useAuth();
  const user = auth?.user;

  const handleTaskCreated = (task: any) => {
    console.log('Task created successfully:', task);
    Alert.alert(
      'Task Added! 🎉',
      `"${task.name}" has been added to ${child.name}'s task list.`,
      [{ text: 'OK' }]
    );
  };

  if (showSuggestions) {
    return (
      <SafeAreaView style={styles.container}>
        <AITaskSuggestions
          childAge={child.age}
          childName={child.name}
          childId={parseInt(child.id)}
          onTaskCreated={handleTaskCreated}
          context="general"
          enableTaskCreation={!!user} // Enable task creation if user is logged in
        />
      </SafeAreaView>
    );
  }

  // This should not be reached since we start with showSuggestions = true
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
});

export default AITaskSuggestionsScreen;
