import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { IP_ADDRESS, PORT } from '@env';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  PaymentSetup: undefined;
  Login: undefined;
};

type FamilySetupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PaymentSetup'>;

interface FamilySetupFormData {
  name: string;
  email: string;
  familyPassword: string;
  parentPin: string;
  childName: string;
}

interface Child {
  id: string;
  name: string;
}

const FamilySetupScreen: React.FC = () => {
  const navigation = useNavigation<FamilySetupScreenNavigationProp>();
  const auth = useAuth();
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const { user, setUser } = auth;
  const [formData, setFormData] = useState<FamilySetupFormData>({
    name: '',
    email: '',
    familyPassword: '',
    parentPin: '',
    childName: '',
  });
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FamilySetupFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FamilySetupFormData> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.familyPassword) {
      newErrors.familyPassword = 'Family password is required';
    } else if (formData.familyPassword.length < 6) {
      newErrors.familyPassword = 'Password must be at least 6 characters';
    }

    if (!formData.parentPin) {
      newErrors.parentPin = 'Parent PIN is required';
    } else if (formData.parentPin.length < 4) {
      newErrors.parentPin = 'PIN must be at least 4 digits';
    }

    if (formData.childName.trim() && formData.childName.trim().length < 2) {
      newErrors.childName = 'Child name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FamilySetupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addChild = () => {
    if (!formData.childName.trim()) {
      Alert.alert('Error', 'Please enter a child name');
      return;
    }

    const newChild: Child = {
      id: Date.now().toString(),
      name: formData.childName.trim(),
    };

    setChildren(prev => [...prev, newChild]);
    setFormData(prev => ({ ...prev, childName: '' }));
  };

  const removeChild = (childId: string) => {
    setChildren(prev => prev.filter(child => child.id !== childId));
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Create new user first
      const createUserResponse = await fetch(`http://${IP_ADDRESS}:${PORT}/user/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.familyPassword,
          pin: formData.parentPin
        }),
      });
      if (!createUserResponse.ok) {
        const errorText = await createUserResponse.text();
        console.error('Create user error response:', errorText);
        throw new Error(`Failed to create user account: ${errorText}`);
      }

      const userData = await createUserResponse.json();
      
      // Now save family setup with the new user ID
      const response = await fetch(`http://${IP_ADDRESS}:${PORT}/user/family-setup`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.user.id,
          email: formData.email.trim(),
          password: formData.familyPassword,
          pin: formData.parentPin,
          children: children.map(child => ({ name: child.name }))
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Family setup error response:', errorText);
        throw new Error(`Failed to save family setup: ${errorText}`);
      }

      const data = await response.json();
      console.log('Family setup saved:', data);

      // Set user in AuthContext for future screens
      setUser(userData.user);

      Alert.alert(
        'Success!',
        'Your family account has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('PaymentSetup'),
          },
        ]
      );
    } catch (error) {
      console.error('Family setup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error details:', errorMessage);
      Alert.alert(
        'Setup Failed',
        `An error occurred during family setup: ${errorMessage}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Family Account Creation</Text>
          <Text style={styles.subtitle}>Set up your family account and add children</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter your name:</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter your email and Family password:</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.familyPassword && styles.inputError]}
              placeholder="Enter family password"
              value={formData.familyPassword}
              onChangeText={(value) => handleInputChange('familyPassword', value)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.familyPassword && <Text style={styles.errorText}>{errors.familyPassword}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter parent pin:</Text>
            <TextInput
              style={[styles.input, errors.parentPin && styles.inputError]}
              placeholder="Enter 4-digit PIN"
              value={formData.parentPin}
              onChangeText={(value) => handleInputChange('parentPin', value)}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
            {errors.parentPin && <Text style={styles.errorText}>{errors.parentPin}</Text>}
          </View>

          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitle}>Next, add children to your family:</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Child name:</Text>
            <View style={styles.childInputRow}>
              <TextInput
                style={[styles.childInput, errors.childName && styles.inputError]}
                placeholder="Enter child's name"
                value={formData.childName}
                onChangeText={(value) => handleInputChange('childName', value)}
                autoCapitalize="words"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.confirmChildButton}
                onPress={addChild}
              >
                <Text style={styles.confirmChildButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            {errors.childName && <Text style={styles.errorText}>{errors.childName}</Text>}
          </View>

          {children.length > 0 && (
            <View style={styles.childrenList}>
              <Text style={styles.childrenListTitle}>Added Children:</Text>
              {children.map((child) => (
                <View key={child.id} style={styles.childItem}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <TouchableOpacity 
                    style={styles.removeChildButton}
                    onPress={() => removeChild(child.id)}
                  >
                    <Text style={styles.removeChildButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.nextButtonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={navigateToLogin}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#1E293B',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#C5F4E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
  },
  inputError: {
    borderColor: '#C45C65',
  },
  errorText: {
    color: '#C45C65',
    fontSize: 14,
    marginTop: 4,
  },
  sectionDivider: {
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  childInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  childInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C5F4E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
  },
  confirmChildButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  confirmChildButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  childrenList: {
    marginTop: 16,
    marginBottom: 24,
  },
  childrenListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  childItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#C5F4E0',
  },
  childName: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  removeChildButton: {
    backgroundColor: '#C45C65',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  removeChildButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2E8B57',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#1E293B',
  },
  loginLink: {
    fontSize: 16,
    color: '#A23E48',
    fontWeight: '600',
  },
});

export default FamilySetupScreen;