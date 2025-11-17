import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function QuizResultScreen({ route, navigation }: any) {
  const { score, correctAnswers, totalQuestions, courseId } = route.params;
  const isPassed = score >= 70;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quiz Complete</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.resultCard}>
          <MaterialCommunityIcons
            name={isPassed ? 'check-circle' : 'alert-circle'}
            size={80}
            color={isPassed ? '#4caf50' : '#f44336'}
          />
          <Text style={[styles.resultText, { color: isPassed ? '#4caf50' : '#f44336' }]}>
            {isPassed ? 'Passed!' : 'Not Passed'}
          </Text>
        </View>

        <Card style={styles.scoreCard}>
          <Card.Content>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <Text style={styles.scoreValue}>{Math.round(score)}%</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Correct Answers</Text>
              <Text style={styles.scoreValue}>
                {correctAnswers} / {totalQuestions}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttons}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('CourseDetail', { courseId })}
            style={styles.button}
          >
            Back to Course
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('StudentHome')}
            style={styles.button}
          >
            Go to Home
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976d2',
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  resultCard: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
  },
  scoreCard: {
    marginBottom: 30,
    elevation: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  buttons: {
    gap: 12,
  },
  button: {
    paddingVertical: 8,
  },
});

export default QuizResultScreen;
