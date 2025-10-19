import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { API_BASE_URL } from '../config/api';

const NetworkDebugger: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async (url: string, name: string) => {
    try {
      addResult(`Testing ${name}: ${url}`);
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        timeout: 5000,
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult(`✅ ${name} SUCCESS: ${JSON.stringify(data)}`);
        return true;
      } else {
        addResult(`❌ ${name} FAILED: Status ${response.status}`);
        return false;
      }
    } catch (error) {
      addResult(`❌ ${name} ERROR: ${error.message}`);
      return false;
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    addResult('🚀 Starting network tests...');
    addResult(`Current API_BASE_URL: ${API_BASE_URL}`);
    
    const testUrls = [
      { url: 'http://localhost:3000', name: 'Localhost' },
      { url: 'http://10.0.2.2:3000', name: 'Android Emulator' },
      { url: 'http://${IP_ADDRESS}:${PORT}', name: 'Device IP (old)' },
      { url: 'http://10.2.90.74:3000', name: 'Device IP (new)' },
    ];

    let successCount = 0;
    for (const test of testUrls) {
      const success = await testConnection(test.url, test.name);
      if (success) successCount++;
    }
    
    addResult(`\n📊 Results: ${successCount}/${testUrls.length} connections successful`);
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Network Debugger</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Current API Base URL: {API_BASE_URL}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.disabledButton]}
        onPress={runAllTests}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test All Connections'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.clearButton]}
        onPress={clearResults}
      >
        <Text style={styles.buttonText}>Clear Results</Text>
      </TouchableOpacity>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </View>
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
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 5,
    color: '#333',
  },
});

export default NetworkDebugger;
