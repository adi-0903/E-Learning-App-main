import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Text, Button, ActivityIndicator, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useQuizStore, QuizQuestion } from '@/store/quizStore';

function QuizScreen({ route, navigation }: any) {
  const { quizId, courseId } = route.params;
  const { user } = useAuthStore();
  const { getQuizById, fetchQuizQuestions, quizQuestions, submitQuizAttempt, recordAnswer } = useQuizStore();
  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const quizData = await getQuizById(quizId);
      setQuiz(quizData);
      await fetchQuizQuestions(quizId);
    } catch (error) {
      console.error('Error loading quiz:', error);
      Alert.alert('Error', 'Failed to load quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!user?.id || !quiz) return;

    Alert.alert(
      'Submit Quiz',
      'Are you sure you want to submit? You cannot change your answers after submission.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              let correctCount = 0;
              const timeSpent = Math.floor((Date.now() - startTime) / 1000);
              const attemptId = await submitQuizAttempt({
                studentId: user.id,
                quizId,
                score: 0,
                totalQuestions: quizQuestions.length,
                correctAnswers: 0,
                attemptedAt: new Date().toISOString(),
                timeSpent,
              });

              for (const question of quizQuestions) {
                const studentAnswer = answers[question.id] || '';
                const isCorrect = studentAnswer === question.correctAnswer;
                if (isCorrect) correctCount++;
                await recordAnswer(attemptId, question.id, studentAnswer, isCorrect);
              }

              const score = (correctCount / quizQuestions.length) * 100;
              navigation.navigate('QuizResult', {
                quizId,
                courseId,
                score,
                correctAnswers: correctCount,
                totalQuestions: quizQuestions.length,
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to submit quiz');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (!quiz || quizQuestions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>Quiz not found</Text>
      </View>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const options = currentQuestion.options ? JSON.parse(currentQuestion.options) : [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{quiz.title}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {quizQuestions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <Card style={styles.questionCard}>
          <Card.Content>
            <Text style={styles.questionText}>{currentQuestion.questionText}</Text>

            {currentQuestion.questionType === 'multiple_choice' && (
              <View style={styles.optionsContainer}>
                {options.map((option: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionItem}
                    onPress={() => handleAnswerChange(currentQuestion.id, option)}
                  >
                    <RadioButton
                      value={option}
                      status={
                        answers[currentQuestion.id] === option ? 'checked' : 'unchecked'
                      }
                      onPress={() => handleAnswerChange(currentQuestion.id, option)}
                    />
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {currentQuestion.questionType === 'true_false' && (
              <View style={styles.optionsContainer}>
                {['True', 'False'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.optionItem}
                    onPress={() => handleAnswerChange(currentQuestion.id, option)}
                  >
                    <RadioButton
                      value={option}
                      status={
                        answers[currentQuestion.id] === option ? 'checked' : 'unchecked'
                      }
                      onPress={() => handleAnswerChange(currentQuestion.id, option)}
                    />
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        <View style={styles.navigationButtons}>
          <Button
            mode="outlined"
            onPress={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            style={styles.navButton}
          >
            Previous
          </Button>

          {currentQuestionIndex === quizQuestions.length - 1 ? (
            <Button
              mode="contained"
              onPress={handleSubmitQuiz}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.navButton}
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              style={styles.navButton}
            >
              Next
            </Button>
          )}
        </View>
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
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1976d2',
  },
  questionCard: {
    marginBottom: 20,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  navButton: {
    flex: 1,
  },
});

export default QuizScreen;
