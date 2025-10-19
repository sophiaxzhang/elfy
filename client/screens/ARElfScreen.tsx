import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import { Canvas } from '@react-three/fiber/native';
import { useFrame } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three-stdlib';
import * as THREE from 'three';
import { Suspense } from 'react';
import { Asset } from 'expo-asset';

type RootStackParamList = {
  Dashboard: undefined;
};

type ARElfScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

// Fallback Elf Component for loading
function FallbackElf({ onClick }: { onClick: () => void }) {
  const meshRef = React.useRef<any>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2]} onClick={onClick}>
      <boxGeometry args={[0.5, 0.7, 0.3]} />
      <meshStandardMaterial color="#ff6b6b" />
    </mesh>
  );
}

// Error Boundary for OBJ loading
class OBJErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.log('OBJ Error Boundary caught error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log('OBJ Error Boundary details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// OBJ Loader Component - handles the actual OBJ loading
function OBJLoaderComponent({ objUri, onClick }: { objUri: string; onClick: () => void }) {
  const meshRef = React.useRef<any>(null);
  
  // Load the OBJ file using useLoader with the URI
  const obj = useLoader(OBJLoader, objUri);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  // Add materials to the loaded object and calculate proper scale
  React.useEffect(() => {
    if (obj) {
      console.log('OBJ object structure:', obj);
      const objectToTraverse = Array.isArray(obj) ? obj[0] : obj;
      
      // Log all children to see what's in the model
      objectToTraverse.traverse((child: any) => {
        console.log('Child object:', child.name, child.type, child.isMesh);
        if (child.isMesh) {
          console.log('Mesh material:', child.material);
          // Force apply our material to override any existing materials
          child.material = new THREE.MeshStandardMaterial({ 
            color: '#ff6b6b',
            roughness: 0.7,
            metalness: 0.1
          });
        }
      });
      
      // Calculate bounding box to understand the model size
      const box = new THREE.Box3().setFromObject(objectToTraverse);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      console.log('Model size:', size);
      console.log('Model center:', center);
      
      // Center the model properly
      objectToTraverse.position.set(-center.x, -center.y, -center.z);
    }
  }, [obj]);

  // Debug: Log when component renders
  console.log('OBJLoaderComponent rendering with obj:', !!obj);

  return (
    <primitive
      ref={meshRef}
      object={Array.isArray(obj) ? obj[0] : obj}
      position={[0, 0, 0]}
      scale={[0.3, 0.3, 0.3]}
      onClick={onClick}
    />
  );
}

// 3D Elf Component using OBJ model with proper asset loading
function Elf3D({ onClick }: { onClick: () => void }) {
  const [objUri, setObjUri] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Load the asset and get its URI
  React.useEffect(() => {
    async function loadAsset() {
      try {
        const asset = Asset.fromModule(require('../assets/Elf_model2.obj'));
        await asset.downloadAsync();
        console.log('Asset loaded, URI:', asset.uri);
        setObjUri(asset.uri);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading asset:', error);
        setIsLoading(false);
      }
    }
    loadAsset();
  }, []);

  // Debug logging
  console.log('Elf3D - isLoading:', isLoading, 'objUri:', objUri);

  // Show fallback while loading or if no URI
  if (isLoading || !objUri) {
    console.log('Elf3D - showing fallback');
    return <FallbackElf onClick={onClick} />;
  }

  // Render the OBJ loader component with the URI
  console.log('Elf3D - rendering OBJLoaderComponent');
  return <OBJLoaderComponent objUri={objUri} onClick={onClick} />;
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
      await Speech.stop();
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
                {elfVisible ? 'Tap the elf to hear it speak! 🎤' : 'Tap anywhere to place the elf 📍'}
              </Text>
            </View>

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
                <Canvas 
                  style={styles.canvas3D}
                  camera={{ 
                    position: [0, 1, 25], 
                    fov: 75,
                    near: 0.1,
                    far: 1000
                  }}
                >
                  <OBJErrorBoundary fallback={<FallbackElf onClick={handleElfClick} />}>
                    <Suspense fallback={<FallbackElf onClick={handleElfClick} />}>
                      <ambientLight intensity={0.5} />
                      <pointLight position={[10, 10, 10]} />
                      <Elf3D onClick={handleElfClick} />
                    </Suspense>
                  </OBJErrorBoundary>
                </Canvas>
                <View style={styles.elfLabel}>
                  <Text style={styles.elfLabelText}>Tap me!</Text>
                </View>
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
    width: 300,
    height: 600,
    alignItems: 'center',
  },
  canvas3D: {
    width: 300,
    height: 600,
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