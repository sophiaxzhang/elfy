import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ChildTaskDashboard: undefined;
  SelectChild: undefined;
};

type StartScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelectChild'>;

const StartScreen: React.FC = () => {
  const navigation = useNavigation<StartScreenNavigationProp>();

  const navigateToTasks = () => {
    navigation.navigate('ChildTaskDashboard');
  };

  const navigateToSelectChild = () => {
    navigation.navigate('SelectChild');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Elfly</Text>
      <Text style={styles.subtitle}>Your health companion</Text>
      
      <TouchableOpacity style={styles.taskButton} onPress={navigateToTasks}>
        <Text style={styles.taskButtonText}>View Child Task Dashboard</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.selectChildButton} onPress={navigateToSelectChild}>
        <Text style={styles.selectChildButtonText}>View Select Child Screen</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  taskButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  taskButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  selectChildButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 16,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  selectChildButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default StartScreen;

