import { create } from 'zustand';
import db from '@/services/database';

export interface Quiz {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  totalQuestions: number;
  passingScore: number;
  timeLimit?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizQuestion {
  id: number;
  quizId: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string;
  correctAnswer: string;
  sequenceNumber: number;
  createdAt?: string;
}

export interface QuizAttempt {
  id: number;
  studentId: number;
  quizId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  attemptedAt: string;
  timeSpent?: number;
}

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  quizQuestions: QuizQuestion[];
  quizAttempts: QuizAttempt[];
  isLoading: boolean;

  // Quiz operations
  fetchCourseQuizzes: (courseId: number) => Promise<void>;
  getQuizById: (quizId: number) => Promise<Quiz | null>;
  createQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  updateQuiz: (quizId: number, updates: Partial<Quiz>) => Promise<void>;
  deleteQuiz: (quizId: number) => Promise<void>;

  // Question operations
  fetchQuizQuestions: (quizId: number) => Promise<void>;
  addQuestion: (question: Omit<QuizQuestion, 'id' | 'createdAt'>) => Promise<void>;
  updateQuestion: (questionId: number, updates: Partial<QuizQuestion>) => Promise<void>;
  deleteQuestion: (questionId: number) => Promise<void>;

  // Attempt operations
  fetchStudentAttempts: (studentId: number, quizId: number) => Promise<void>;
  submitQuizAttempt: (attempt: Omit<QuizAttempt, 'id'>) => Promise<number>;
  recordAnswer: (attemptId: number, questionId: number, answer: string, isCorrect: boolean) => Promise<void>;
}

export const useQuizStore = create<QuizState>((set) => ({
  quizzes: [],
  currentQuiz: null,
  quizQuestions: [],
  quizAttempts: [],
  isLoading: false,

  fetchCourseQuizzes: async (courseId: number) => {
    set({ isLoading: true });
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM quizzes WHERE courseId = ? ORDER BY createdAt DESC',
        [courseId]
      );
      set({ quizzes: result as Quiz[] });
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  getQuizById: async (quizId: number) => {
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM quizzes WHERE id = ?',
        [quizId]
      );
      return result as Quiz | null;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      return null;
    }
  },

  createQuiz: async (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await db.runAsync(
        `INSERT INTO quizzes (courseId, title, description, totalQuestions, passingScore, timeLimit) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [quiz.courseId, quiz.title, quiz.description, quiz.totalQuestions, quiz.passingScore, quiz.timeLimit]
      );
      return result.lastInsertRowId as number;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },

  updateQuiz: async (quizId: number, updates: Partial<Quiz>) => {
    try {
      const setClause = Object.keys(updates)
        .map(key => `${key} = ?`)
        .join(', ');
      const values = Object.values(updates);

      await db.runAsync(
        `UPDATE quizzes SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, quizId]
      );
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  },

  deleteQuiz: async (quizId: number) => {
    try {
      await db.runAsync('DELETE FROM quiz_questions WHERE quizId = ?', [quizId]);
      await db.runAsync('DELETE FROM quiz_attempts WHERE quizId = ?', [quizId]);
      await db.runAsync('DELETE FROM quizzes WHERE id = ?', [quizId]);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  },

  fetchQuizQuestions: async (quizId: number) => {
    set({ isLoading: true });
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM quiz_questions WHERE quizId = ? ORDER BY sequenceNumber ASC',
        [quizId]
      );
      set({ quizQuestions: result as QuizQuestion[] });
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addQuestion: async (question: Omit<QuizQuestion, 'id' | 'createdAt'>) => {
    try {
      await db.runAsync(
        `INSERT INTO quiz_questions (quizId, questionText, questionType, options, correctAnswer, sequenceNumber) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [question.quizId, question.questionText, question.questionType, question.options, question.correctAnswer, question.sequenceNumber]
      );
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  },

  updateQuestion: async (questionId: number, updates: Partial<QuizQuestion>) => {
    try {
      const setClause = Object.keys(updates)
        .map(key => `${key} = ?`)
        .join(', ');
      const values = Object.values(updates);

      await db.runAsync(
        `UPDATE quiz_questions SET ${setClause} WHERE id = ?`,
        [...values, questionId]
      );
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  deleteQuestion: async (questionId: number) => {
    try {
      await db.runAsync('DELETE FROM quiz_answers WHERE questionId = ?', [questionId]);
      await db.runAsync('DELETE FROM quiz_questions WHERE id = ?', [questionId]);
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  fetchStudentAttempts: async (studentId: number, quizId: number) => {
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM quiz_attempts WHERE studentId = ? AND quizId = ? ORDER BY attemptedAt DESC',
        [studentId, quizId]
      );
      set({ quizAttempts: result as QuizAttempt[] });
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
    }
  },

  submitQuizAttempt: async (attempt: Omit<QuizAttempt, 'id'>) => {
    try {
      const result = await db.runAsync(
        `INSERT INTO quiz_attempts (studentId, quizId, score, totalQuestions, correctAnswers, timeSpent) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [attempt.studentId, attempt.quizId, attempt.score, attempt.totalQuestions, attempt.correctAnswers, attempt.timeSpent]
      );
      return result.lastInsertRowId as number;
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }
  },

  recordAnswer: async (attemptId: number, questionId: number, answer: string, isCorrect: boolean) => {
    try {
      await db.runAsync(
        `INSERT INTO quiz_answers (attemptId, questionId, studentAnswer, isCorrect) 
         VALUES (?, ?, ?, ?)`,
        [attemptId, questionId, answer, isCorrect ? 1 : 0]
      );
    } catch (error) {
      console.error('Error recording answer:', error);
      throw error;
    }
  },
}));
