import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios, { AxiosError } from 'axios';
import { IP_ADDRESS, PORT } from '@env';

const PaymentTest = () => {
  const [jwtToken, setJwtToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const API_BASE_URL = `http://${IP_ADDRESS}:${PORT}`;

  const login = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/login`, {
        email,
        password
      });
      setJwtToken(response.data.token);
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error) {
      Alert.alert('Error', 'Login failed'); // (error as AxiosError).response?.data?.error || 
    }
  };

  const testPushFunds = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/payment/push-funds`, {
        systemsTraceAuditNumber: "123456",
        retrievalReferenceNumber: "123456789012",
        acquiringBin: "123456",
        acquirerCountryCode: "840",
        senderPrimaryAccountNumber: "4111111111111111",
        senderCardExpiryDate: "2025",
        senderCurrencyCode: "840",
        amount: "100.00",
        businessApplicationId: "AA",
        merchantCategoryCode: "6012",
        cardAcceptor: {
          name: "Test Merchant",
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
        recipientPrimaryAccountNumber: "4111111111111112"
      }, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });

      setTransactionId(response.data.transactionId);
      Alert.alert('Success', `Push funds successful! Transaction ID: ${response.data.transactionId}`);
    } catch (error) {
      Alert.alert('Error', 'Push funds failed'); //(error as AxiosError).response?.data?.error || 
    }
  };

  const testPullFunds = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/payment/pull-funds`, {
        systemsTraceAuditNumber: "123457",
        retrievalReferenceNumber: "123456789013",
        acquiringBin: "123456",
        acquirerCountryCode: "840",
        senderPrimaryAccountNumber: "4111111111111111",
        senderCardExpiryDate: "2025",
        senderCurrencyCode: "840",
        amount: "50.00",
        businessApplicationId: "AA",
        merchantCategoryCode: "6012",
        cardAcceptor: {
          name: "Test Merchant",
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
        recipientPrimaryAccountNumber: "4111111111111112"
      }, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });

      setTransactionId(response.data.transactionId);
      Alert.alert('Success', `Pull funds successful! Transaction ID: ${response.data.transactionId}`);
    } catch (error) {
      Alert.alert('Error', 'Pull funds failed'); // (error as AxiosError).response?.data?.error || 
    }
  };

  const checkTransactionStatus = async () => {
    if (!transactionId) {
      Alert.alert('Error', 'No transaction ID available');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/payment/transaction/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      Alert.alert('Transaction Status', `Status: ${response.data.status}\nMessage: ${response.data.message}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to get transaction status'); //(error as AxiosError).response?.data?.error || 
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment API Test</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, !jwtToken && styles.disabledButton]} 
        onPress={testPushFunds}
        disabled={!jwtToken}
      >
        <Text style={styles.buttonText}>Test Push Funds</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, !jwtToken && styles.disabledButton]} 
        onPress={testPullFunds}
        disabled={!jwtToken}
      >
        <Text style={styles.buttonText}>Test Pull Funds</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, !transactionId && styles.disabledButton]} 
        onPress={checkTransactionStatus}
        disabled={!transactionId}
      >
        <Text style={styles.buttonText}>Check Transaction Status</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default PaymentTest;
