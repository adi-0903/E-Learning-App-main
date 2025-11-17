import db from '@/services/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'teacher' | 'student';
  bio?: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string, role: 'teacher' | 'student') => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'teacher' | 'student') => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  updateProfile: (name: string, bio: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isLoggedIn: false,

  login: async (email: string, password: string, role: 'teacher' | 'student') => {
    set({ isLoading: true });
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM users WHERE email = ? AND password = ? AND role = ?',
        [email, password, role]
      );

      if (result) {
        const user = result as User;
        set({ user, isLoggedIn: true });
        // Save user session to AsyncStorage
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        // Check if user exists with different role
        const userWithDifferentRole = await db.getFirstAsync(
          'SELECT * FROM users WHERE email = ? AND password = ?',
          [email, password]
        );
        
        if (userWithDifferentRole) {
          const actualUser = userWithDifferentRole as User;
          throw new Error(`This account is registered as a ${actualUser.role}. Please select the correct role.`);
        } else {
          throw new Error('Invalid email or password');
        }
      }
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (email: string, password: string, name: string, role: 'teacher' | 'student') => {
    set({ isLoading: true });
    try {
      // Check if email already exists
      const existing = await db.getFirstAsync(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existing) {
        throw new Error('Email already registered');
      }

      const result = await db.runAsync(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [email, password, name, role]
      );

      // Don't auto-login after signup - user must login manually
      // Account created successfully, user will be redirected to login page
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ user: null, isLoggedIn: false });
    // Clear user session from AsyncStorage
    await AsyncStorage.removeItem('currentUser');
  },

  getCurrentUser: async () => {
    try {
      // Restore user session from AsyncStorage
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData) as User;
        set({ user, isLoggedIn: true });
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  updateProfile: async (name: string, bio: string) => {
    set({ isLoading: true });
    try {
      const state = useAuthStore.getState();
      if (!state.user) {
        throw new Error('No user logged in');
      }

      // Update user in database
      await db.runAsync(
        'UPDATE users SET name = ?, bio = ? WHERE id = ?',
        [name, bio, state.user.id]
      );

      // Update user in state
      const updatedUser = { ...state.user, name, bio };
      set({ user: updatedUser });

      // Update AsyncStorage
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
