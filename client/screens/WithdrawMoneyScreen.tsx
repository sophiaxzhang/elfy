import React from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import MoneyWithdrawal from '../src/components/MoneyWithdrawal';
import { useAuth } from '../context/AuthContext';

const WithdrawMoneyScreen: React.FC = () => {
  const { user } = useAuth();

  const handleWithdrawalSuccess = (transaction: any) => {
    console.log('Withdrawal successful:', transaction);
    // You can add navigation or other success actions here
  };

  const handleWithdrawalError = (error: Error) => {
    console.error('Withdrawal error:', error);
    // You can add error handling or logging here
  };

  if (!user?.id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please log in to withdraw money</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MoneyWithdrawal
        userId={user.id.toString()}
        onWithdrawalSuccess={handleWithdrawalSuccess}
        onWithdrawalError={handleWithdrawalError}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default WithdrawMoneyScreen;
