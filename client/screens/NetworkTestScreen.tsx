import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import NetworkDebugger from '../src/components/NetworkDebugger';

const NetworkTestScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <NetworkDebugger />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default NetworkTestScreen;
