import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Child } from '../types/childTypes';
import { Task, STATUS_MAP, STATUS_TO_INT } from '../types/taskTypes';
import { TaskService } from '../services/taskService';
import { UserService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  ApproveTasks: { child: Child };
  ChildOverview: { child: Child };
  Dashboard: undefined;
  Start: undefined;
};

type ApproveTasksRouteProp = RouteProp<RootStackParamList, 'ApproveTasks'>;
type ApproveTasksNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChildOverview'>;

const ApproveTasks: React.FC = () => {
  const navigation = useNavigation<ApproveTasksNavigationProp>();
  const route = useRoute<ApproveTasksRouteProp>();
  const { child } = route.params;
  const auth = useAuth();
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const { user } = auth;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingTaskId, setApprovingTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [child.id]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const childTasks = await TaskService.getTasksByChild(parseInt(child.id));
      setTasks(childTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  // Get tasks waiting for approval (status = 2)
  const pendingTasks = tasks.filter(task => task.status === STATUS_TO_INT.waiting_approval);

  const handleBackPress = () => {
    navigation.navigate('ChildOverview', { child });
  };

  const handleDashboardPress = () => {
    navigation.navigate('Dashboard');
  };

  const handleApproveTask = async (task: Task) => {
    Alert.alert(
      'Approve Task',
      `Are you sure you want to approve "${task.name}"? This will mark it as completed and award ${task.gems} gems to ${child.name}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setApprovingTaskId(task.id);
              
              const updatedTask = await TaskService.updateTask(task.id, {
                status: STATUS_TO_INT.completed, // 3 for completed
              });
              
              // Update child gems in the database
              await UserService.updateChildGems(parseInt(child.id), task.gems);
              
              // Update local state
              setTasks(prev => prev.map(t => 
                t.id === task.id ? { ...t, status: STATUS_TO_INT.completed } : t
              ));
              
              Alert.alert(
                'Task Approved!',
                `${child.name} has earned ${task.gems} gems for completing "${task.name}"!`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error approving task:', error);
              Alert.alert('Error', 'Failed to approve task. Please try again.');
            } finally {
              setApprovingTaskId(null);
            }
          },
        },
      ]
    );
  };

  const handleRejectTask = async (task: Task) => {
    Alert.alert(
      'Reject Task',
      `Are you sure you want to reject "${task.name}"? This will move it back to "In Progress" status.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setApprovingTaskId(task.id);
              
              const updatedTask = await TaskService.updateTask(task.id, {
                status: STATUS_TO_INT.in_progress, // 1 for in progress
              });
              
              // Update local state
              setTasks(prev => prev.map(t => 
                t.id === task.id ? { ...t, status: STATUS_TO_INT.in_progress } : t
              ));
              
              Alert.alert(
                'Task Rejected',
                `"${task.name}" has been moved back to "In Progress" for ${child.name}.`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error rejecting task:', error);
              Alert.alert('Error', 'Failed to reject task. Please try again.');
            } finally {
              setApprovingTaskId(null);
            }
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Approve Tasks</Text>
          <TouchableOpacity style={styles.dashboardButton} onPress={handleDashboardPress}>
            <Text style={styles.dashboardButtonText}>🏠 Dashboard</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Approve Tasks</Text>
        <TouchableOpacity style={styles.dashboardButton} onPress={handleDashboardPress}>
          <Text style={styles.dashboardButtonText}>🏠 Dashboard</Text>
        </TouchableOpacity>
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
  dashboardButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  dashboardButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#DC2626',
  },
});

export default ApproveTasks;
