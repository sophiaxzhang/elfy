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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Child } from '../types/childTypes';
import { Task, STATUS_TO_INT } from '../types/taskTypes';
import { TaskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import AITaskSuggestions from '../src/components/AITaskSuggestions';

type RootStackParamList = {
  AddTask: { child: Child };
  ChildOverview: { child: Child };
  Start: undefined;
  AITaskSuggestions: undefined;
};

type AddTaskRouteProp = RouteProp<RootStackParamList, 'AddTask'>;
type AddTaskNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChildOverview'>;

const AddTask: React.FC = () => {
  const navigation = useNavigation<AddTaskNavigationProp>();
  const route = useRoute<AddTaskRouteProp>();
  const { child } = route.params;
  const auth = useAuth();
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const { user } = auth;

  const [formData, setFormData] = useState({
    name: '',
    gems: '',
    location: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

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

  const handleCreateTask = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setIsSubmitting(true);

      const taskData = {
        name: formData.name.trim(),
        gems: Number(formData.gems),
        location: formData.location.trim(),
        status: STATUS_TO_INT.not_started, // 0 for not started
        desc: formData.description.trim() || undefined,
        child_id: parseInt(child.id),
        parent_id: user.id,
      };

      console.log('Creating task:', taskData);
      const createdTask = await TaskService.createTask(taskData);
      console.log('Task created successfully:', createdTask);

      Alert.alert(
        'Task Created!',
        `"${taskData.name}" has been added to ${child.name}'s task list.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ChildOverview', { child }),
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

  const handleBackPress = () => {
    navigation.navigate('ChildOverview', { child });
  };

  const handleAITaskCreated = (createdTask: any) => {
    console.log('AI task created:', createdTask);
    setShowAISuggestions(false);
    // Navigate back to child overview to show the new task
    navigation.navigate('ChildOverview', { child });
  };

  const InputField: React.FC<{
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    error?: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric';
  }> = ({ label, value, onChangeText, placeholder, error, multiline = false, keyboardType = 'default' }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error && styles.inputError,
        ]}
        defaultValue={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCorrect={false}
        autoCapitalize="sentences"
        returnKeyType="done"
        blurOnSubmit={true}
        textContentType="none"
        autoComplete="off"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Task for {child.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <InputField
            label="Task Name"
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholder="e.g., Clean bedroom"
            error={errors.name}
          />

          <InputField
            label="Gems Reward"
            value={formData.gems}
            onChangeText={(text) => handleInputChange('gems', text)}
            placeholder="e.g., 5"
            error={errors.gems}
            keyboardType="numeric"
          />

          <InputField
            label="Room Location"
            value={formData.location}
            onChangeText={(text) => handleInputChange('location', text)}
            placeholder="e.g., Bedroom, Kitchen, Living Room"
            error={errors.location}
          />

          <InputField
            label="Description (Optional)"
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder="Additional instructions for the child..."
            multiline={true}
          />

          {/* AI Suggestions Button */}
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => setShowAISuggestions(!showAISuggestions)}
          >
            <Text style={styles.aiButtonText}>
              🤖 {showAISuggestions ? 'Hide' : 'Get'} AI Suggestions
            </Text>
            <Text style={styles.aiButtonSubtext}>
              {showAISuggestions ? 'Tap to hide suggestions' : 'Let AI help you create the perfect task'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Suggestions */}
        {showAISuggestions && (
          <View style={styles.aiSuggestionsContainer}>
            <AITaskSuggestions
              childAge={child.age}
              childName={child.name}
              childId={parseInt(child.id)}
              onTaskCreated={handleAITaskCreated}
              context="general"
              enableTaskCreation={true}
            />
          </View>
        )}

        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Task Preview</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewName}>
              {formData.name || 'Task Name'}
            </Text>
            <Text style={styles.previewGems}>
              💎 {formData.gems || '0'} gems
            </Text>
            <Text style={styles.previewRoom}>
              🏠 {formData.location || 'Room Location'}
            </Text>
            {formData.description && (
              <Text style={styles.previewDescription}>
                📝 {formData.description}
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.createButton, isSubmitting && styles.createButtonDisabled]} 
          onPress={handleCreateTask}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Create Task</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  form: {
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  previewContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  previewGems: {
    fontSize: 16,
    color: '#059669',
    marginBottom: 4,
  },
  previewRoom: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  aiButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  aiButtonSubtext: {
    color: '#E0E7FF',
    fontSize: 12,
    textAlign: 'center',
  },
  aiSuggestionsContainer: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  createButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddTask;
