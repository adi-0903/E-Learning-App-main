import { Lesson, useCourseStore } from '@/store/courseStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, FAB, Text } from 'react-native-paper';

function ManageLessonsScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const { lessons, isLoading, fetchLessons, deleteLesson } = useCourseStore();

  useEffect(() => {
    fetchLessons(courseId);
  }, [courseId]);

  const handleDeleteLesson = (lessonId: number, lessonTitle: string) => {
    Alert.alert(
      'Delete Lesson',
      `Are you sure you want to delete "${lessonTitle}"?`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteLesson(lessonId);
              await fetchLessons(courseId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete lesson');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderLessonItem = (lesson: Lesson) => (
    <TouchableOpacity
      key={lesson.id}
      style={styles.lessonItem}
    >
      <View style={styles.lessonInfo}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonSequence}>Lesson {lesson.sequenceNumber}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('CreateLesson', { courseId, lessonId: lesson.id })
          }
          style={styles.actionButton}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#1976d2" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteLesson(lesson.id, lesson.title)}
          style={styles.actionButton}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Manage Lessons</Text>
          <Text style={styles.headerSubtitle}>Organize your course lessons</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={lessons}
        renderItem={({ item }) => renderLessonItem(item)}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="book-open" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No lessons yet</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        label="Add Lesson"
        onPress={() => navigation.navigate('CreateLesson', { courseId })}
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
    padding: 12,
  },
  lessonItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  lessonSequence: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ManageLessonsScreen;
