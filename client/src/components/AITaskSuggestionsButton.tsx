import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import AITaskSuggestions from './AITaskSuggestions';
import { TaskSuggestion } from '../services/aiTaskSuggestionService';

interface AITaskSuggestionsButtonProps {
  childAge: number;
  childName: string;
  onSuggestionSelect: (suggestion: TaskSuggestion) => void;
  style?: any;
}

const AITaskSuggestionsButton: React.FC<AITaskSuggestionsButtonProps> = ({
  childAge,
  childName,
  onSuggestionSelect,
  style,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleSuggestionSelect = (suggestion: TaskSuggestion) => {
    onSuggestionSelect(suggestion);
    setShowModal(false);
  };

  const handleOpenSuggestions = () => {
    setShowModal(true);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={handleOpenSuggestions}
      >
        <Text style={styles.buttonText}>🤖 AI Suggestions</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>AI Task Suggestions</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <AITaskSuggestions
            childAge={childAge}
            childName={childName}
            onSuggestionSelect={handleSuggestionSelect}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: 'bold',
  },
});

export default AITaskSuggestionsButton;
