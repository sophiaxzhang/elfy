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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { IP_ADDRESS, PORT } from '@env';

type RootStackParamList = {
  FamilySetup: undefined;
  TokenConfig: undefined;
};

type PaymentSetupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TokenConfig'>;

interface PaymentSetupFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: string;
}

const PaymentSetupScreen: React.FC = () => {
  const navigation = useNavigation<PaymentSetupScreenNavigationProp>();
  const { user } = useAuth() as { user: { id: number } };
  const [formData, setFormData] = useState<PaymentSetupFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PaymentSetupFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentSetupFormData> = {};

    // Card number validation
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    // Expiry date validation
    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Please enter expiry date in MM/YY format';
    }

    // CVV validation
    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length < 3) {
      newErrors.cvv = 'CVV must be at least 3 digits';
    }

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    // Billing address validation
    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = 'Billing address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PaymentSetupFormData, value: string) => {
    let formattedValue = value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    }
    
    // Format expiry date
    if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://10.2.90.74:3000/user/payment-method`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          cardNumber: formData.cardNumber.replace(/\s/g, ''), // Remove spaces
          expiryDate: formData.expiryDate.replace(/\//g, ''), // Remove slashes (MMYY format)
          cvv: formData.cvv,
          cardholderName: formData.cardholderName.trim(),
          billingAddress: formData.billingAddress.trim()
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment method error response:', errorText);
        throw new Error(`Failed to save payment method: ${errorText}`);
      }

      const data = await response.json();
      console.log('Payment method saved:', data);

      Alert.alert(
        'Success!',
        'Your payment method has been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('TokenConfig'),
          },
        ]
      );
    } catch (error) {
      console.error('Payment setup error:', error);
      Alert.alert(
        'Payment Setup Failed',
        `An error occurred during payment setup: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.navigate('FamilySetup');
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
          <Text style={styles.title}>Payment Setup</Text>
          <Text style={styles.subtitle}>Enter payment information</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              style={[styles.input, errors.cardNumber && styles.inputError]}
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChangeText={(value) => handleInputChange('cardNumber', value)}
              keyboardType="numeric"
              maxLength={19}
              autoCorrect={false}
            />
            {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={[styles.input, errors.expiryDate && styles.inputError]}
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChangeText={(value) => handleInputChange('expiryDate', value)}
                keyboardType="numeric"
                maxLength={5}
                autoCorrect={false}
              />
              {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={[styles.input, errors.cvv && styles.inputError]}
                placeholder="123"
                value={formData.cvv}
                onChangeText={(value) => handleInputChange('cvv', value)}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                autoCorrect={false}
              />
              {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cardholder Name</Text>
            <TextInput
              style={[styles.input, errors.cardholderName && styles.inputError]}
              placeholder="Enter cardholder name"
              value={formData.cardholderName}
              onChangeText={(value) => handleInputChange('cardholderName', value)}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {errors.cardholderName && <Text style={styles.errorText}>{errors.cardholderName}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Billing Address</Text>
            <TextInput
              style={[styles.input, errors.billingAddress && styles.inputError]}
              placeholder="Enter billing address"
              value={formData.billingAddress}
              onChangeText={(value) => handleInputChange('billingAddress', value)}
              autoCapitalize="words"
              autoCorrect={false}
              multiline
              numberOfLines={3}
            />
            {errors.billingAddress && <Text style={styles.errorText}>{errors.billingAddress}</Text>}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

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
    marginBottom: 20,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
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
  nextButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
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
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentSetupScreen;
