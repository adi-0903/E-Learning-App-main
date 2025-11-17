import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useCourseStore } from '@/store/courseStore';

function CreateLessonScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const { createLesson, fetchLessons } = useCourseStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [sequenceNumber, setSequenceNumber] = useState('1');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateLesson = async () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a lesson title');
      return;
    }

    setIsLoading(true);
    try {
      await createLesson({
        courseId,
        title,
        description,
        content,
        videoUrl,
        fileUrl,
        sequenceNumber: parseInt(sequenceNumber) || 1,
      });

      await fetchLessons(courseId);
      Alert.alert('Success', 'Lesson created successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create lesson');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Lesson</Text>
      </View>

      <View style={styles.content}>
        <TextInput
          label="Lesson Title *"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          textColor="#333"
          editable={!isLoading}
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
          textColor="#333"
          editable={!isLoading}
        />

        <TextInput
          label="Content"
          value={content}
          onChangeText={setContent}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          textColor="#333"
          editable={!isLoading}
        />

        <TextInput
          label="Video URL (optional)"
          value={videoUrl}
          onChangeText={setVideoUrl}
          mode="outlined"
          style={styles.input}
          textColor="#333"
          editable={!isLoading}
        />

        <TextInput
          label="PDF Notes URL (optional)"
          value={fileUrl}
          onChangeText={setFileUrl}
          mode="outlined"
          style={styles.input}
          textColor="#333"
          editable={!isLoading}
        />

        <TextInput
          label="Sequence Number"
          value={sequenceNumber}
          onChangeText={setSequenceNumber}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          textColor="#333"
          editable={!isLoading}
        />

        <Button
          mode="contained"
          onPress={handleCreateLesson}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
        >
          Create Lesson
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976d2',
    padding: 16,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
});

export default CreateLessonScreen;
