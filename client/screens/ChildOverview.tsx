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
import ChildProgressBar from './ChildProgressBar';
import { useTaskContext } from '../context/TaskContext';

type RootStackParamList = {
  ChildOverview: { child: Child };
  SelectChild: undefined;
  AddTask: { child: Child };
  ChildTaskDashboard: undefined;
  Start: undefined;
};

type ChildOverviewRouteProp = RouteProp<RootStackParamList, 'ChildOverview'>;
type ChildOverviewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelectChild'>;

interface ChildOverviewProps {
  child: Child;
}

const ChildOverview: React.FC = () => {
  const navigation = useNavigation<ChildOverviewNavigationProp>();
  const { tasks } = useTaskContext();
  const [child] = useState<Child>({
    id: '1',
    name: 'Emma',
    age: 8,
    totalGemsEarned: 12,
    currentGoal: 15,
    completedTasks: 4,
    totalTasks: 7,
  });

  const handleBackPress = () => {
    navigation.navigate('SelectChild');
  };

  const handleAddTask = () => {
    navigation.navigate('AddTask', { child });
  };

  const handleApproveTasks = () => {
    Alert.alert(
      'Approve Tasks',
      'This will show tasks waiting for approval. Feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleViewEditGoal = () => {
    Alert.alert(
      'View/Edit Goal',
      `Current goal: ${child.currentGoal} gems\n\nFeature to edit goal coming soon!`,
      [{ text: 'OK' }]
    );
  };

  const handleViewChildTasks = () => {
    navigation.navigate('ChildTaskDashboard');
  };

  const ActionButton: React.FC<{ 
    title: string; 
    subtitle: string; 
    icon: string; 
    onPress: () => void;
    color?: string;
  }> = ({ title, subtitle, icon, onPress, color = '#3B82F6' }) => (
    <TouchableOpacity style={[styles.actionButton, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.actionContent}>
        <Text style={styles.actionIcon}>{icon}</Text>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.actionArrow}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{child.name}'s Overview</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Child Info */}
        <View style={styles.childInfoCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {child.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.childDetails}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childAge}>Age {child.age}</Text>
            <Text style={styles.childStats}>
              {child.completedTasks} of {child.totalTasks} tasks completed
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <ChildProgressBar 
          tasks={tasks} 
          goalGems={child.currentGoal}
          earnedGems={child.totalGemsEarned}
        />

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Parent Controls</Text>
          
          <ActionButton
            title="Add Tasks"
            subtitle="Create new chores for this child"
            icon="➕"
            onPress={handleAddTask}
            color="#10B981"
          />
          
          <ActionButton
            title="Approve Tasks"
            subtitle="Review completed tasks"
            icon="✅"
            onPress={handleApproveTasks}
            color="#F59E0B"
          />
          
          <ActionButton
            title="View/Edit Goal"
            subtitle={`Current: ${child.currentGoal} gems`}
            icon="🎯"
            onPress={handleViewEditGoal}
            color="#8B5CF6"
          />
          
          <ActionButton
            title="View Child's Tasks"
            subtitle="See tasks from child's perspective"
            icon="👶"
            onPress={handleViewChildTasks}
            color="#3B82F6"
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{child.totalGemsEarned}</Text>
              <Text style={styles.statLabel}>Gems Earned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{child.currentGoal - child.totalGemsEarned}</Text>
              <Text style={styles.statLabel}>Gems to Goal</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{child.completedTasks}</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{child.totalTasks - child.completedTasks}</Text>
              <Text style={styles.statLabel}>Tasks Left</Text>
            </View>
          </View>
        </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  childInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  childAge: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 8,
  },
  childStats: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '500',
  },
  actionsContainer: {
    margin: 16,
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  actionArrow: {
    fontSize: 20,
    color: '#94A3B8',
  },
  statsContainer: {
    margin: 16,
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default ChildOverview;
