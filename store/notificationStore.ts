import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface NotificationSettings {
  announcements: boolean;
  assignments: boolean;
  quizzes: boolean;
  courses: boolean;
  general: boolean;
  sound: boolean;
  vibration: boolean;
  emailNotifications: boolean;
}

interface NotificationState {
  settings: NotificationSettings;
  unreadCount: number;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
  setUnreadCount: (count: number) => void;
}

const defaultSettings: NotificationSettings = {
  announcements: true,
  assignments: true,
  quizzes: true,
  courses: true,
  general: true,
  sound: true,
  vibration: true,
  emailNotifications: false,
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  settings: defaultSettings,
  unreadCount: 0,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const storedSettings = await AsyncStorage.getItem('notificationSettings');
      const storedCount = await AsyncStorage.getItem('unreadNotificationCount');
      
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        set({ settings: { ...defaultSettings, ...parsedSettings } });
      }
      
      if (storedCount) {
        set({ unreadCount: parseInt(storedCount, 10) || 0 });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (newSettings: Partial<NotificationSettings>) => {
    try {
      const currentSettings = get().settings;
      const updatedSettings = { ...currentSettings, ...newSettings };
      
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  },

  incrementUnreadCount: () => {
    const newCount = get().unreadCount + 1;
    set({ unreadCount: newCount });
    AsyncStorage.setItem('unreadNotificationCount', newCount.toString());
  },

  resetUnreadCount: () => {
    set({ unreadCount: 0 });
    AsyncStorage.setItem('unreadNotificationCount', '0');
  },

  setUnreadCount: (count: number) => {
    set({ unreadCount: count });
    AsyncStorage.setItem('unreadNotificationCount', count.toString());
  },
}));
