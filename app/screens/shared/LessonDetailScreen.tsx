import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Card, Text, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { useProgressStore } from '@/store/progressStore';

function LessonDetailScreen({ route, navigation }: any) {
  const { lessonId, courseId } = route.params;
  const { user } = useAuthStore();
  const { getLessonById } = useCourseStore();
  const { getLessonProgress, markLessonComplete, updateLessonTimeSpent } = useProgressStore();
  const [lesson, setLesson] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadLesson();
    return () => {
      if (user?.role === 'student' && user.id) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        updateLessonTimeSpent(user.id, lessonId, timeSpent);
      }
    };
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      const lessonData = await getLessonById(lessonId);
      setLesson(lessonData);

      if (user?.role === 'student' && user.id) {
        const progress = await getLessonProgress(user.id, lessonId);
        setIsCompleted(progress?.isCompleted || false);
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      Alert.alert('Error', 'Failed to load lesson');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!user?.id) return;
    try {
      await markLessonComplete(user.id, lessonId);
      setIsCompleted(true);
      Alert.alert('Success', 'Lesson marked as complete!');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark lesson as complete');
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleOpenVideo = async () => {
    if (lesson?.videoUrl) {
      if (!isValidUrl(lesson.videoUrl)) {
        Alert.alert('Error', 'Invalid video URL');
        return;
      }
      try {
        await Linking.openURL(lesson.videoUrl);
      } catch (error) {
        Alert.alert('Error', 'Could not open video');
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.centerContainer}>
        <Text>Lesson not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Premium Header */}
      <View style={styles.premiumHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerBadge}>📚 Lesson</Text>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {lesson.title}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Video Section */}
        {lesson.videoUrl && (
          <Card style={styles.videoCard}>
            <Card.Content style={styles.videoContent}>
              <View style={styles.videoIconContainer}>
                <MaterialCommunityIcons
                  name="play-circle"
                  size={56}
                  color="#fff"
                />
              </View>
              <Text style={styles.videoText}>Video Lesson</Text>
              <Text style={styles.videoSubtext}>Click to play the video content</Text>
              <Button
                mode="contained"
                onPress={handleOpenVideo}
                style={styles.playButton}
                labelStyle={styles.playButtonLabel}
              >
                ▶ Play Video
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Duration and Info */}
        {lesson.duration && (
          <View style={styles.infoBar}>
            <MaterialCommunityIcons name="clock-outline" size={18} color="#1976d2" />
            <Text style={styles.infoText}>{lesson.duration} minutes</Text>
          </View>
        )}

        {/* Description Section */}
        {lesson.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="text-box-outline" size={20} color="#1976d2" />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.description}>{lesson.description}</Text>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Content Section */}
        {lesson.content && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="book-open-page-variant" size={20} color="#1976d2" />
              <Text style={styles.sectionTitle}>Lesson Content</Text>
            </View>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.contentText}>{lesson.content}</Text>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* File Section */}
        {lesson.fileUrl && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color="#ff9800" />
              <Text style={styles.sectionTitle}>Resources</Text>
            </View>
            <Card style={styles.fileCard}>
              <Card.Content style={styles.fileContent}>
                <View style={styles.fileIconContainer}>
                  <MaterialCommunityIcons
                    name="file-document"
                    size={32}
                    color="#fff"
                  />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{lesson.fileType || 'Attached File'}</Text>
                  <Text style={styles.fileSize}>Tap to download</Text>
                </View>
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => {
                    if (isValidUrl(lesson.fileUrl)) {
                      Linking.openURL(lesson.fileUrl).catch(() => {
                        Alert.alert('Error', 'Could not open file');
                      });
                    } else {
                      Alert.alert('Error', 'Invalid file URL');
                    }
                  }}
                >
                  <MaterialCommunityIcons
                    name="download"
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Student Actions */}
        {user?.role === 'student' && (
          <View style={styles.studentActions}>
            <Button
              mode={isCompleted ? 'outlined' : 'contained'}
              onPress={handleMarkComplete}
              style={[styles.completeButton, isCompleted && styles.completedButton]}
              labelStyle={styles.completeButtonLabel}
            >
              {isCompleted ? '✓ Completed' : 'Mark as Complete'}
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumHeader: {
    backgroundColor: '#667eea',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  backButton: {
    padding: 4,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 28,
  },
  header: {
    backgroundColor: '#1976d2',
    padding: 16,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#667eea',
  },
  card: {
    marginBottom: 0,
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  videoCard: {
    marginBottom: 24,
    elevation: 6,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0,
  },
  videoContent: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    backgroundColor: '#667eea',
  },
  videoIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  videoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  videoSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 20,
  },
  playButton: {
    marginTop: 16,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  playButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#e8eef7',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  infoText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
  },
  contentText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
  },
  fileCard: {
    marginBottom: 0,
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  fileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  fileIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 13,
    color: '#999',
  },
  downloadButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  studentActions: {
    marginTop: 40,
    marginBottom: 24,
  },
  completeButton: {
    marginTop: 0,
    marginBottom: 0,
    paddingVertical: 10,
    borderRadius: 12,
  },
  completedButton: {
    borderColor: '#4caf50',
  },
  completeButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LessonDetailScreen;
