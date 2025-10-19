import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getToken } from '../../services/authService';

const DebugUserInfo = () => {
  const { user } = useAuth() as { user: any };
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await getToken();
      setToken(storedToken);
    };
    fetchToken();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Debug User Info</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.label}>Current User:</Text>
        <Text style={styles.value}>
          {user ? JSON.stringify(user, null, 2) : 'No user data'}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Stored Token:</Text>
        <Text style={styles.value}>
          {token ? `${token.substring(0, 20)}...` : 'No token found'}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>User ID:</Text>
        <Text style={styles.value}>
          {user?.id || 'No ID'}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>User Email:</Text>
        <Text style={styles.value}>
          {user?.email || 'No email'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default DebugUserInfo;
