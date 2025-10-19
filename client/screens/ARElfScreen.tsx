import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import { Canvas } from '@react-three/fiber/native';
import { useFrame } from '@react-three/fiber';
import { Suspense } from 'react';
import { useGLTF } from '@react-three/drei/native';

type RootStackParamList = {
  Dashboard: undefined;
};

type ARElfScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

// 3D Elf Component using GLB model
function Elf3D({ onClick }: { onClick: () => void }) {
  const meshRef = React.useRef<any>(null);
  
  // Try loading the GLB file with error handling
  let gltf;
  try {
    gltf = useGLTF(require('../assets/christmas_elf.glb'));
  } catch (error) {
    console.log('GLB loading failed, using fallback:', error);
    // Fallback to a simple box if GLB fails
    return (
      <mesh ref={meshRef} position={[0, 0, -2]} onClick={onClick}>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
    );
  }

  // Handle both single GLTF and array cases
  const scene = Array.isArray(gltf) ? gltf[0].scene : gltf.scene;
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={scene}
      scale={[0.5, 0.5, 0.5]}
      position={[0, 0, -2]}
      onClick={onClick}
    />
  );
}

const ARElfScreen: React.FC = () => {
  const navigation = useNavigation<ARElfScreenNavigationProp>();
  const [showAR, setShowAR] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [elfVisible, setElfVisible] = useState(false);
  const [elfPosition, setElfPosition] = useState({ x: 50, y: 50 });
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (elfVisible) {
      // Continuous rotation animation
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
      navigation.navigate('Dashboard');
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
    
    const messages = [
      "Hi there! Merry Christmas!",
      "Ho ho ho! I'm your AR elf!",
      "Welcome to Elfly! Ready for some fun?",
      "I'm here to help you earn tokens!",
      "Let's make this Christmas magical!",
      "Can you see me in your world?",
      "Tap me again for more cheer!"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    console.log('Speaking:', randomMessage);
    
    try {
      // Stop any existing speech first
      await Speech.stop();
      
      // Speak the message
      await Speech.speak(randomMessage, {
        language: 'en-US',
        pitch: 1.2,
        rate: 0.9,
        onStart: () => console.log('Elf speech started!'),
        onDone: () => console.log('Elf speech completed!'),
        onStopped: () => console.log('Elf speech stopped'),
        onError: (error) => console.error('Elf speech error:', error),
      });
    } catch (error) {
      console.error('Speech error:', error);
    }

    // Bounce animation
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

  const placeElf = (event: any) => {
    if (!elfVisible) {
      const { locationX, locationY } = event.nativeEvent;
      console.log('Tap coordinates:', locationX, locationY);
      setElfPosition({ 
        x: locationX - 50, // Center the elf on tap point
        y: locationY - 50 
      });
      setElfVisible(true);
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
                {elfVisible ? 'Tap the elf to hear it speak! 🎤' : 'Tap anywhere to place the elf 📍'}
              </Text>
            </View>

            {elfVisible && (
              <View
                style={[
                  styles.elfContainer,
                  {
                    left: elfPosition.x,
                    top: elfPosition.y,
                  }
                ]}
              >
                <Canvas style={styles.canvas3D}>
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <Elf3D onClick={handleElfClick} />
                  </Suspense>
                </Canvas>
                <View style={styles.elfLabel}>
                  <Text style={styles.elfLabelText}>Tap me!</Text>
                </View>
              </View>
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
          <Text style={styles.title}>🎄 AR Elf Experience</Text>
          <Text style={styles.subtitle}>Meet your magical AR elf!</Text>
          
          <View style={styles.description}>
            <Text style={styles.descriptionText}>
              • Point your camera at any surface{'\n'}
              • Tap to place the animated elf{'\n'}
              • Tap the elf to hear it speak{'\n'}
              • Enjoy the magical Christmas experience!
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
    width: 200,
    height: 200,
    alignItems: 'center',
  },
  canvas3D: {
    width: 200,
    height: 200,
  },
  elf: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  elfBody: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  elfEmoji: {
    fontSize: 40,
  },
  elfShadow: {
    width: 60,
    height: 10,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginTop: 5,
  },
  elfLabel: {
    marginTop: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  elfLabelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ARElfScreen;