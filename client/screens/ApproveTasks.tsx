import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Child } from '../types/childTypes';
import { Task } from '../types/taskTypes';
import { useTaskContext } from '../context/TaskContext';

type RootStackParamList = {
  ApproveTasks: { child: Child };
  ChildOverview: undefined;
  Start: undefined;
};

type ApproveTasksRouteProp = RouteProp<RootStackParamList, 'ApproveTasks'>;
type ApproveTasksNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChildOverview'>;

const ApproveTasks: React.FC = () => {
  const navigation = useNavigation<ApproveTasksNavigationProp>();
  const route = useRoute<ApproveTasksRouteProp>();
  const { child } = route.params;
  const { tasks, updateTask } = useTaskContext();

  // Get tasks waiting for approval for this child
  const pendingTasks = tasks.filter(task => task.status === 'waiting_approval');

  const handleBackPress = () => {
    navigation.navigate('ChildOverview');
  };

  const handleApproveTask = (task: Task) => {
    Alert.alert(
      'Approve Task',
      `Are you sure you want to approve "${task.name}"? This will mark it as completed and award ${task.gems} gems to ${child.name}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            const updatedTask = {
              ...task,
              status: 'completed' as const,
              updatedAt: new Date().toISOString(),
            };
            updateTask(updatedTask);
            
            Alert.alert(
              'Task Approved!',
              `${child.name} has earned ${task.gems} gems for completing "${task.name}"!`,
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleRejectTask = (task: Task) => {
    Alert.alert(
      'Reject Task',
      `Are you sure you want to reject "${task.name}"? This will move it back to "In Progress" status.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            const updatedTask = {
              ...task,
              status: 'in_progress' as const,
              updatedAt: new Date().toISOString(),
            };
            updateTask(updatedTask);
            
            Alert.alert(
              'Task Rejected',
              `"${task.name}" has been moved back to "In Progress" for ${child.name}.`,
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskName}>{task.name}</Text>
        <Text style={styles.taskGems}>💎 {task.gems} gems</Text>
      </View>
      
      <View style={styles.taskDetails}>
        <Text style={styles.taskRoom}>🏠 {task.location}</Text>
        {task.desc && (
          <Text style={styles.taskDescription}>📝 {task.desc}</Text>
        )}
        <Text style={styles.taskDate}>
          Submitted: {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Unknown'}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRejectTask(task)}
        >
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => handleApproveTask(task)}
        >
          <Text style={styles.approveButtonText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Approve Tasks</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.childInfo}>
        <Text style={styles.childName}>{child.name}'s Tasks</Text>
        <Text style={styles.taskCount}>
          {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''} waiting for approval
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {pendingTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>No Tasks to Approve</Text>
            <Text style={styles.emptySubtitle}>
              {child.name} doesn't have any tasks waiting for approval right now.
            </Text>
          </View>
        ) : (
          pendingTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </ScrollView>

      {pendingTasks.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Tap "Approve" to mark tasks as completed and award gems
          </Text>
        </View>
      )}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  placeholder: {
    width: 60,
  },
  childInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  taskCount: {
    fontSize: 14,
    color: '#64748B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  taskName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  taskGems: {
    fontSize: 16,
    fontWeight: '500',
    color: '#059669',
  },
  taskDetails: {
    marginBottom: 16,
  },
  taskRoom: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  taskDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rejectButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ApproveTasks;
