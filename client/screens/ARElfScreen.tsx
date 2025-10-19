import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import { Task } from '../services/taskService';
import { Child } from '../types/childTypes';

type RootStackParamList = {
  Dashboard: undefined;
  TaskDetail: { task: Task; child: Child };
  ChildTaskDashboard: { child: Child };
};

type ARElfScreenRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;
type ARElfScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;

// Simple Image Elf Component - displays elf image with 3D-like animations
function ImageElf({ onClick }: { onClick: () => void }) {
  const floatAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Continuous smooth rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }),
      { iterations: -1 }
    ).start();

    // Subtle pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const rotateZ = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <TouchableOpacity onPress={onClick} style={styles.elfImageContainer}>
      <Animated.View
        style={[
          styles.elfImageWrapper,
          {
            transform: [
              { translateY: floatY },
              { rotateZ: rotateZ },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <Image 
          source={require('../assets/elf image.png')} 
          style={styles.elfImage}
          resizeMode="contain"
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

// Simple Elf Component using image
function Elf3D({ onClick }: { onClick: () => void }) {
  return <ImageElf onClick={onClick} />;
}

const ARElfScreen: React.FC = () => {
  const navigation = useNavigation<ARElfScreenNavigationProp>();
  const route = useRoute<ARElfScreenRouteProp>();
  const { task, child } = route.params;
  
  const [showAR, setShowAR] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [elfVisible, setElfVisible] = useState(false);
  const [elfPosition, setElfPosition] = useState({ x: 50, y: 50 });
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (elfVisible) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [elfVisible]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const goBack = () => {
    if (showAR) {
      setShowAR(false);
      setElfVisible(false);
    } else {
      navigation.navigate('TaskDetail', { task, child });
    }
  };

  const openARExperience = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (result.granted) {
        setShowAR(true);
      }
    } else {
      setShowAR(true);
    }
  };

  const handleElfClick = async () => {
    console.log('Elf clicked!');
    
    // Create task-specific message
    const taskMessage = getTaskMessage();
    
    console.log('Speaking:', taskMessage);
    
    try {
      await Speech.stop();
      await Speech.speak(taskMessage, {
        language: 'en-US',
        pitch: 1.2,
        rate: 0.8, // Slightly slower for task instructions
        onStart: () => console.log('Elf speech started!'),
        onDone: () => console.log('Elf speech completed!'),
        onStopped: () => console.log('Elf speech stopped'),
        onError: (error) => console.error('Elf speech error:', error),
      });
    } catch (error) {
      console.error('Speech error:', error);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getTaskMessage = (): string => {
    const baseMessage = `Hello ${child.name}! I'm here to help you with your task: ${task.name}.`;
    
    let locationMessage = '';
    if (task.location) {
      locationMessage = ` This task is in the ${task.location}.`;
    }
    
    let instructionMessage = '';
    if (task.desc) {
      instructionMessage = ` Here's what you need to do: ${task.desc}`;
    }
    
    let rewardMessage = '';
    if (task.gems) {
      rewardMessage = ` When you complete this task, you'll earn ${task.gems} gems!`;
    }
    
    const encouragementMessage = " Take your time and do your best work! Tap me again if you need me to repeat the instructions.";
    
    return baseMessage + locationMessage + instructionMessage + rewardMessage + encouragementMessage;
  };

  const placeElf = (event: any) => {
    if (!elfVisible) {
      const { locationX, locationY } = event.nativeEvent;
      console.log('Tap coordinates:', locationX, locationY);
      setElfPosition({ 
        x: locationX - 100,
        y: locationY - 100
      });
      setElfVisible(true);
      console.log('Elf placed! elfVisible:', true);
    }
  };

  if (showAR) {
    return (
      <View style={styles.arContainer}>
        <CameraView style={styles.camera} facing="back">
          <TouchableOpacity 
            style={styles.arOverlay}
            activeOpacity={1}
            onPress={placeElf}
          >
            <View style={styles.arHeader}>
              <TouchableOpacity style={styles.arBackButton} onPress={goBack}>
                <Text style={styles.arBackButtonText}>← Back</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.arInstructions}>
              <Text style={styles.instructionText}>
                {elfVisible ? `Tap the elf to hear about: ${task.name} 🎤` : 'Tap anywhere to place your elf guide 📍'}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.exitButton}
              onPress={() => navigation.navigate('TaskDetail', { task, child })}
            >
              <Text style={styles.exitButtonText}>Exit AR</Text>
            </TouchableOpacity>

            {elfVisible && (
              <TouchableOpacity
                style={[
                  styles.elfContainer,
                  {
                    left: elfPosition.x,
                    top: elfPosition.y,
                  }
                ]}
                onPress={handleElfClick}
                activeOpacity={0.8}
              >
                <Elf3D onClick={handleElfClick} />
              </TouchableOpacity>
            )}

            {!elfVisible && (
              <View style={styles.centerHint}>
                <View style={styles.targetCircle}>
                  <View style={styles.targetDot} />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.title}>🎄 AR Elf Guide</Text>
          <Text style={styles.subtitle}>Your elf will help you with: {task.name}</Text>
          
          <View style={styles.taskInfo}>
            <Text style={styles.taskName}>{task.name}</Text>
            <Text style={styles.taskLocation}>📍 {task.location}</Text>
            <Text style={styles.taskReward}>💎 {task.gems} gems</Text>
            {task.desc && (
              <Text style={styles.taskDescription}>{task.desc}</Text>
            )}
          </View>
          
          <View style={styles.description}>
            <Text style={styles.descriptionText}>
              • Point your camera at any surface{'\n'}
              • Tap to place your elf guide{'\n'}
              • Tap the elf to hear task instructions{'\n'}
              • Complete your task with elf guidance!
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.arButton}
            onPress={openARExperience}
          >
            <Text style={styles.arButtonText}>🎯 Start AR Experience</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={handleElfClick}
          >
            <Text style={styles.testButtonText}>🎤 Test Speech</Text>
          </TouchableOpacity>

          <View style={styles.features}>
            <Text style={styles.featuresTitle}>Features:</Text>
            <Text style={styles.featureItem}>✨ Animated Elf</Text>
            <Text style={styles.featureItem}>🎤 Voice Messages</Text>
            <Text style={styles.featureItem}>📱 Works in Expo Go</Text>
            <Text style={styles.featureItem}>🎄 Christmas Magic</Text>
          </View>
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
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  description: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    width: '100%',
  },
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'center',
  },
  arButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 40,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  arButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  features: {
    width: '100%',
    alignItems: 'center',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  arContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  arOverlay: {
    flex: 1,
  },
  arHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  arBackButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  arBackButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  arInstructions: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  centerHint: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
  },
  targetCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.8)',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  elfContainer: {
    position: 'absolute',
    width: 300,
    height: 600,
    alignItems: 'center',
  },
  elfImageContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  elfImageWrapper: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  elfImage: {
    width: 200,
    height: 200,
  },
  taskInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  taskLocation: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  taskReward: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  exitButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  exitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ARElfScreen;