import { useNotificationStore } from '@/store/notificationStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Switch, Text } from 'react-native-paper';

function NotificationSettingsScreen({ navigation }: any) {
  const { settings, isLoading, loadSettings, updateSettings } = useNotificationStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggle = async (key: keyof typeof settings, value: boolean) => {
    try {
      await updateSettings({ [key]: value });
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  const settingSections = [
    {
      title: 'Content Notifications',
      icon: 'bell-outline',
      settings: [
        { key: 'announcements', label: 'Announcements', description: 'Get notified about new announcements' },
        { key: 'assignments', label: 'Assignments', description: 'Notifications for new assignments and due dates' },
        { key: 'quizzes', label: 'Quizzes', description: 'Quiz notifications and reminders' },
        { key: 'courses', label: 'Courses', description: 'Course updates and new lessons' },
        { key: 'general', label: 'General', description: 'System updates and important messages' },
      ]
    },
    {
      title: 'Notification Style',
      icon: 'volume-high',
      settings: [
        { key: 'sound', label: 'Sound', description: 'Play notification sounds' },
        { key: 'vibration', label: 'Vibration', description: 'Vibrate for notifications' },
      ]
    },
    {
      title: 'External Notifications',
      icon: 'email-outline',
      settings: [
        { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.premiumHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>🔔 Notification Settings</Text>
        </View>
      </View>

      <View style={styles.content}>
        {settingSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name={section.icon as any}
                  size={24}
                  color="#667eea"
                />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>

              {section.settings.map((setting, settingIndex) => (
                <View key={setting.key} style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>{setting.label}</Text>
                    <Text style={styles.settingDescription}>{setting.description}</Text>
                  </View>
                  <Switch
                    value={settings[setting.key as keyof typeof settings] as boolean}
                    onValueChange={(value) => handleToggle(setting.key as keyof typeof settings, value)}
                    color="#667eea"
                    disabled={isLoading}
                  />
                </View>
              ))}
            </Card.Content>
          </Card>
        ))}

        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons
                name="information-outline"
                size={24}
                color="#ff9800"
              />
              <Text style={styles.infoTitle}>About Notifications</Text>
            </View>
            <Text style={styles.infoText}>
              Customize your notification preferences to stay updated with the content that matters most to you. 
              You can always change these settings later.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  premiumHeader: {
    backgroundColor: '#667eea',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    minHeight: 100,
  },
  headerContent: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
  },
  sectionCard: {
    marginBottom: 16,
    elevation: 3,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  infoCard: {
    marginTop: 8,
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default NotificationSettingsScreen;
