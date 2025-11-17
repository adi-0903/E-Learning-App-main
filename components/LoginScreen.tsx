import { useAuthStore } from '@/store/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ActivityIndicator, Text, TextInput } from 'react-native-paper';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToSignup: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToSignup,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const { login, isLoading } = useAuthStore();
  
  const studentBreathingAnim = useRef(new Animated.Value(1)).current;
  const teacherBreathingAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const startBreathingAnimation = (animValue: Animated.Value) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1.05,
            duration: 950,
            useNativeDriver: false,
          }),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 950,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    const stopAnimation = (animValue: Animated.Value) => {
      Animated.timing(animValue, {
        toValue: 1,
        duration: 0,
        useNativeDriver: false,
      }).start();
    };

    if (role === 'student') {
      startBreathingAnimation(studentBreathingAnim);
      stopAnimation(teacherBreathingAnim);
    } else {
      startBreathingAnimation(teacherBreathingAnim);
      stopAnimation(studentBreathingAnim);
    }
  }, [role]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login(email, password, role);
      onLoginSuccess();
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Logo and Header */}
            <View style={styles.header}>
              <Image
                source={require('@/assets/images/Logo.png')}
                style={styles.logoImage}
              />
              <Text style={styles.title}>MentIQ</Text>
              <Text style={styles.subtitle}>Where Mentorship Meets Intelligence</Text>
            </View>

            {/* Login Card */}
            <View style={styles.card}>
              {/* Role Selection */}
              <View style={styles.roleSection}>
                <Text style={styles.roleLabel}>Role: </Text>
                <View style={styles.roleButtons}>
                  <Animated.View style={{ flex: 1, transform: [{ scale: studentBreathingAnim }] }}>
                    <TouchableOpacity
                      style={[styles.roleButton, role === 'student' && styles.roleButtonActive]}
                      onPress={() => setRole('student')}
                      disabled={isLoading}
                    >
                      <MaterialCommunityIcons 
                        name="account-school" 
                        size={24} 
                        color={role === 'student' ? '#667eea' : '#999'} 
                      />
                      <Text style={[styles.roleButtonText, role === 'student' && styles.roleButtonTextActive]}>
                        Student
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>

                  <Animated.View style={{ flex: 1, transform: [{ scale: teacherBreathingAnim }] }}>
                    <TouchableOpacity
                      style={[styles.roleButton, role === 'teacher' && styles.roleButtonActive]}
                      onPress={() => setRole('teacher')}
                      disabled={isLoading}
                    >
                      <MaterialCommunityIcons 
                        name="account-tie" 
                        size={24} 
                        color={role === 'teacher' ? '#667eea' : '#999'} 
                      />
                      <Text style={[styles.roleButtonText, role === 'teacher' && styles.roleButtonTextActive]}>
                        Teacher
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  mode="flat"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  textColor="#333"
                  placeholderTextColor="#999"
                  editable={!isLoading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="flat"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  textColor="#333"
                  placeholderTextColor="#999"
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                      color="#999"
                    />
                  }
                  editable={!isLoading}
                />
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Sign In</Text>
                      <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={onNavigateToSignup} disabled={isLoading}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Decoration */}
            <View style={styles.bottomDecoration}>
              <Text style={styles.decorationText}>Secure • Fast • Reliable</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  roleSection: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#333',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
    gap: 8,
  },
  roleButtonActive: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  roleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  roleButtonTextActive: {
    color: '#667eea',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 15,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomDecoration: {
    alignItems: 'center',
    marginTop: 30,
  },
  decorationText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
});
