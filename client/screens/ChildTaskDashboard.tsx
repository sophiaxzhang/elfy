import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Task, TaskStatus, TaskColumn } from '../types/taskTypes';
import ChildProgressBar from './ChildProgressBar';
import { useTaskContext } from '../context/TaskContext';

type RootStackParamList = {
  TaskDetail: { task: Task };
  Start: undefined;
};

type ChildTaskDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Start'>;

// Mock data - this will be replaced with real data from your backend
const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Clean Bedroom',
    gems: 5,
    location: 'Bedroom',
    status: 'not_started',
    desc: 'Make bed, organize desk, vacuum floor',
    child_id: 1,
    parent_id: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Wash Dishes',
    gems: 3,
    location: 'Kitchen',
    status: 'in_progress',
    desc: 'Wash all dishes in sink and put away',
    child_id: 1,
    parent_id: 1,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T11:30:00Z',
  },
  {
    id: '3',
    name: 'Take Out Trash',
    gems: 2,
    location: 'Kitchen',
    status: 'waiting_approval',
    desc: 'Take all trash bags to outside bins',
    child_id: 1,
    parent_id: 1,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    id: '4',
    name: 'Vacuum Living Room',
    gems: 4,
    location: 'Living Room',
    status: 'completed',
    desc: 'Vacuum entire living room area',
    child_id: 1,
    parent_id: 1,
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
  },
  {
    id: '5',
    name: 'Organize Bookshelf',
    gems: 3,
    location: 'Study',
    status: 'completed',
    desc: 'Sort books by genre and alphabetically',
    child_id: 1,
    parent_id: 1,
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T12:00:00Z',
  },
  {
    id: '6',
    name: 'Water Plants',
    gems: 2,
    location: 'Living Room',
    status: 'not_started',
    desc: 'Water all indoor plants and check soil moisture',
    child_id: 1,
    parent_id: 1,
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
  },
  {
    id: '7',
    name: 'Fold Laundry',
    gems: 4,
    location: 'Bedroom',
    status: 'not_started',
    desc: 'Fold and put away clean clothes',
    child_id: 1,
    parent_id: 1,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
];

const ChildTaskDashboard: React.FC = () => {
  const navigation = useNavigation<ChildTaskDashboardNavigationProp>();
  const { tasks, setTasks } = useTaskContext();

  // Initialize tasks if empty
  React.useEffect(() => {
    if (tasks.length === 0) {
      setTasks(mockTasks);
    }
  }, [tasks.length, setTasks]);

  const columns: TaskColumn[] = [
    {
      id: 'not_started',
      title: 'Not Started',
      tasks: tasks.filter(task => task.status === 'not_started'),
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      tasks: tasks.filter(task => task.status === 'in_progress'),
    },
    {
      id: 'waiting_approval',
      title: 'Waiting for Approval',
      tasks: tasks.filter(task => task.status === 'waiting_approval'),
    },
    {
      id: 'completed',
      title: 'Completed',
      tasks: tasks.filter(task => task.status === 'completed'),
    },
  ];

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { 
      task
    });
  };

  const handleBackPress = () => {
    navigation.navigate('Start');
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
          <Text style={styles.title}>My Chores</Text>
          <Text style={styles.subtitle}>Complete your tasks to earn rewards!</Text>
        </View>
      </View>
      
          {/* Progress Bar */}
          <ChildProgressBar 
            tasks={tasks} 
            goalGems={15} // Mock goal gems - this will come from backend
            childId="child-1" // Mock child ID
            parentId="parent-1" // Mock parent ID
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
    backgroundColor: '#F8FAFC',
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
    borderLeftColor: '#3B82F6',
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
});

export default ChildTaskDashboard;
