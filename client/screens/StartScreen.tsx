import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  FamilySetup: undefined;
  Login: undefined;
  ARElf: undefined;
};

type StartScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FamilySetup'>;

const StartScreen: React.FC = () => {
  const navigation = useNavigation<StartScreenNavigationProp>();

  const handleCreateFamilyAccount = () => {
    navigation.navigate('FamilySetup');
  };

  const handleLoginToFamily = () => {
    navigation.navigate('Login');
  };

  const handleTestAR = () => {
    navigation.navigate('ARElf');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Elfly</Text>
        <Text style={styles.subtitle}>Choose an option to get started</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleCreateFamilyAccount}
          >
            <Text style={styles.primaryButtonText}>Create Family Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleLoginToFamily}
          >
            <Text style={styles.secondaryButtonText}>Log In to Family</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={handleTestAR}
          >
            <Text style={styles.testButtonText}>🎄 Test AR Elf</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  secondaryButtonText: {
    color: '#3b82f6',
    fontSize: 18,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default StartScreen;

