import MainApp from '@/app/MainApp';
import { LoginScreen } from '@/components/LoginScreen';
import { SignupScreen } from '@/components/SignupScreen';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import SplashScreen from './screens/auth/SplashScreen';

type AuthScreen = 'login' | 'signup';

export default function RootApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const { isLoggedIn, user } = useAuthStore();

  // Show splash screen first
  if (showSplash) {
    return (
      <PaperProvider>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      {isLoggedIn && user ? (
        <MainApp />
      ) : authScreen === 'login' ? (
        <LoginScreen
          onLoginSuccess={() => setAuthScreen('login')}
          onNavigateToSignup={() => setAuthScreen('signup')}
        />
      ) : (
        <SignupScreen
          onSignupSuccess={() => setAuthScreen('login')}
          onNavigateToLogin={() => setAuthScreen('login')}
        />
      )}
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
