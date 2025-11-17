import { initializeDatabase, seedDatabase } from '@/services/database';
import { useAuthStore } from '@/store/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(50)).current;
  const { getCurrentUser } = useAuthStore();

  useEffect(() => {
    // Initialize app while showing splash
    const initializeApp = async () => {
      try {
        await initializeDatabase();
        await seedDatabase();
        await getCurrentUser();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    // Start animations sequence
    startAnimations();
    initializeApp();
    
    // Progress bar animation - 10 second duration
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Delay before finishing to show complete animation
          setTimeout(() => {
            onFinish();
          }, 300);
          return 100;
        }
        return prev + 0.5;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [getCurrentUser]);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const startAnimations = () => {
    // Fade in background
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Scale and rotate logo
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    // Slide in text
    Animated.timing(textSlideAnim, {
      toValue: 0,
      duration: 1200,
      delay: 500,
      useNativeDriver: true,
    }).start();
  };

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          {/* Educational background elements */}
          <View style={styles.educationalBackground}>
            <EducationalElement icon="book-open-page-variant" position={{ top: '10%', left: '5%' }} delay={0} />
            <EducationalElement icon="pencil" position={{ top: '15%', right: '8%' }} delay={200} />
            <EducationalElement icon="lightbulb-on" position={{ bottom: '25%', left: '10%' }} delay={400} />
            <EducationalElement icon="brain" position={{ bottom: '20%', right: '5%' }} delay={600} />
            <EducationalElement icon="chart-line" position={{ top: '50%', left: '3%' }} delay={300} />
            <EducationalElement icon="school" position={{ top: '45%', right: '4%' }} delay={500} />
          </View>

          {/* Floating particles background */}
          <View style={styles.particlesContainer}>
            {[...Array(25)].map((_, index) => (
              <FloatingParticle key={index} delay={index * 150} />
            ))}
          </View>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [
                    { scale: scaleAnim },
                    { rotate: logoRotate }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoBackground}
              >
                <View style={styles.logoInner}>
                  <MaterialCommunityIcons 
                    name="school" 
                    size={90} 
                    color="#fff" 
                  />
                </View>
              </LinearGradient>
            </Animated.View>

            <Animated.View
              style={[
                styles.textContainer,
                {
                  transform: [{ translateY: textSlideAnim }]
                }
              ]}
            >
              <Text style={styles.appName}>MentIQ</Text>
              <Text style={styles.tagline}>Learn • Grow • Excel</Text>
            </Animated.View>
          </View>

          {/* Loading Section */}
          <View style={styles.loadingSection}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                        extrapolate: 'clamp',
                      }),
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
            
            <Text style={styles.loadingText}>
              {progress < 30 ? 'Initializing...' :
               progress < 60 ? 'Loading Resources...' :
               progress < 90 ? 'Preparing Experience...' :
               'Almost Ready!'}
            </Text>
          </View>

          {/* Bottom branding */}
          <View style={styles.brandingSection}>
            <Text style={styles.brandingText}>Powered by Innovation</Text>
            <Text style={styles.brandingSubtext}>Made in India 🇮🇳</Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

// Educational element component for background
interface EducationalElementProps {
  icon: string;
  position: { [key: string]: string };
  delay: number;
}

function EducationalElement({ icon, position, delay }: EducationalElementProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 4000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    setTimeout(startAnimation, delay);
  }, [delay]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -20, 0],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.educationalElement,
        position,
        {
          opacity: 0.15,
          transform: [
            { translateY },
            { rotate },
          ],
        },
      ]}
    >
      <MaterialCommunityIcons 
        name={icon as any} 
        size={50} 
        color="#fff" 
      />
    </Animated.View>
  );
}

// Floating particle component
function FloatingParticle({ delay }: { delay: number }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacityValue, {
              toValue: 0.6,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityValue, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    setTimeout(startAnimation, delay);
  }, [delay]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [height + 50, -50],
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: Math.random() * width,
          opacity: opacityValue,
          transform: [
            { translateY },
            { translateX },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  educationalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  educationalElement: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
  },
  logoSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  logoInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 15,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 17,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  loadingSection: {
    width: '100%',
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBackground: {
    width: '85%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 8,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  loadingText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  brandingSection: {
    alignItems: 'center',
  },
  brandingText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  brandingSubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
