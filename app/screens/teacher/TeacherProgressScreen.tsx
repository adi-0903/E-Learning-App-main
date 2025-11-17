import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Text,
  ActivityIndicator,
  Searchbar,
  ProgressBar,
  Avatar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import { useCourseStore } from '@/store/courseStore';
import { format } from 'date-fns';

interface StudentProgress {
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseTitle: string;
  completionPercentage: number;
  enrolledAt: string;
  status: string;
  totalLessons: number;
  completedLessons: number;
  totalTimeSpent?: number;
}

function TeacherProgressScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { fetchTeacherStudentProgress, fetchCourseStudentProgress } = useProgressStore();
  const { courses, fetchTeacherCourses } = useCourseStore();
  
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [filteredProgress, setFilteredProgress] = useState<StudentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  useEffect(() => {
    loadData();
    fetchTeacherCourses(user!.id);
  }, []);

  useEffect(() => {
    filterProgress();
  }, [studentProgress, searchQuery, selectedCourse]);

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const progress = await fetchTeacherStudentProgress(user.id);
      setStudentProgress(progress);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterProgress = () => {
    let filtered = studentProgress;

    // Filter by course if selected
    if (selectedCourse) {
      filtered = filtered.filter(p => p.courseId === selectedCourse);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProgress(filtered);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 60) return '#ff9800';
    if (percentage >= 40) return '#ffeb3b';
    return '#f44336';
  };

  const getProgressStatus = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 50) return 'Average';
    if (percentage >= 25) return 'Needs Attention';
    return 'Just Started';
  };

  const formatTimeSpent = (seconds: number) => {
    if (!seconds) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderOverviewCard = (item: StudentProgress) => (
    <Card key={`${item.studentId}-${item.courseId}`} style={styles.progressCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.studentInfo}>
            <Avatar.Text
              size={40}
              label={item.studentName.charAt(0).toUpperCase()}
              style={[styles.avatar, { backgroundColor: getProgressColor(item.completionPercentage) }]}
            />
            <View style={styles.studentDetails}>
              <Text style={styles.studentName} numberOfLines={1}>
                {item.studentName}
              </Text>
              <Text style={styles.courseName} numberOfLines={1}>
                {item.courseTitle}
              </Text>
            </View>
          </View>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressPercentage, { color: getProgressColor(item.completionPercentage) }]}>
              {Math.round(item.completionPercentage)}%
            </Text>
            <View style={[styles.statusChip, { backgroundColor: getProgressColor(item.completionPercentage) + '20' }]}>
              <Text style={[styles.statusText, { color: getProgressColor(item.completionPercentage) }]}>
                {getProgressStatus(item.completionPercentage)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressSection}>
          <ProgressBar
            progress={item.completionPercentage / 100}
            color={getProgressColor(item.completionPercentage)}
            style={styles.progressBar}
          />
          <View style={styles.lessonStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="book-open" size={16} color="#666" />
              <Text style={styles.statText}>
                {item.completedLessons}/{item.totalLessons} Lessons
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text style={styles.statText}>
                Enrolled {format(new Date(item.enrolledAt), 'MMM dd')}
              </Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderDetailedCard = (item: StudentProgress) => (
    <Card key={`${item.studentId}-${item.courseId}`} style={styles.detailedCard}>
      <Card.Content>
        <View style={styles.detailedHeader}>
          <Avatar.Text
            size={50}
            label={item.studentName.charAt(0).toUpperCase()}
            style={[styles.avatar, { backgroundColor: getProgressColor(item.completionPercentage) }]}
          />
          <View style={styles.detailedInfo}>
            <Text style={styles.detailedStudentName}>{item.studentName}</Text>
            <Text style={styles.detailedEmail}>{item.studentEmail}</Text>
            <Text style={styles.detailedCourse}>{item.courseTitle}</Text>
          </View>
          <View style={styles.detailedProgress}>
            <Text style={[styles.detailedPercentage, { color: getProgressColor(item.completionPercentage) }]}>
              {Math.round(item.completionPercentage)}%
            </Text>
          </View>
        </View>

        <View style={styles.detailedStats}>
          <View style={styles.detailedStatItem}>
            <MaterialCommunityIcons name="book-check" size={20} color="#4caf50" />
            <Text style={styles.detailedStatLabel}>Completed</Text>
            <Text style={styles.detailedStatValue}>{item.completedLessons}</Text>
          </View>
          <View style={styles.detailedStatItem}>
            <MaterialCommunityIcons name="book-outline" size={20} color="#ff9800" />
            <Text style={styles.detailedStatLabel}>Remaining</Text>
            <Text style={styles.detailedStatValue}>{item.totalLessons - item.completedLessons}</Text>
          </View>
          <View style={styles.detailedStatItem}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#2196f3" />
            <Text style={styles.detailedStatLabel}>Time Spent</Text>
            <Text style={styles.detailedStatValue}>{formatTimeSpent(item.totalTimeSpent || 0)}</Text>
          </View>
        </View>

        <ProgressBar
          progress={item.completionPercentage / 100}
          color={getProgressColor(item.completionPercentage)}
          style={styles.detailedProgressBar}
        />
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="chart-line" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No student progress data</Text>
      <Text style={styles.emptySubtext}>
        Students will appear here once they enroll in your courses
      </Text>
    </View>
  );

  if (isLoading && studentProgress.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading progress data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.premiumHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>📊 Student Progress</Text>
          <Text style={styles.subtitle}>Track your students' learning journey</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <Searchbar
          placeholder="Search students or courses..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          placeholderTextColor="#999"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedCourse === null && styles.filterChipActive]}
            onPress={() => setSelectedCourse(null)}
          >
            <Text style={[styles.filterChipText, selectedCourse === null && styles.filterChipTextActive]}>
              All Courses
            </Text>
          </TouchableOpacity>
          
          {courses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={[styles.filterChip, selectedCourse === course.id && styles.filterChipActive]}
              onPress={() => setSelectedCourse(course.id)}
            >
              <Text style={[styles.filterChipText, selectedCourse === course.id && styles.filterChipTextActive]} numberOfLines={1}>
                {course.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'overview' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('overview')}
          >
            <MaterialCommunityIcons 
              name="view-grid" 
              size={16} 
              color={viewMode === 'overview' ? '#fff' : '#667eea'} 
            />
            <Text style={[styles.viewModeText, viewMode === 'overview' && styles.viewModeTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'detailed' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('detailed')}
          >
            <MaterialCommunityIcons 
              name="view-list" 
              size={16} 
              color={viewMode === 'detailed' ? '#fff' : '#667eea'} 
            />
            <Text style={[styles.viewModeText, viewMode === 'detailed' && styles.viewModeTextActive]}>
              Detailed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress List */}
      <FlatList
        data={filteredProgress}
        renderItem={({ item }) => viewMode === 'overview' ? renderOverviewCard(item) : renderDetailedCard(item)}
        keyExtractor={(item) => `${item.studentId}-${item.courseId}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />
        }
        showsVerticalScrollIndicator={false}
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
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  controlsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchbar: {
    elevation: 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    borderWidth: 1,
    borderColor: '#667eea',
    marginRight: 12,
  },
  filterChipActive: {
    backgroundColor: '#667eea',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewModeButtonActive: {
    backgroundColor: '#667eea',
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  viewModeTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  progressCard: {
    marginBottom: 16,
    elevation: 3,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    minHeight: 120,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    minHeight: 50,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  courseName: {
    fontSize: 12,
    color: '#666',
  },
  progressInfo: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 90,
    paddingLeft: 8,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
  },
  progressSection: {
    marginTop: 12,
    paddingTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
  },
  lessonStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  detailedCard: {
    marginBottom: 16,
    elevation: 3,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  detailedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailedInfo: {
    flex: 1,
    marginLeft: 16,
  },
  detailedStudentName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  detailedEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailedCourse: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  detailedProgress: {
    alignItems: 'center',
  },
  detailedPercentage: {
    fontSize: 24,
    fontWeight: '800',
  },
  detailedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  detailedStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  detailedStatLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailedStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  detailedProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default TeacherProgressScreen;
