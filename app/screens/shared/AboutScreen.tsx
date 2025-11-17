import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Divider, Text } from 'react-native-paper';

interface AboutScreenProps {
  navigation: any;
}

function AboutScreen({ navigation }: AboutScreenProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.premiumHeader}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>About MentIQ</Text>
          <Text style={styles.headerSubtitle}>Learn more about our platform</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* App Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <MaterialCommunityIcons name="school" size={60} color="#667eea" />
              </View>
              <Text style={styles.appName}>MentIQ</Text>
              <Text style={styles.tagline}>Where Mentorship Meets Intelligence</Text>
              <Text style={styles.version}>Version 1.0.0</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Description Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>About the App</Text>
            <Divider style={styles.divider} />
            <Text style={styles.description}>
              MentIQ is a comprehensive e-learning platform designed to connect students and teachers 
              in a seamless learning environment. Our mission is to make quality education accessible 
              to everyone, anywhere, anytime.
            </Text>
          </Card.Content>
        </Card>

        {/* Features Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Key Features</Text>
            <Divider style={styles.divider} />
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="account-school" size={24} color="#667eea" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>For Students</Text>
                <Text style={styles.featureDescription}>
                  Browse courses, enroll, track progress, and complete lessons at your own pace
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="account-tie" size={24} color="#667eea" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>For Teachers</Text>
                <Text style={styles.featureDescription}>
                  Create courses, add lessons, create quizzes, and monitor student progress
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#667eea" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Progress Tracking</Text>
                <Text style={styles.featureDescription}>
                  Real-time progress monitoring with detailed analytics and completion percentages
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="database" size={24} color="#667eea" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Offline Support</Text>
                <Text style={styles.featureDescription}>
                  All data stored locally with SQLite for fast access and offline capability
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* Contact Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Contact & Support</Text>
            <Divider style={styles.divider} />
            
            <TouchableOpacity style={styles.contactItem}>
              <MaterialCommunityIcons name="email" size={20} color="#667eea" />
              <Text style={styles.contactText}>support@mentiq.com</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <MaterialCommunityIcons name="web" size={20} color="#667eea" />
              <Text style={styles.contactText}>www.mentiq.com</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <MaterialCommunityIcons name="github" size={20} color="#667eea" />
              <Text style={styles.contactText}>github.com/mentiq</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 MentIQ. All rights reserved.</Text>
          <Text style={styles.footerSubtext}>Made In India 🇮🇳</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  premiumHeader: {
    paddingTop: 50,
    paddingBottom: 28,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 3,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  version: {
    fontSize: 12,
    color: '#999',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 12,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'flex-start',
    backgroundColor: '#f8f9ff',
    padding: 12,
    borderRadius: 8,
  },
  featureText: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
  },
  techText: {
    fontSize: 15,
    color: '#555',
    marginLeft: 12,
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
    marginBottom: 10,
  },
  contactText: {
    fontSize: 15,
    color: '#667eea',
    marginLeft: 12,
    fontWeight: '500',
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
});

export default AboutScreen;
