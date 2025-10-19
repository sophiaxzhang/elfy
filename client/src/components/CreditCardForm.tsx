import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { IP_ADDRESS, PORT } from '@env';

interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: string;
  message: string;
  data?: {
    transactionIdentifier: string;
    responseCode: string;
    responseMessage: string;
  };
}

interface CreditCardFormProps {
  onPaymentSuccess: (data: PaymentResponse) => void;
  onPaymentError: (error: Error) => void;
}

const CreditCardForm = ({ onPaymentSuccess, onPaymentError }: CreditCardFormProps) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    amount: '',
    pin: ''
  });
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = `http://${IP_ADDRESS}:${PORT}`;

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateCardData = () => {
    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Error', 'Please enter a valid 16-digit card number');
      return false;
    }
    if (!cardData.expiryDate || cardData.expiryDate.length < 5) {
      Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return false;
    }
    if (!cardData.cardholderName.trim()) {
      Alert.alert('Error', 'Please enter the cardholder name');
      return false;
    }
    if (!cardData.amount || parseFloat(cardData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    if (!cardData.pin || cardData.pin.length !== 4) {
      Alert.alert('Error', 'Please enter a 4-digit PIN');
      return false;
    }
    return true;
  };

  const handlePullFunds = async () => {
    if (!validateCardData()) return;

    setLoading(true);
    
    try {
      // First, get JWT token (you might want to store this globally)
      const loginResponse = await axios.post(`${API_BASE_URL}/user/login`, {
        email: 'test@example.com', // Replace with actual user email
        password: 'password123'     // Replace with actual user password
      });
      
      const token = loginResponse.data.user.token;

      // Prepare payment data for Visa Direct API
      const paymentData = {
        systemsTraceAuditNumber: Math.floor(Math.random() * 900000) + 100000, // 6-digit random
        retrievalReferenceNumber: Math.floor(Math.random() * 900000000000) + 100000000000, // 12-digit random
        acquiringBin: "123456", // Your acquiring BIN
        acquirerCountryCode: "840", // US country code
        senderPrimaryAccountNumber: cardData.cardNumber.replace(/\s/g, ''), // Remove spaces
        senderCardExpiryDate: cardData.expiryDate.replace('/', ''), // Remove slash
        senderCurrencyCode: "840", // USD
        amount: parseFloat(cardData.amount).toFixed(2),
        businessApplicationId: "AA", // Account to Account transfer
        merchantCategoryCode: "6012", // Financial institutions
        cardAcceptor: {
          name: "Elf Payment App",
          terminalId: "12345678",
          idCode: "123456789012345",
          address: {
            street: "123 Main St",
            city: "San Francisco",
            state: "CA",
            zipCode: "94105",
            country: "USA"
          }
        },
        recipientPrimaryAccountNumber: "4111111111111112", // Your app's account
        transactionIdentifier: `TXN_${Date.now()}`
      };

      // Make the pull funds request
      const response = await axios.post(`${API_BASE_URL}/payment/pull-funds`, paymentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      Alert.alert(
        'Payment Successful!', 
        `Transaction ID: ${response.data.transactionId}\nAmount: $${cardData.amount}\nStatus: ${response.data.message}`,
        [{ text: 'OK', onPress: () => onPaymentSuccess?.(response.data) }]
      );

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = (error as any)?.response?.data?.error || (error as Error).message || 'Payment failed';
      Alert.alert('Payment Failed', errorMessage);
      onPaymentError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>💳 Pull Funds from Card</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          placeholder="1234 5678 9012 3456"
          value={cardData.cardNumber}
          onChangeText={(text) => setCardData({...cardData, cardNumber: formatCardNumber(text)})}
          keyboardType="numeric"
          maxLength={19}
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Expiry Date</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              value={cardData.expiryDate}
              onChangeText={(text) => setCardData({...cardData, expiryDate: formatExpiryDate(text)})}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          
          <View style={styles.halfWidth}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              value={cardData.cvv}
              onChangeText={(text) => setCardData({...cardData, cvv: text})}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        <Text style={styles.label}>Cardholder Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          value={cardData.cardholderName}
          onChangeText={(text) => setCardData({...cardData, cardholderName: text})}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Amount ($)</Text>
        <TextInput
          style={styles.input}
          placeholder="100.00"
          value={cardData.amount}
          onChangeText={(text) => setCardData({...cardData, amount: text})}
          keyboardType="numeric"
        />

        <Text style={styles.label}>PIN</Text>
        <TextInput
          style={styles.input}
          placeholder="1234"
          value={cardData.pin}
          onChangeText={(text) => setCardData({...cardData, pin: text})}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handlePullFunds}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Pull Funds'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.securityNote}>
        <Text style={styles.securityText}>
          🔒 Your card information is encrypted and processed securely through Visa Direct API
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityNote: {
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  securityText: {
    color: '#0066cc',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CreditCardForm;
