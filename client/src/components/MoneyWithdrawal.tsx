import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { API_BASE_URL } from '../config/api';

interface PaymentMethod {
  id: number;
  card_number: string;
  expiry_date: string;
  cardholder_name: string;
  is_default: boolean;
}

interface MoneyWithdrawalProps {
  userId: string;
  onWithdrawalSuccess?: (transaction: any) => void;
  onWithdrawalError?: (error: Error) => void;
}

const MoneyWithdrawal: React.FC<MoneyWithdrawalProps> = ({
  userId,
  onWithdrawalSuccess,
  onWithdrawalError,
}) => {
  const [amount, setAmount] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [pin, setPin] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, [userId]);

  const loadPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const response = await fetch(`${API_BASE_URL}/payment/methods/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load payment methods');
      }

      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
      
      // Set default card if available
      const defaultCard = data.paymentMethods?.find((card: PaymentMethod) => card.is_default);
      if (defaultCard) {
        setSelectedCardId(defaultCard.id);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setLoadingMethods(false);
    }
  };

  const validateForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }

    if (!selectedCardId) {
      Alert.alert('Error', 'Please select a payment method');
      return false;
    }

    if (parseFloat(amount) > 1000) {
      Alert.alert('Error', 'Maximum withdrawal amount is $1000');
      return false;
    }

    return true;
  };

  const handleWithdrawal = async () => {
    if (!validateForm()) return;

    setShowPinModal(true);
  };

  const confirmWithdrawal = async () => {
    if (!pin || pin.length !== 4) {
      Alert.alert('Error', 'Please enter a 4-digit PIN');
      return;
    }

    setLoading(true);
    setShowPinModal(false);

    try {
      const response = await fetch(`${API_BASE_URL}/payment/pull-funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          amount: parseFloat(amount),
          cardId: selectedCardId,
          pin: pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Withdrawal failed');
      }

      Alert.alert(
        'Success!',
        `$${amount} has been withdrawn successfully.\nTransaction ID: ${data.transaction.transaction_id}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              setPin('');
              onWithdrawalSuccess?.(data.transaction);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Withdrawal error:', error);
      const errorMessage = (error as Error).message || 'Withdrawal failed';
      Alert.alert('Withdrawal Failed', errorMessage);
      onWithdrawalError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (cardNumber: string) => {
    // Mask all but last 4 digits
    const lastFour = cardNumber.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  const formatExpiryDate = (expiryDate: string) => {
    // Convert MMYY to MM/YY
    if (expiryDate.length === 4) {
      return `${expiryDate.slice(0, 2)}/${expiryDate.slice(2)}`;
    }
    return expiryDate;
  };

  if (loadingMethods) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No payment methods found</Text>
        <Text style={styles.emptySubtext}>Please add a payment method first</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Withdraw Money</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          maxLength={10}
        />
        <Text style={styles.helperText}>Maximum: $1000</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {paymentMethods.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.cardOption,
              selectedCardId === card.id && styles.selectedCard,
            ]}
            onPress={() => setSelectedCardId(card.id)}
          >
            <View style={styles.cardInfo}>
              <Text style={styles.cardNumber}>
                {formatCardNumber(card.card_number)}
              </Text>
              <Text style={styles.cardDetails}>
                {card.cardholder_name} • {formatExpiryDate(card.expiry_date)}
              </Text>
            </View>
            {card.is_default && (
              <Text style={styles.defaultBadge}>Default</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleWithdrawal}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Withdraw Money</Text>
        )}
      </TouchableOpacity>

      {/* PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter PIN</Text>
            <Text style={styles.modalSubtitle}>
              Please enter your 4-digit PIN to confirm withdrawal
            </Text>
            <TextInput
              style={styles.pinInput}
              placeholder="Enter PIN"
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPinModal(false);
                  setPin('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmWithdrawal}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  cardInfo: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDetails: {
    fontSize: 14,
    color: '#666',
  },
  defaultBadge: {
    backgroundColor: '#007AFF',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default MoneyWithdrawal;
