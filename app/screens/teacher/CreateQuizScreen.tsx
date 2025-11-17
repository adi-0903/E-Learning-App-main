import { useQuizStore } from '@/store/quizStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, FAB, Text, TextInput } from 'react-native-paper';

function CreateQuizScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const { createQuiz, fetchCourseQuizzes } = useQuizStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalQuestions, setTotalQuestions] = useState('5');
  const [passingScore, setPassingScore] = useState('70');
  const [timeLimit, setTimeLimit] = useState('600');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }

    if (options.some(opt => !opt.trim())) {
      Alert.alert('Error', 'Please fill in all options');
      return;
    }

    if (!correctAnswer.trim()) {
      Alert.alert('Error', 'Please select a correct answer');
      return;
    }

    const newQuestion = {
      id: Date.now(),
      questionText,
      questionType,
      options,
      correctAnswer,
      sequenceNumber: questions.length + 1,
    };

    setQuestions([...questions, newQuestion]);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setShowAddQuestion(false);
  };

  const handleRemoveQuestion = (questionId: number) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleCreateQuiz = async () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a quiz title');
      return;
    }

    if (questions.length === 0) {
      Alert.alert('Error', 'Please add at least one question');
      return;
    }

    setIsLoading(true);
    try {
      await createQuiz({
        courseId,
        title,
        description,
        totalQuestions: questions.length,
        passingScore: parseInt(passingScore) || 70,
        timeLimit: parseInt(timeLimit) || 600,
      });

      await fetchCourseQuizzes(courseId);
      Alert.alert('Success', 'Quiz created successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create quiz');
    } finally {
      setIsLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Create Quiz</Text>
          <Text style={styles.headerSubtitle}>Add questions and set assessment rules</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <TextInput
            label="Quiz Title *"
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
            label="Passing Score (%)"
            value={passingScore}
            onChangeText={setPassingScore}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            textColor="#333"
            editable={!isLoading}
          />

          <TextInput
            label="Time Limit (seconds)"
            value={timeLimit}
            onChangeText={setTimeLimit}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            textColor="#333"
            editable={!isLoading}
          />

          <Text style={styles.sectionTitle}>Questions ({questions.length})</Text>

          {showAddQuestion && (
            <Card style={styles.questionCard}>
              <Card.Content>
                <TextInput
                  label="Question *"
                  value={questionText}
                  onChangeText={setQuestionText}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  textColor="#333"
                />

                <Text style={styles.optionLabel}>Options:</Text>
                {options.map((option, index) => (
                  <TextInput
                    key={index}
                    label={`Option ${index + 1}`}
                    value={option}
                    onChangeText={(text) => {
                      const newOptions = [...options];
                      newOptions[index] = text;
                      setOptions(newOptions);
                    }}
                    mode="outlined"
                    style={styles.input}
                    textColor="#333"
                  />
                ))}

                <TextInput
                  label="Correct Answer *"
                  value={correctAnswer}
                  onChangeText={setCorrectAnswer}
                  mode="outlined"
                  style={styles.input}
                  textColor="#333"
                />

                <View style={styles.buttonGroup}>
                  <Button
                    mode="contained"
                    onPress={handleAddQuestion}
                    style={styles.halfButton}
                  >
                    Add Question
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => setShowAddQuestion(false)}
                    style={styles.halfButton}
                  >
                    Cancel
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}

          {questions.map((question, index) => (
            <Card key={question.id} style={styles.questionCard}>
              <Card.Content>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Q{index + 1}</Text>
                  <Text style={styles.questionText} numberOfLines={2}>
                    {question.questionText}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveQuestion(question.id)}>
                    <MaterialCommunityIcons name="delete" size={20} color="#f44336" />
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          ))}

          <Button
            mode="contained"
            onPress={handleCreateQuiz}
            loading={isLoading}
            disabled={isLoading || !showAddQuestion === false}
            style={styles.button}
          >
            Create Quiz
          </Button>
        </View>
      </ScrollView>

      {!showAddQuestion && (
        <FAB
          icon="plus"
          label="Add Question"
          onPress={() => setShowAddQuestion(true)}
          style={styles.fab}
        />
      )}
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
  scrollView: {
    flex: 1,
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
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  questionCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  halfButton: {
    flex: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976d2',
    minWidth: 30,
  },
  questionText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CreateQuizScreen;
