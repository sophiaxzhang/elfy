import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Task, STATUS_MAP } from '../types/taskTypes';
import { TaskService } from '../services/taskService';
import { Child } from '../types/childTypes';

type RootStackParamList = {
  ChildTaskDashboard: { child: Child };
  TaskDetail: { task: Task; child: Child };
  Start: undefined;
};

type TaskDetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;
type TaskDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChildTaskDashboard'>;

const TaskDetailScreen: React.FC = () => {
  const navigation = useNavigation<TaskDetailNavigationProp>();
  const route = useRoute<TaskDetailRouteProp>();
  const { task, child } = route.params;
  
  const [currentTask, setCurrentTask] = useState<Task>(task);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0: // not_started
        return '#6B7280';
      case 1: // in_progress
        return '#F59E0B';
      case 2: // waiting_approval
        return '#8B5CF6';
      case 3: // completed
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return 'Not Started';
      case 1:
        return 'In Progress';
      case 2:
        return 'Waiting for Approval';
      case 3:
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const updateTaskStatus = async (newStatus: number) => {
    try {
      setIsUpdating(true);
      
      const updatedTask = await TaskService.updateTask(currentTask.id, {
        status: newStatus,
      });
      
      setCurrentTask(updatedTask);
      
      // Navigate back to ChildTaskDashboard
      navigation.navigate('ChildTaskDashboard', { child });
      
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartTask = () => {
    Alert.alert(
      'Start Task',
      'Are you ready to begin this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => updateTaskStatus(1), // 1 = in_progress
        },
      ]
    );
  };

  const handleCompleteTask = () => {
    Alert.alert(
      'Complete Task',
      'Have you finished this task? Make sure to do your best work!',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => updateTaskStatus(2), // 2 = waiting_approval
        },
      ]
    );
  };

  const handleBackPress = () => {
    navigation.navigate('ChildTaskDashboard', { child });
  };

  const getActionButton = () => {
    if (isUpdating) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Updating task...</Text>
        </View>
      );
    }

    switch (currentTask.status) {
      case 0: // not_started
        return (
          <TouchableOpacity style={styles.startButton} onPress={handleStartTask}>
            <Text style={styles.startButtonText}>Start Task</Text>
          </TouchableOpacity>
        );
      case 1: // in_progress
        return (
          <TouchableOpacity style={styles.completeButton} onPress={handleCompleteTask}>
            <Text style={styles.completeButtonText}>Complete Task</Text>
          </TouchableOpacity>
        );
      case 2: // waiting_approval
        return (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>⏳ Waiting for parent approval</Text>
          </View>
        );
      case 3: // completed
        return (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>✅ Task completed!</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskName}>{currentTask.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentTask.status) }]}>
              <Text style={styles.statusText}>{getStatusText(currentTask.status)}</Text>
            </View>
          </View>

          <View style={styles.taskInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>💎 Gems:</Text>
              <Text style={styles.infoValue}>{currentTask.gems} gems</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🏠 Location:</Text>
              <Text style={styles.infoValue}>{currentTask.location}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📅 Created:</Text>
              <Text style={styles.infoValue}>
                {currentTask.createdAt ? new Date(currentTask.createdAt).toLocaleDateString() : 'Unknown'}
              </Text>
            </View>
          </View>

          {currentTask.desc && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>📝 Instructions:</Text>
              <Text style={styles.descriptionText}>{currentTask.desc}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionContainer}>
          {getActionButton()}
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips for Success:</Text>
          <Text style={styles.tipsText}>
            • Take your time and do your best work{'\n'}
            • Ask for help if you need it{'\n'}
            • Clean up after yourself{'\n'}
            • Take before and after photos if possible
          </Text>
        </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  taskInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  actionContainer: {
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  waitingContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  waitingText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  completedContainer: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  completedText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});

export default TaskDetailScreen;
