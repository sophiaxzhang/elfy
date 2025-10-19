import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Child } from '../types/childTypes';
import { TaskService } from '../services/taskService';
import { UserService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  ChildOverview: { child: Child };
  SelectChild: undefined;
  AddTask: { child: Child };
  ApproveTasks: { child: Child };
  ChildTaskDashboard: { child: Child };
  Start: undefined;
};

type ChildOverviewRouteProp = RouteProp<RootStackParamList, 'ChildOverview'>;
type ChildOverviewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelectChild'>;

interface ChildOverviewProps {
  child: Child;
}

const ChildOverview: React.FC = () => {
  const navigation = useNavigation<ChildOverviewNavigationProp>();
  const route = useRoute<ChildOverviewRouteProp>();
  const auth = useAuth();
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const { user } = auth;

  const [child, setChild] = useState<Child>(route.params.child);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(child.currentGoal);

  useEffect(() => {
    loadChildData();
  }, [child.id]);

  const loadChildData = async () => {
    try {
      setIsLoading(true);
      // Fetch tasks for this child
      const childTasks = await TaskService.getTasksByChild(parseInt(child.id));
      setTasks(childTasks);
      
      // Fetch parent data to get number_of_tokens
      if (!user?.id) return;
      const familyData = await UserService.getFamilyData(user.id);
      const parentTokens = familyData.parent.number_of_tokens || 100;
      
      // Calculate completed tasks and total gems earned
      const completedTasks = childTasks.filter(task => task.status === 3).length; // 3 = completed
      const totalGemsEarned = childTasks
        .filter(task => task.status === 3) // 3 = completed
        .reduce((sum, task) => sum + (task.gems || 0), 0);
      
      // Update child data with real values
      setChild(prev => ({
        ...prev,
        completedTasks,
        totalTasks: childTasks.length,
        totalGemsEarned,
        currentGoal: parentTokens // Use parent's number_of_tokens as goal
      }));
    } catch (error) {
      console.error('Error loading child data:', error);
      Alert.alert('Error', 'Failed to load child data');
    } finally {
      setIsLoading(false);
    }
  };

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
    navigation.navigate('ChildTaskDashboard', { child });
  };

  const ActionButton: React.FC<{ 
    title: string; 
    subtitle: string; 
    icon: string; 
    onPress: () => void;
    color?: string;
  }> = ({ title, subtitle, icon, onPress, color = '#DC2626' }) => (
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{child.name}'s Overview</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading {child.name}'s data...</Text>
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

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Parent Controls</Text>
          
          <ActionButton
            title="Add Tasks"
            subtitle="Create new chores for this child"
            icon="➕"
            onPress={handleAddTask}
            color="#DC2626"
          />
          
          <ActionButton
            title="Approve Tasks"
            subtitle="Review completed tasks"
            icon="✅"
            onPress={handleApproveTasks}
            color="#059669"
          />
          
          <ActionButton
            title="View/Edit Goal"
            subtitle={`Current: ${child.currentGoal} gems`}
            icon="🎯"
            onPress={handleViewEditGoal}
            color="#DC2626"
          />
          
          <ActionButton
            title="View Tasks"
            subtitle="See tasks from child's perspective"
            icon="👶"
            onPress={handleViewChildTasks}
            color="#059669"
          />
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
    borderBottomColor: '#FECACA',
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
    color: '#0F172A',
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
    backgroundColor: '#059669',
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
    color: '#0F172A',
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
    color: '#0F172A',
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
    color: '#0F172A',
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
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
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
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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

export default ChildOverview;
