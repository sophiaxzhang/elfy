import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Child, Parent } from '../types/childTypes';
import { UserService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { TaskService } from '../services/taskService';

type RootStackParamList = {
  ChildOverview: { child: Child };
  ChildTaskDashboard: { child: Child };
  Dashboard: undefined;
  Start: undefined;
};

type SelectChildNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChildOverview'>;

const SelectChild: React.FC = () => {
  const navigation = useNavigation<SelectChildNavigationProp>();
  const auth = useAuth();
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const { user } = auth;

  const [parent, setParent] = useState<Parent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const familyData = await UserService.getFamilyData(user.id);
      
      // Transform backend data to match our Child interface
      const children: Child[] = familyData.children.map((child: any) => ({
        id: child.id.toString(),
        name: child.name,
        age: child.age || 8, // Default age if not provided
        totalGemsEarned: child.gem || 0,
        currentGoal: familyData.parent.number_of_tokens || 100, // Use parent's number_of_tokens as goal
        completedTasks: 0, // Default, you might want to fetch this from database
        totalTasks: 0 // Default, you might want to fetch this from database
      }));

      const parentData: Parent = {
        id: familyData.parent.id.toString(),
        name: familyData.parent.name,
        children: children
      };

      setParent(parentData);
    } catch (error) {
      console.error('Error loading family data:', error);
      Alert.alert('Error', 'Failed to load family data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChildSelect = (child: Child) => {
    // Navigate to child's overview
    navigation.navigate('ChildOverview', { child });
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToDashboard}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Child</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading children...</Text>
        </View>
      </View>
    );
  }

  if (!parent) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToDashboard}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Child</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No family data found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToDashboard}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Child</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>Hi {parent.name}! 👋</Text>
        <Text style={styles.subtitle}>Choose which child's progress you'd like to view</Text>
      </View>

      <ScrollView 
        style={styles.childrenContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.childrenContent}
      >
        {parent.children.map(child => (
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
    backgroundColor: '#DC2626',
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
    color: '#DC2626',
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
    backgroundColor: '#DC2626',
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
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});

export default SelectChild;
