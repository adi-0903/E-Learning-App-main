import { useAuthStore } from '@/store/authStore';
import { Course, useCourseStore } from '@/store/courseStore';
import { useProgressStore } from '@/store/progressStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Card, Searchbar, Text } from 'react-native-paper';

function BrowseCoursesScreen({ navigation }: any) {
  const { courses, isLoading, fetchCourses } = useCourseStore();
  const { user } = useAuthStore();
  const { enrollInCourse } = useProgressStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Fetch all courses created by teachers
    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [courses, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  const handleEnroll = async (courseId: number) => {
    if (!user?.id) return;
    try {
      await enrollInCourse(user.id, courseId);
      alert('Successfully enrolled in course!');
      // Navigate back to StudentHome to refresh enrolled courses
      navigation.navigate('StudentHome');
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Already enrolled')) {
        alert('You are already enrolled in this course');
      } else {
        alert('Failed to enroll in course: ' + errorMessage);
      }
    }
  };

  const renderCourseCard = (course: Course) => (
    <TouchableOpacity
      key={course.id}
      onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
      style={styles.courseCardContainer}
    >
      <Card style={styles.courseCard}>
        <Card.Content style={styles.cardContent}>
          {/* Course Header */}
          <View style={styles.courseHeader}>
            <View style={styles.courseIconContainer}>
              <MaterialCommunityIcons name="book-open-page-variant" size={32} color="#667eea" />
            </View>
            <View style={styles.courseHeaderText}>
              <Text style={styles.courseTitle} numberOfLines={2}>
                {course.title}
              </Text>
              {course.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{course.category}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Teacher Info */}
          {course.teacherName && (
            <View style={styles.teacherInfo}>
              <MaterialCommunityIcons name="account-tie" size={16} color="#667eea" />
              <Text style={styles.teacherName}>By {course.teacherName}</Text>
            </View>
          )}

          {/* Description */}
          {course.description && (
            <Text style={styles.courseDescription} numberOfLines={3}>
              {course.description}
            </Text>
          )}

          {/* Course Details */}
          {course.duration && (
            <View style={styles.courseDetails}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{course.duration}</Text>
              </View>
            </View>
          )}

          {/* Enroll Button */}
          {user?.role === 'student' && (
            <TouchableOpacity
              style={styles.enrollButton}
              onPress={(e) => {
                e.stopPropagation();
                handleEnroll(course.id);
              }}
            >
              <Text style={styles.enrollButtonText}>Enroll Now</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && courses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.premiumHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>🔍 Browse Courses</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search courses..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={({ item }) => renderCourseCard(item)}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={64}
              color="#ccc"
            />
            <Text style={styles.emptyStateText}>No courses found</Text>
          </View>
        }
      />
    </View>
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
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    width: '100%',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchbar: {
    elevation: 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  listContent: {
    padding: 12,
  },
  courseCardContainer: {
    marginBottom: 16,
  },
  courseCard: {
    elevation: 4,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseHeaderText: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    lineHeight: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: '#667eea',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f8f9ff',
    padding: 8,
    borderRadius: 8,
  },
  teacherName: {
    fontSize: 14,
    color: '#667eea',
    marginLeft: 6,
    fontWeight: '500',
  },
  courseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 14,
    lineHeight: 20,
  },
  courseDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  enrollButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default BrowseCoursesScreen;
