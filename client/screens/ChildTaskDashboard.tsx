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
  Modal,
  Linking,
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
  Dashboard: undefined;
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
  const [earnedGemsOverride, setEarnedGemsOverride] = useState<number | undefined>(undefined);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [giftCardModalVisible, setGiftCardModalVisible] = useState(false);

  useEffect(() => {
    loadTasks();
    loadParentTokens();
    
    // Initialize with some mock gift cards
    const initialGiftCards = [
      {
        id: '1',
        code: 'AMAZON-ABC12345',
        amount: 10,
        brand: 'Amazon',
        claimUrl: 'https://www.amazon.com/gift-cards',
        date: '2024-01-15'
      }
    ];
    setGiftCards(initialGiftCards);
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
    navigation.navigate('Dashboard');
  };

  const handleGiftCardPress = () => {
    // Show current gift cards (including any added from payouts)
    setGiftCardModalVisible(true);
  };

  const handleGiftCardRedeem = async (giftCard: any) => {
    if (giftCard.claimUrl) {
      try {
        await Linking.openURL(giftCard.claimUrl);
      } catch (error) {
        Alert.alert('Error', 'Could not open gift card link');
      }
    } else {
      Alert.alert('Gift Card Code', giftCard.code);
    }
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
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Text style={styles.backButtonText}>← Dashboard</Text>
            </TouchableOpacity>
          </View>
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
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>← Dashboard</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{child.name}'s Tasks</Text>
          <Text style={styles.subtitle}>Complete your tasks to earn rewards!</Text>
        </View>
      </View>
      
          {/* Progress Bar */}
          <ChildProgressBar 
            tasks={tasks} 
            goalGems={parentTokens} // Use parent's number_of_tokens as goal
            earnedGems={earnedGemsOverride}
            childId={child.id.toString()} // Convert to string for PayoutService
            parentId={user?.id?.toString() || "1"} // Convert to string for PayoutService
            payoutAmount={10} // Mock payout amount
            onPayoutTriggered={async () => {
              // Subtract gems locally after successful redeem
              const currentEarned = tasks
                .filter(t => t.status === 3)
                .reduce((sum, t) => sum + t.gems, 0);
              const current = typeof earnedGemsOverride === 'number' ? earnedGemsOverride : currentEarned;
              const gemsToSubtract = parentTokens;
              const updated = Math.max(0, current - gemsToSubtract);
              setEarnedGemsOverride(updated);
              
              // Add a $10 Amazon gift card to the gift cards list
              const newGiftCard = {
                id: `giftcard_${Date.now()}`,
                code: `AMAZON-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                amount: 10,
                brand: 'Amazon',
                claimUrl: 'https://www.amazon.com/gift-cards',
                date: new Date().toISOString().split('T')[0]
              };
              setGiftCards(prev => [newGiftCard, ...prev]);
              console.log('Payout triggered! Added gift card:', newGiftCard);
              
              // Save gem reduction to database
              try {
                await UserService.updateChildGems(parseInt(child.id), -gemsToSubtract);
                console.log('Gems saved to database:', { childId: child.id, gemsSubtracted: gemsToSubtract });
              } catch (error) {
                console.error('Failed to save gems to database:', error);
                // Revert the local change if database save fails
                setEarnedGemsOverride(current);
              }
              
              console.log('Payout triggered! Gems updated:', { current, goal: parentTokens, updated });
            }}
          />

          {/* Gift Cards Button */}
          <View style={styles.giftCardContainer}>
            <TouchableOpacity 
              style={styles.giftCardButton} 
              onPress={handleGiftCardPress}
            >
              <Text style={styles.giftCardButtonText}>🎁 View Gift Cards</Text>
            </TouchableOpacity>
          </View>
      
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {columns.map(column => (
          <Column key={column.id} column={column} />
        ))}
      </ScrollView>

      {/* Gift Card Modal */}
      <Modal
        visible={giftCardModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setGiftCardModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎁 Your Gift Cards</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setGiftCardModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.giftCardList}>
              {giftCards.length === 0 ? (
                <Text style={styles.noGiftCardsText}>No gift cards yet. Complete tasks to earn rewards!</Text>
              ) : (
                giftCards.map((giftCard) => (
                  <View key={giftCard.id} style={styles.giftCardItem}>
                    <View style={styles.giftCardInfo}>
                      <Text style={styles.giftCardBrand}>{giftCard.brand}</Text>
                      <Text style={styles.giftCardAmount}>${giftCard.amount}</Text>
                      <Text style={styles.giftCardCode}>Code: {giftCard.code}</Text>
                      <Text style={styles.giftCardDate}>Earned: {giftCard.date}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.redeemButton}
                      onPress={() => handleGiftCardRedeem(giftCard)}
                    >
                      <Text style={styles.redeemButtonText}>Redeem</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#A23E48',
    fontWeight: 'bold',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButtonText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
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
  // Gift Card Styles
  giftCardContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  giftCardButton: {
    backgroundColor: '#8B5CF6', // Purple color for gift cards
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  giftCardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  giftCardList: {
    maxHeight: 400,
  },
  noGiftCardsText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    fontStyle: 'italic',
    paddingVertical: 40,
  },
  giftCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  giftCardInfo: {
    flex: 1,
  },
  giftCardBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  giftCardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  giftCardCode: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  giftCardDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  redeemButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  redeemButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChildTaskDashboard;
