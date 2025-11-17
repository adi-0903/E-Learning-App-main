import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, ProgressBar, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import { useCourseStore } from '@/store/courseStore';

function StudentProgressScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { enrollments, isLoading, fetchStudentEnrollments } = useProgressStore();
  const { courses, fetchEnrolledCourses } = useCourseStore();
  const [courseProgress, setCourseProgress] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchStudentEnrollments(user.id);
      fetchEnrolledCourses(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    // Only show courses that have enrollments
    const progress = enrollments
      .map(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId);
        return {
          ...enrollment,
          courseName: course?.title || 'Unknown Course',
        };
      })
      .filter(item => item.courseName !== 'Unknown Course'); // Filter out courses not found
    setCourseProgress(progress);
  }, [enrollments, courses]);

  const renderProgressCard = (item: any) => (
    <Card key={item.id} style={styles.progressCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.courseName} numberOfLines={2}>
            {item.courseName}
          </Text>
          <Text style={styles.progressText}>
            {Math.round(item.completionPercentage)}%
          </Text>
        </View>
        <ProgressBar
          progress={item.completionPercentage / 100}
          style={styles.progressBar}
          color={item.completionPercentage >= 100 ? '#4caf50' : '#1976d2'}
        />
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text
            style={[
              styles.statusValue,
              {
                color:
                  item.status === 'completed'
                    ? '#4caf50'
                    : item.status === 'dropped'
                    ? '#f44336'
                    : '#1976d2',
              },
            ]}
          >
            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Active'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  const completedCourses = courseProgress.filter(
    c => c.completionPercentage >= 100
  ).length;
  const totalCourses = courseProgress.length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.premiumHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>📊 Your Progress</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons
              name="book-multiple"
              size={32}
              color="#1976d2"
            />
            <View style={styles.statInfo}>
              <Text style={styles.statNumber}>{totalCourses}</Text>
              <Text style={styles.statLabel}>Enrolled Courses</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons
              name="check-circle"
              size={32}
              color="#4caf50"
            />
            <View style={styles.statInfo}>
              <Text style={styles.statNumber}>{completedCourses}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Course Progress</Text>
        {courseProgress.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={64}
              color="#ccc"
            />
            <Text style={styles.emptyText}>No courses enrolled yet</Text>
          </View>
        ) : (
          <FlatList
            data={courseProgress}
            renderItem={({ item }) => renderProgressCard(item)}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
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
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    elevation: 2,
    backgroundColor: '#fff',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  progressSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  progressCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default StudentProgressScreen;
