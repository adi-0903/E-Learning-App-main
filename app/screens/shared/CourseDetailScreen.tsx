import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button, ActivityIndicator, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCourseStore, Course, Lesson } from '@/store/courseStore';
import { useAuthStore } from '@/store/authStore';

function CourseDetailScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const { user } = useAuthStore();
  const { getCourseById, fetchLessons, lessons } = useCourseStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      const courseData = await getCourseById(courseId);
      setCourse(courseData);
      // Fetch lessons for both students and teachers
      await fetchLessons(courseId);
    } catch (error) {
      Alert.alert('Error', 'Failed to load course details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.centerContainer}>
        <Text>Course not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.premiumHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerBadge}>📖 Course</Text>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {course.title}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Card style={styles.courseCard}>
          <Card.Content>
            <View style={styles.titleSection}>
              <View style={styles.titleIcon}>
                <MaterialCommunityIcons name="book-open" size={28} color="#1976d2" />
              </View>
              <Text style={styles.title}>{course.title}</Text>
            </View>
            
            {course.description && (
              <Text style={styles.description}>{course.description}</Text>
            )}
            
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="clock-outline" size={18} color="#1976d2" />
                <Text style={styles.detailItem}>Duration: {course.duration || 'N/A'}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Course Content</Text>

        {/* Lessons Section */}
        {lessons.length > 0 ? (
          <View style={styles.lessonsSection}>
            <Text style={styles.subsectionTitle}>Lessons ({lessons.length})</Text>
            <FlatList
              data={lessons}
              renderItem={({ item }) => (
                <Card style={styles.lessonCard}>
                  <Card.Content style={styles.lessonContent}>
                    <View style={styles.lessonHeader}>
                      <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#1976d2" />
                      <View style={styles.lessonInfo}>
                        <Text style={styles.lessonTitle} numberOfLines={2}>{item.title}</Text>
                        {item.duration && <Text style={styles.lessonDuration}>{item.duration} min</Text>}
                      </View>
                    </View>
                    {item.description && (
                      <Text style={styles.lessonDescription} numberOfLines={2}>{item.description}</Text>
                    )}
                    <Button
                      mode="contained"
                      onPress={() => navigation.navigate('LessonDetail', { lessonId: item.id, courseId })}
                      style={styles.lessonButton}
                      labelStyle={styles.lessonButtonLabel}
                    >
                      View Lesson
                    </Button>
                  </Card.Content>
                </Card>
              )}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View style={styles.emptyLessons}>
            <MaterialCommunityIcons name="book-open-variant" size={48} color="#ccc" />
            <Text style={styles.emptyLessonsText}>No lessons available yet</Text>
          </View>
        )}

        {user?.role === 'teacher' && (
          <>
            <Card style={styles.actionCard}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#1976d2" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Manage Lessons</Text>
                  <Text style={styles.cardDescription}>Add, edit, or remove lessons</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#1976d2" />
              </Card.Content>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('ManageLessons', { courseId })}
                style={styles.cardButton}
                labelStyle={styles.buttonLabel}
              >
                Go to Lessons
              </Button>
            </Card>

            <Card style={styles.actionCard}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="help-circle" size={28} color="#ff9800" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Manage Quizzes</Text>
                  <Text style={styles.cardDescription}>Create and manage quizzes</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#ff9800" />
              </Card.Content>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('ManageQuizzes', { courseId })}
                style={styles.cardButton}
                labelStyle={styles.buttonLabel}
              >
                Go to Quizzes
              </Button>
            </Card>
          </>
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
  header: {
    backgroundColor: '#1976d2',
    padding: 16,
    paddingTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 28,
  },
  content: {
    padding: 16,
  },
  detailItem: {
    fontSize: 13,
    color: '#666',
    marginVertical: 4,
  },
  courseCard: {
    backgroundColor: '#fff',
    elevation: 3,
    marginBottom: 24,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  titleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  details: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  actionCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#999',
  },
  cardButton: {
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  lessonsSection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  lessonCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 2,
    borderRadius: 12,
  },
  lessonContent: {
    padding: 16,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  lessonDuration: {
    fontSize: 12,
    color: '#999',
  },
  lessonDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  lessonButton: {
    marginTop: 8,
  },
  lessonButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyLessons: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyLessonsText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
});

export default CourseDetailScreen;
