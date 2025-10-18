import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
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
  ApproveTasks: { child: Child };
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
  const [child, setChild] = useState<Child>({
    id: '1',
    name: 'Emma',
    age: 8,
    totalGemsEarned: 12,
    currentGoal: 15,
    completedTasks: 4,
    totalTasks: 7,
  });
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(child.currentGoal);

  const handleBackPress = () => {
    navigation.navigate('SelectChild');
  };

  const handleAddTask = () => {
    navigation.navigate('AddTask', { child });
  };

  const handleApproveTasks = () => {
    navigation.navigate('ApproveTasks', { child });
  };

  const handleViewEditGoal = () => {
    setShowGoalModal(true);
  };

  const handleSaveGoal = () => {
    setChild(prev => ({ ...prev, currentGoal: selectedGoal }));
    setShowGoalModal(false);
    Alert.alert(
      'Goal Updated!',
      `${child.name}'s goal has been updated to ${selectedGoal} gems.`,
      [{ text: 'OK' }]
    );
  };

  const handleCancelGoal = () => {
    setSelectedGoal(child.currentGoal);
    setShowGoalModal(false);
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

      {/* Goal Edit Modal */}
      <Modal
        visible={showGoalModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelGoal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {child.name}'s Goal</Text>
            <Text style={styles.modalSubtitle}>Set the number of gems needed to reach the goal</Text>
            
            <View style={styles.goalSelector}>
              <Text style={styles.goalLabel}>Goal Gems:</Text>
              <View style={styles.goalButtons}>
                {[5, 10, 15, 20, 25, 30].map(goal => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.goalButton,
                      selectedGoal === goal && styles.goalButtonSelected
                    ]}
                    onPress={() => setSelectedGoal(goal)}
                  >
                    <Text style={[
                      styles.goalButtonText,
                      selectedGoal === goal && styles.goalButtonTextSelected
                    ]}>
                      {goal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelGoal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveGoal}>
                <Text style={styles.saveButtonText}>Save Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  goalSelector: {
    marginBottom: 24,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  goalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 60,
    alignItems: 'center',
  },
  goalButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  goalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  goalButtonTextSelected: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ChildOverview;
