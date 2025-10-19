import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Child } from '../../types/childTypes';
import { Task, STATUS_TO_INT } from '../../types/taskTypes';
import { TaskService } from '../../services/taskService';
import AITaskSuggestionsButton from './AITaskSuggestionsButton';
import { TaskSuggestion } from '../services/aiTaskSuggestionService';

interface AddTaskWithAIProps {
  child: Child;
  userId: number;
  onTaskCreated?: (task: Task) => void;
  onCancel?: () => void;
}

const AddTaskWithAI: React.FC<AddTaskWithAIProps> = ({
  child,
  userId,
  onTaskCreated,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    gems: '',
    location: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }

    if (!formData.gems.trim()) {
      newErrors.gems = 'Gems amount is required';
    } else if (isNaN(Number(formData.gems)) || Number(formData.gems) <= 0) {
      newErrors.gems = 'Please enter a valid number of gems';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Room location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAISuggestionSelect = (suggestion: TaskSuggestion) => {
    setFormData({
      name: suggestion.name,
      gems: suggestion.gems.toString(),
      location: suggestion.location,
      description: suggestion.description,
    });
    
    // Clear any existing errors
    setErrors({});
    
    Alert.alert(
      'Suggestion Applied!',
      `AI suggestion applied to the form. You can modify it before creating the task.`,
      [{ text: 'OK' }]
    );
  };

  const handleCreateTask = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const taskData = {
        name: formData.name.trim(),
        gems: Number(formData.gems),
        location: formData.location.trim(),
        status: STATUS_TO_INT.not_started,
        desc: formData.description.trim() || undefined,
        child_id: parseInt(child.id),
        parent_id: userId,
      };

      console.log('Creating task:', taskData);
      const createdTask = await TaskService.createTask(taskData);
      
      Alert.alert(
        'Success!',
        'Task created successfully',
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
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Task</Text>
      <Text style={styles.subtitle}>For {child.name}</Text>

      {/* AI Suggestions Button */}
      <AITaskSuggestionsButton
        childAge={child.age || 8} // Assuming child has an age property
        childName={child.name}
        onSuggestionSelect={handleAISuggestionSelect}
        style={styles.aiButton}
      />

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Task Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Enter task name"
            autoCapitalize="words"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gems Reward *</Text>
          <TextInput
            style={[styles.input, errors.gems && styles.inputError]}
            value={formData.gems}
            onChangeText={(value) => handleInputChange('gems', value)}
            placeholder="Enter number of gems"
            keyboardType="numeric"
          />
          {errors.gems && <Text style={styles.errorText}>{errors.gems}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={[styles.input, errors.location && styles.inputError]}
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
            placeholder="e.g., bedroom, kitchen, living room"
            autoCapitalize="words"
          />
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Enter task description"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.createButton, isSubmitting && styles.disabledButton]}
            onPress={handleCreateTask}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.createButtonText}>Create Task</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  aiButton: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#28a745',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
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
  textArea: {
    height: 80,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddTaskWithAI;
