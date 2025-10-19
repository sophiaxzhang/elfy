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
  Dashboard: undefined;
};

type TokenConfigScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface TokenConfigFormData {
  numberOfTokens: string;
  giftCardAmount: string;
}

const TokenConfigScreen: React.FC = () => {
  const navigation = useNavigation<TokenConfigScreenNavigationProp>();
  const { user } = useAuth() as { user: { id: number } };
  const [formData, setFormData] = useState<TokenConfigFormData>({
    numberOfTokens: '',
    giftCardAmount: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<TokenConfigFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<TokenConfigFormData> = {};

    // Number of tokens validation
    if (!formData.numberOfTokens.trim()) {
      newErrors.numberOfTokens = 'Number of tokens is required';
    } else if (isNaN(Number(formData.numberOfTokens)) || Number(formData.numberOfTokens) <= 0) {
      newErrors.numberOfTokens = 'Please enter a valid number';
    }

    // Gift card amount validation
    if (!formData.giftCardAmount.trim()) {
      newErrors.giftCardAmount = 'Gift card amount is required';
    } else if (isNaN(Number(formData.giftCardAmount)) || Number(formData.giftCardAmount) <= 0) {
      newErrors.giftCardAmount = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof TokenConfigFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleComplete = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://${IP_ADDRESS}:${PORT}/user/token-config`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          numberOfTokens: formData.numberOfTokens,
          giftCardAmount: formData.giftCardAmount,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token config error response:', errorText);
        throw new Error(`Failed to save token configuration: ${errorText}`);
      }

      const data = await response.json();
      console.log('Token config saved:', data);

      Alert.alert(
        'Success!',
        'Your family account has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Dashboard'),
          },
        ]
      );
    } catch (error) {
      console.error('Token config error:', error);
      console.error('Error details:', error.message);
      Alert.alert(
        'Configuration Failed',
        `An error occurred during token configuration: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.navigate('PaymentSetup');
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
          <Text style={styles.title}>Assign tokens to values</Text>
          <Text style={styles.subtitle}>Configure your reward system</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of tokens:</Text>
            <TextInput
              style={[styles.input, errors.numberOfTokens && styles.inputError]}
              placeholder="Enter number of tokens"
              value={formData.numberOfTokens}
              onChangeText={(value) => handleInputChange('numberOfTokens', value)}
              keyboardType="numeric"
              autoCorrect={false}
            />
            {errors.numberOfTokens && <Text style={styles.errorText}>{errors.numberOfTokens}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>$ amount for gift card:</Text>
            <TextInput
              style={[styles.input, errors.giftCardAmount && styles.inputError]}
              placeholder="Enter dollar amount"
              value={formData.giftCardAmount}
              onChangeText={(value) => handleInputChange('giftCardAmount', value)}
              keyboardType="numeric"
              autoCorrect={false}
            />
            {errors.giftCardAmount && <Text style={styles.errorText}>{errors.giftCardAmount}</Text>}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.completeButton, isLoading && styles.completeButtonDisabled]}
              onPress={handleComplete}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.completeButtonText}>Complete Setup</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  backButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TokenConfigScreen;
