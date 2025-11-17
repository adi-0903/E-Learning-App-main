import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Divider, Text, TextInput } from 'react-native-paper';

function ProfileScreen({ navigation }: any) {
  const { user, logout, updateProfile } = useAuthStore();
  const { unreadCount, loadSettings, resetUnreadCount, incrementUnreadCount } = useNotificationStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');

  useEffect(() => {
    loadSettings();
    // Simulate some unread notifications for demo
    if (unreadCount === 0) {
      setTimeout(() => {
        incrementUnreadCount();
        incrementUnreadCount();
        incrementUnreadCount();
      }, 2000);
    }
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    try {
      await updateProfile(name, bio);
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
          Alert.alert('Logged Out', 'You have been successfully logged out.');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.premiumHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>👤 Profile</Text>
        </View>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons
            name="account-circle"
            size={80}
            color="#1976d2"
          />
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              {isEditing ? (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  style={styles.editInput}
                  textColor="#333"
                />
              ) : (
                <Text style={styles.infoValue}>{user?.name}</Text>
              )}
            </View>
            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>
                {user?.role === 'teacher' ? 'Teacher' : 'Student'}
              </Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bio</Text>
              {isEditing ? (
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.editInput}
                  textColor="#333"
                />
              ) : (
                <Text style={styles.infoValue}>{user?.bio || 'No bio added'}</Text>
              )}
            </View>

            <View style={styles.buttonRow}>
              {isEditing ? (
                <>
                  <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.saveButton}
                  >
                    Save
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setIsEditing(false);
                      setName(user?.name || '');
                      setBio(user?.bio || '');
                    }}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  mode="contained"
                  onPress={() => setIsEditing(true)}
                  style={styles.editButton}
                >
                  Edit Profile
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => {
            resetUnreadCount();
            navigation.navigate('NotificationSettings');
          }}
        >
          <View style={styles.settingIconContainer}>
            <MaterialCommunityIcons
              name="bell"
              size={24}
              color="#1976d2"
            />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount.toString()}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.settingText}>Notifications</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#ccc"
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => navigation.navigate('About')}
        >
          <MaterialCommunityIcons
            name="information"
            size={24}
            color="#1976d2"
          />
          <Text style={styles.settingText}>About</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#ccc"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.actionSection}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={styles.logoutButtonLabel}
        >
          Logout
        </Button>
      </View>

      <View style={styles.footer}>
                <Text style={styles.footerText}>© 2025 MentIQ. All rights reserved.</Text>
                <Text style={styles.footerSubtext}>Made In India 🇮🇳</Text>
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
  header: {
    backgroundColor: '#1976d2',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  infoCard: {
    width: '90%',
    elevation: 2,
    backgroundColor: '#fff',
  },
  infoRow: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  editInput: {
    marginTop: 8,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  editButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  divider: {
    marginVertical: 0,
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  actionSection: {
    padding: 16,
    marginTop: 16,
  },
  logoutButton: {
    paddingVertical: 8,
    backgroundColor: '#f44336',
  },
  logoutButtonLabel: {
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0c0000ff',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0e0b0baa',
  },
  settingIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#f44336',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default ProfileScreen;
