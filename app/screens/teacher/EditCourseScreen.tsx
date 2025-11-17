import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, ActivityIndicator, Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCourseStore } from '@/store/courseStore';
import { useAuthStore } from '@/store/authStore';

function EditCourseScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const { user } = useAuthStore();
  const { getCourseById, updateCourse, fetchTeacherCourses } = useCourseStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const course = await getCourseById(courseId);
      if (course) {
        setTitle(course.title);
        setDescription(course.description || '');
        setDuration(course.duration || '');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      await updateCourse(courseId, {
        title,
        description,
        duration,
      });

      if (user?.id) {
        await fetchTeacherCourses(user.id);
      }

      Alert.alert('Success', 'Course updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update course');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button onPress={() => navigation.goBack()}>← Back</Button>
        <Text style={styles.headerTitle}>Edit Course</Text>
      </View>

      <View style={styles.content}>
        <TextInput
          label="Course Title *"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          editable={!isSaving}
        />

        <TextInput
          label="Description *"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          editable={!isSaving}
        />

        <TextInput
          label="Duration"
          value={duration}
          onChangeText={setDuration}
          mode="outlined"
          style={styles.input}
          editable={!isSaving}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving}
          style={styles.saveButton}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>

        <Text style={styles.sectionTitle}>Course Content</Text>

        <Card style={styles.actionCard}>
          <Card.Content style={styles.cardContent}>
            <MaterialCommunityIcons name="book-open-page-variant" size={32} color="#1976d2" />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Manage Lessons</Text>
              <Text style={styles.cardDescription}>Add, edit, or remove lessons</Text>
            </View>
          </Card.Content>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ManageLessons', { courseId })}
            style={styles.cardButton}
          >
            Go to Lessons
          </Button>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Content style={styles.cardContent}>
            <MaterialCommunityIcons name="help-circle" size={32} color="#ff9800" />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Manage Quizzes</Text>
              <Text style={styles.cardDescription}>Create and manage quizzes</Text>
            </View>
          </Card.Content>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ManageQuizzes', { courseId })}
            style={styles.cardButton}
          >
            Go to Quizzes
          </Button>
        </Card>
      </View>
    </ScrollView>
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
  header: {
    backgroundColor: '#1976d2',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  actionCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#999',
  },
  cardButton: {
    marginTop: 8,
  },
});

export default EditCourseScreen;
