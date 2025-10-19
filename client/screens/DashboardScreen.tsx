import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child';
}

const DashboardScreen: React.FC = () => {
  // This would typically come from your app state/context
  const [familyMembers] = useState<FamilyMember[]>([
    { id: '1', name: 'John', role: 'parent' },
    { id: '2', name: 'Sophia', role: 'child' },
    { id: '3', name: 'Bobby', role: 'child' },
  ]);

  const handleFamilyMemberPress = (member: FamilyMember) => {
    // TODO: Navigate to family member's profile or dashboard
    console.log(`Selected family member: ${member.name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your family</Text>
        
        <View style={styles.familyMembersContainer}>
          {familyMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={styles.familyMemberButton}
              onPress={() => handleFamilyMemberPress(member)}
            >
              <Text style={styles.familyMemberName}>{member.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 48,
    textAlign: 'center',
  },
  familyMembersContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  familyMemberButton: {
    backgroundColor: '#93C5FD', // Light blue color
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#93C5FD',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  familyMemberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  taskButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  taskButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DashboardScreen;

