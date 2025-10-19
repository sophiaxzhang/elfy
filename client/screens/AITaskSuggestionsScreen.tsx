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
import AITaskSuggestions from '../src/components/AITaskSuggestions';
import { TaskSuggestion } from '../src/services/aiTaskSuggestionService';
import { useAuth } from '../context/AuthContext';

const AITaskSuggestionsScreen: React.FC = () => {
  const [childName, setChildName] = useState('Emma');
  const [childAge, setChildAge] = useState('8');
  const [context, setContext] = useState('general');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const auth = useAuth();
  const user = auth?.user;
  
  // Mock child data for demonstration - in real app, this would come from props or state
  const mockChildId = 1; // This would be the actual child ID

  const handleTaskCreated = (task: any) => {
    console.log('Task created successfully:', task);
    // You could navigate back to the dashboard or show a success message
  };

  const handleGenerateSuggestions = () => {
    if (!childName.trim() || !childAge.trim()) {
      Alert.alert('Error', 'Please enter both child name and age');
      return;
    }

    const age = parseInt(childAge);
    if (isNaN(age) || age < 2 || age > 18) {
      Alert.alert('Error', 'Please enter a valid age between 2 and 18');
      return;
    }

    setShowSuggestions(true);
  };

  if (showSuggestions) {
    return (
      <SafeAreaView style={styles.container}>
        <AITaskSuggestions
          childAge={parseInt(childAge)}
          childName={childName}
          childId={mockChildId}
          onTaskCreated={handleTaskCreated}
          context={context}
          enableTaskCreation={!!user} // Enable task creation if user is logged in
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>AI Task Suggestions</Text>
        <Text style={styles.subtitle}>
          Generate personalized task suggestions for your child
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Child's Name</Text>
          <TextInput
            style={styles.input}
            value={childName}
            onChangeText={setChildName}
            placeholder="Enter child's name"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Child's Age</Text>
          <TextInput
            style={styles.input}
            value={childAge}
            onChangeText={setChildAge}
            placeholder="Enter age (2-18)"
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Context (Optional)</Text>
          <TextInput
            style={styles.input}
            value={context}
            onChangeText={setContext}
            placeholder="e.g., weekend, rainy day, before bedtime"
          />
        </View>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateSuggestions}
        >
          <Text style={styles.generateButtonText}>
            🤖 Generate AI Suggestions
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            • AI analyzes your child's age and context{'\n'}
            • Generates age-appropriate task suggestions{'\n'}
            • Includes difficulty levels and reward amounts{'\n'}
            • Considers time of day and context
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
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
