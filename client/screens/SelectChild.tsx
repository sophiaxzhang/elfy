import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Child, Parent } from '../types/childTypes';

type RootStackParamList = {
  ChildTaskDashboard: undefined;
  Dashboard: undefined;
  Start: undefined;
};

type SelectChildNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Start'>;

// Mock data - this will come from backend
const mockParent: Parent = {
  id: '1',
  name: 'Sarah Johnson',
  children: [
    {
      id: '1',
      name: 'Emma',
      age: 8,
      totalGemsEarned: 12,
      currentGoal: 15,
      completedTasks: 4,
      totalTasks: 7,
    },
    {
      id: '2',
      name: 'Liam',
      age: 6,
      totalGemsEarned: 8,
      currentGoal: 12,
      completedTasks: 3,
      totalTasks: 5,
    },
    {
      id: '3',
      name: 'Sophia',
      age: 10,
      totalGemsEarned: 18,
      currentGoal: 20,
      completedTasks: 6,
      totalTasks: 8,
    },
  ],
};

const SelectChild: React.FC = () => {
  const navigation = useNavigation<SelectChildNavigationProp>();

  const handleChildSelect = (child: Child) => {
    // Navigate to child's dashboard
    navigation.navigate('ChildTaskDashboard');
  };

  const handleBackToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  const handleBackToStart = () => {
    navigation.navigate('Start');
  };

  const ChildCard: React.FC<{ child: Child }> = ({ child }) => {
    const progressPercentage = Math.round((child.totalGemsEarned / child.currentGoal) * 100);
    
    return (
      <TouchableOpacity
        style={styles.childCard}
        onPress={() => handleChildSelect(child)}
      >
        <View style={styles.childHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {child.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childAge}>Age {child.age}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(progressPercentage, 100)}%` }
              ]} 
            />
          </View>
          
          <Text style={styles.gemsText}>
            💎 {child.totalGemsEarned} / {child.currentGoal} gems
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{child.completedTasks}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{child.totalTasks - child.completedTasks}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>

        <View style={styles.selectButton}>
          <Text style={styles.selectButtonText}>View {child.name}'s Tasks</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToStart}>
          <Text style={styles.backButtonText}>← Back to Start</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Child</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>Hi {mockParent.name}! 👋</Text>
        <Text style={styles.subtitle}>Choose which child's progress you'd like to view</Text>
      </View>

      <ScrollView 
        style={styles.childrenContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.childrenContent}
      >
        {mockParent.children.map(child => (
          <ChildCard key={child.id} child={child} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Tip: Tap on any child to view their task dashboard and progress
        </Text>
      </View>
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
  greetingSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  childrenContainer: {
    flex: 1,
  },
  childrenContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  childCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  childAge: {
    fontSize: 16,
    color: '#64748B',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  gemsText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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

export default SelectChild;
