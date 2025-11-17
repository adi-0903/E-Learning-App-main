import { useQuizStore } from '@/store/quizStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, FAB, Text } from 'react-native-paper';

function ManageQuizzesScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const { quizzes, isLoading, fetchCourseQuizzes, deleteQuiz } = useQuizStore();

  useEffect(() => {
    fetchCourseQuizzes(courseId);
  }, [courseId]);

  const handleDeleteQuiz = (quizId: number, quizTitle: string) => {
    Alert.alert(
      'Delete Quiz',
      `Are you sure you want to delete "${quizTitle}"?`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteQuiz(quizId);
              await fetchCourseQuizzes(courseId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete quiz');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderQuizItem = (quiz: any) => (
    <TouchableOpacity key={quiz.id} style={styles.quizItem}>
      <View style={styles.quizInfo}>
        <Text style={styles.quizTitle}>{quiz.title}</Text>
        <Text style={styles.quizMeta}>
          {quiz.totalQuestions} questions • {quiz.passingScore}% passing
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('CreateQuiz', { courseId, quizId: quiz.id })
          }
          style={styles.actionButton}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#1976d2" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteQuiz(quiz.id, quiz.title)}
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
          <Text style={styles.headerTitle}>Manage Quizzes</Text>
          <Text style={styles.headerSubtitle}>Create and manage course assessments</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={quizzes}
        renderItem={({ item }) => renderQuizItem(item)}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-list" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No quizzes yet</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        label="Add Quiz"
        onPress={() => navigation.navigate('CreateQuiz', { courseId })}
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
  quizItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  quizMeta: {
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

export default ManageQuizzesScreen;
