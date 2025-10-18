import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Child } from '../types/childTypes';
import { Task } from '../types/taskTypes';

type RootStackParamList = {
  AddTask: { child: Child };
  ChildOverview: undefined;
  Start: undefined;
};

type AddTaskRouteProp = RouteProp<RootStackParamList, 'AddTask'>;
type AddTaskNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChildOverview'>;

const AddTask: React.FC = () => {
  const navigation = useNavigation<AddTaskNavigationProp>();
  const route = useRoute<AddTaskRouteProp>();
  const { child } = route.params;

  const [formData, setFormData] = useState({
    name: '',
    gems: '',
    room: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (!formData.room.trim()) {
      newErrors.room = 'Room location is required';
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

  const handleCreateTask = () => {
    if (!validateForm()) {
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      gems: Number(formData.gems),
      room: formData.room.trim(),
      status: 'not_started',
      description: formData.description.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Alert.alert(
      'Task Created!',
      `"${newTask.name}" has been added to ${child.name}'s task list.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ChildOverview'),
        },
      ]
    );
  };

  const handleBackPress = () => {
    navigation.navigate('ChildOverview');
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
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        keyboardType={keyboardType}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>← Back</Text>
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
            value={formData.room}
            onChangeText={(text) => handleInputChange('room', text)}
            placeholder="e.g., Bedroom, Kitchen, Living Room"
            error={errors.room}
          />

          <InputField
            label="Description (Optional)"
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder="Additional instructions for the child..."
            multiline={true}
          />
        </View>

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
              🏠 {formData.room || 'Room Location'}
            </Text>
            {formData.description && (
              <Text style={styles.previewDescription}>
                📝 {formData.description}
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateTask}>
          <Text style={styles.createButtonText}>Create Task</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    color: '#3B82F6',
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
    borderLeftColor: '#3B82F6',
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
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddTask;
