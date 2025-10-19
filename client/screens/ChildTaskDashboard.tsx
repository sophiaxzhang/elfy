import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Task, TaskStatus, TaskColumn, STATUS_MAP } from '../types/taskTypes';
import ChildProgressBar from './ChildProgressBar';
import { TaskService } from '../services/taskService';
import { UserService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { Child } from '../types/childTypes';

type RootStackParamList = {
  ChildTaskDashboard: { child: Child };
  TaskDetail: { task: Task; child: Child };
  Start: undefined;
};

type ChildTaskDashboardRouteProp = RouteProp<RootStackParamList, 'ChildTaskDashboard'>;
type ChildTaskDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Start'>;

interface ChildTaskDashboardProps {
  route: ChildTaskDashboardRouteProp;
}

const ChildTaskDashboard: React.FC<ChildTaskDashboardProps> = ({ route }) => {
  const navigation = useNavigation<ChildTaskDashboardNavigationProp>();
  const { child } = route.params;
  const auth = useAuth();
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const { user } = auth;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [parentTokens, setParentTokens] = useState<number>(100);

  useEffect(() => {
    loadTasks();
    loadParentTokens();
  }, [child.id]);

  const loadParentTokens = async () => {
    try {
      if (!user?.id) return;
      const familyData = await UserService.getFamilyData(user.id);
      setParentTokens(familyData.parent.number_of_tokens || 100);
    } catch (error) {
      console.error('Error loading parent tokens:', error);
    }
  };

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

  const columns: TaskColumn[] = [
    {
      id: 'not_started',
      title: 'Not Started',
      tasks: tasks.filter(task => task.status === 0), // 0 = not_started
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      tasks: tasks.filter(task => task.status === 1), // 1 = in_progress
    },
    {
      id: 'waiting_approval',
      title: 'Waiting for Approval',
      tasks: tasks.filter(task => task.status === 2), // 2 = waiting_approval
    },
    {
      id: 'completed',
      title: 'Completed',
      tasks: tasks.filter(task => task.status === 3), // 3 = completed
    },
  ];

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { 
      task,
      child
    });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const getStatusText = (status: TaskStatus): string => {
    switch (status) {
      case 'not_started':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'waiting_approval':
        return 'Waiting for Approval';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{child.name}'s Tasks</Text>
            <Text style={styles.subtitle}>Loading tasks...</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </View>
    );
  }


  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => handleTaskPress(task)}
    >
      <Text style={styles.taskName}>{task.name}</Text>
      <Text style={styles.taskGems}>💎 {task.gems} gems</Text>
      <Text style={styles.taskRoom}>{task.location}</Text>
    </TouchableOpacity>
  );

  const Column: React.FC<{ column: TaskColumn }> = ({ column }) => (
    <View style={styles.column}>
      <View style={styles.columnHeader}>
        <Text style={styles.columnTitle}>{column.title}</Text>
        <Text style={styles.taskCount}>({column.tasks.length})</Text>
      </View>
      <ScrollView 
        horizontal 
        style={styles.columnContent} 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tasksContainer}
      >
        {column.tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
        {column.tasks.length === 0 && (
          <View style={styles.emptyColumn}>
            <Text style={styles.emptyText}>No tasks</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{child.name}'s Tasks</Text>
          <Text style={styles.subtitle}>Complete your tasks to earn rewards!</Text>
        </View>
      </View>
      
          {/* Progress Bar */}
          <ChildProgressBar 
            tasks={tasks} 
            goalGems={parentTokens} // Use parent's number_of_tokens as goal
            childId={child.id} // Use actual child ID
            parentId={user?.id?.toString() || "1"} // Use actual parent ID
            payoutAmount={10} // Mock payout amount
            onPayoutTriggered={() => {
              // Reset tasks or update UI after payout
              console.log('Payout triggered!');
            }}
          />
      
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {columns.map(column => (
          <Column key={column.id} column={column} />
        ))}
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');
const taskCardWidth = width * 0.4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  column: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  taskCount: {
    fontSize: 14,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  columnContent: {
    paddingVertical: 12,
  },
  tasksContainer: {
    paddingHorizontal: 12,
  },
  taskCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: taskCardWidth,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  taskGems: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
    marginBottom: 2,
  },
  taskRoom: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
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
    color: '#6B7280',
  },
});

export default ChildTaskDashboard;
