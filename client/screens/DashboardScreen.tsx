import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert, 
  TextInput, 
  Modal,
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { UserService } from '../services/userService';
import { Child } from '../types/childTypes';

type RootStackParamList = {
  ChildTaskDashboard: { child: Child };
  SelectChild: undefined;
  Dashboard: undefined;
  AITaskSuggestions: undefined;
};

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child';
  data?: any; // Store the actual data object
}

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const auth = useAuth();
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const { user } = auth;

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

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
      
      const members: FamilyMember[] = [
        {
          id: familyData.parent.id.toString(),
          name: familyData.parent.name,
          role: 'parent',
          data: familyData.parent
        },
        ...familyData.children.map((child: any) => ({
          id: child.id.toString(),
          name: child.name,
          role: 'child' as const,
          data: {
            id: child.id.toString(),
            name: child.name,
            totalGemsEarned: child.gem || 0,
            currentGoal: 100, // Default goal, you might want to fetch this from database
            completedTasks: 0, // Default, you might want to fetch this from database
            totalTasks: 0 // Default, you might want to fetch this from database
          }
        }))
      ];
      
      setFamilyMembers(members);
    } catch (error) {
      console.error('Error loading family data:', error);
      Alert.alert('Error', 'Failed to load family data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFamilyMemberPress = (member: FamilyMember) => {
    if (member.role === 'parent') {
      setSelectedMember(member);
      setPinModalVisible(true);
    } else {
      // Navigate directly to child task dashboard for children
      navigation.navigate('ChildTaskDashboard', { child: member.data });
    }
  };

  const handlePinSubmit = async () => {
    if (!selectedMember || !user?.id) return;

    try {
      console.log('PIN validation attempt:', { userId: user.id, pin: pinInput, userIdType: typeof user.id, pinType: typeof pinInput });
      const isValid = await UserService.validatePin(user.id, pinInput);
      console.log('PIN validation result:', isValid);
      
      if (isValid) {
        setPinModalVisible(false);
        setPinInput('');
        // Navigate to SelectChild screen after successful PIN validation
        navigation.navigate('SelectChild');
      } else {
        Alert.alert('Error', 'Invalid PIN. Please try again.');
        setPinInput('');
      }
    } catch (error) {
      console.error('PIN validation error:', error);
      Alert.alert('Error', 'Failed to validate PIN. Please try again.');
    }
  };

  const handlePinCancel = () => {
    setPinModalVisible(false);
    setPinInput('');
    setSelectedMember(null);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading family data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your family</Text>
        
        <View style={styles.familyMembersContainer}>
          {familyMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={[
                styles.familyMemberButton,
                member.role === 'parent' ? styles.parentButton : styles.childButton
              ]}
              onPress={() => handleFamilyMemberPress(member)}
            >
              <Text style={[
                styles.familyMemberName,
                member.role === 'parent' ? styles.parentName : styles.childName
              ]}>
                {member.name}
              </Text>
              <Text style={styles.roleText}>
                {member.role === 'parent' ? 'Parent' : 'Child'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Task Suggestions Button */}
        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => navigation.navigate('AITaskSuggestions')}
        >
          <Text style={styles.aiButtonText}>🤖 AI Task Suggestions</Text>
          <Text style={styles.aiButtonSubtext}>Get personalized task ideas</Text>
        </TouchableOpacity>
      </View>

      {/* PIN Modal */}
      <Modal
        visible={pinModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handlePinCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter PIN</Text>
            <Text style={styles.modalSubtitle}>
              Please enter your PIN to access {selectedMember?.name}'s dashboard
            </Text>
            
            <TextInput
              style={styles.pinInput}
              value={pinInput}
              onChangeText={setPinInput}
              placeholder="Enter PIN"
              secureTextEntry={true}
              keyboardType="numeric"
              maxLength={6}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handlePinCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handlePinSubmit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 48,
    textAlign: 'center',
  },
  familyMembersContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  familyMemberButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '80%',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  parentButton: {
    backgroundColor: '#FEF2F2', // Light red for parent (Christmas red)
    shadowColor: '#FEF2F2',
  },
  childButton: {
    backgroundColor: '#F0FDF4', // Light green for child (Christmas green)
    shadowColor: '#F0FDF4',
  },
  familyMemberName: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  parentName: {
    color: '#92400E', // Darker yellow text
  },
  childName: {
    color: '#1E40AF', // Darker blue text
  },
  roleText: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 4,
    opacity: 0.7,
  },
  aiButton: {
    backgroundColor: '#6366F1', // Indigo color for AI
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '80%',
    alignItems: 'center',
    marginTop: 24,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  aiButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  aiButtonSubtext: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 4,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#DC2626',
  },
  // Modal styles
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
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  submitButton: {
    backgroundColor: '#DC2626',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;

