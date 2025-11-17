import { create } from 'zustand';
import db from '@/services/database';

export interface LessonProgress {
  id: number;
  studentId: number;
  lessonId: number;
  isCompleted: boolean;
  completedAt?: string;
  timeSpent: number;
}

export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  enrolledAt: string;
  completionPercentage: number;
  status: 'active' | 'completed' | 'dropped';
}

interface ProgressState {
  enrollments: Enrollment[];
  lessonProgress: LessonProgress[];
  isLoading: boolean;

  // Enrollment operations
  enrollInCourse: (studentId: number, courseId: number) => Promise<void>;
  unenrollFromCourse: (studentId: number, courseId: number) => Promise<void>;
  getEnrollment: (studentId: number, courseId: number) => Promise<Enrollment | null>;
  fetchStudentEnrollments: (studentId: number) => Promise<void>;
  updateEnrollmentProgress: (enrollmentId: number, completionPercentage: number) => Promise<void>;

  // Lesson progress operations
  markLessonComplete: (studentId: number, lessonId: number) => Promise<void>;
  markLessonIncomplete: (studentId: number, lessonId: number) => Promise<void>;
  getLessonProgress: (studentId: number, lessonId: number) => Promise<LessonProgress | null>;
  fetchCourseLessonProgress: (studentId: number, courseId: number) => Promise<void>;
  updateLessonTimeSpent: (studentId: number, lessonId: number, timeSpent: number) => Promise<void>;

  // Analytics
  getCourseProgress: (studentId: number, courseId: number) => Promise<number>;
  
  // Teacher analytics
  fetchTeacherStudentProgress: (teacherId: number) => Promise<any[]>;
  fetchCourseStudentProgress: (courseId: number) => Promise<any[]>;
}

export const useProgressStore = create<ProgressState>((set) => ({
  enrollments: [],
  lessonProgress: [],
  isLoading: false,

  enrollInCourse: async (studentId: number, courseId: number) => {
    try {
      // Check if already enrolled
      const existing = await db.getFirstAsync(
        'SELECT id, status FROM enrollments WHERE studentId = ? AND courseId = ?',
        [studentId, courseId]
      );

      if (existing) {
        // If already enrolled and active, skip
        if ((existing as any).status === 'active') {
          throw new Error('Already enrolled in this course');
        }
        // If previously dropped, reactivate the enrollment
        await db.runAsync(
          'UPDATE enrollments SET status = ?, completionPercentage = 0 WHERE studentId = ? AND courseId = ?',
          ['active', studentId, courseId]
        );
      } else {
        // New enrollment
        await db.runAsync(
          'INSERT INTO enrollments (studentId, courseId, completionPercentage, status) VALUES (?, ?, ?, ?)',
          [studentId, courseId, 0, 'active']
        );
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  unenrollFromCourse: async (studentId: number, courseId: number) => {
    try {
      await db.runAsync(
        'DELETE FROM enrollments WHERE studentId = ? AND courseId = ?',
        [studentId, courseId]
      );
    } catch (error) {
      console.error('Error unenrolling from course:', error);
      throw error;
    }
  },

  getEnrollment: async (studentId: number, courseId: number) => {
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM enrollments WHERE studentId = ? AND courseId = ?',
        [studentId, courseId]
      );
      return result as Enrollment | null;
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      return null;
    }
  },

  fetchStudentEnrollments: async (studentId: number) => {
    set({ isLoading: true });
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM enrollments WHERE studentId = ? ORDER BY enrolledAt DESC',
        [studentId]
      );
      set({ enrollments: result as Enrollment[] });
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateEnrollmentProgress: async (enrollmentId: number, completionPercentage: number) => {
    try {
      await db.runAsync(
        'UPDATE enrollments SET completionPercentage = ? WHERE id = ?',
        [completionPercentage, enrollmentId]
      );
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
      throw error;
    }
  },

  markLessonComplete: async (studentId: number, lessonId: number) => {
    try {
      const existing = await db.getFirstAsync(
        'SELECT id FROM lesson_progress WHERE studentId = ? AND lessonId = ?',
        [studentId, lessonId]
      );

      if (existing) {
        await db.runAsync(
          'UPDATE lesson_progress SET isCompleted = 1, completedAt = CURRENT_TIMESTAMP WHERE studentId = ? AND lessonId = ?',
          [studentId, lessonId]
        );
      } else {
        await db.runAsync(
          'INSERT INTO lesson_progress (studentId, lessonId, isCompleted, completedAt) VALUES (?, ?, 1, CURRENT_TIMESTAMP)',
          [studentId, lessonId]
        );
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      throw error;
    }
  },

  markLessonIncomplete: async (studentId: number, lessonId: number) => {
    try {
      await db.runAsync(
        'UPDATE lesson_progress SET isCompleted = 0, completedAt = NULL WHERE studentId = ? AND lessonId = ?',
        [studentId, lessonId]
      );
    } catch (error) {
      console.error('Error marking lesson incomplete:', error);
      throw error;
    }
  },

  getLessonProgress: async (studentId: number, lessonId: number) => {
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM lesson_progress WHERE studentId = ? AND lessonId = ?',
        [studentId, lessonId]
      );
      if (result) {
        return {
          ...(result as any),
          isCompleted: (result as any).isCompleted === 1,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      return null;
    }
  },

  fetchCourseLessonProgress: async (studentId: number, courseId: number) => {
    set({ isLoading: true });
    try {
      const result = await db.getAllAsync(
        `SELECT lp.* FROM lesson_progress lp
         INNER JOIN lessons l ON lp.lessonId = l.id
         WHERE lp.studentId = ? AND l.courseId = ?`,
        [studentId, courseId]
      );
      set({
        lessonProgress: (result as any[]).map(item => ({
          ...item,
          isCompleted: item.isCompleted === 1,
        })),
      });
    } catch (error) {
      console.error('Error fetching course lesson progress:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateLessonTimeSpent: async (studentId: number, lessonId: number, timeSpent: number) => {
    try {
      const existing = await db.getFirstAsync(
        'SELECT id, timeSpent FROM lesson_progress WHERE studentId = ? AND lessonId = ?',
        [studentId, lessonId]
      );

      if (existing) {
        const totalTime = (existing as any).timeSpent + timeSpent;
        await db.runAsync(
          'UPDATE lesson_progress SET timeSpent = ? WHERE studentId = ? AND lessonId = ?',
          [totalTime, studentId, lessonId]
        );
      } else {
        await db.runAsync(
          'INSERT INTO lesson_progress (studentId, lessonId, timeSpent) VALUES (?, ?, ?)',
          [studentId, lessonId, timeSpent]
        );
      }
    } catch (error) {
      console.error('Error updating lesson time spent:', error);
      throw error;
    }
  },

  getCourseProgress: async (studentId: number, courseId: number) => {
    try {
      const result = await db.getFirstAsync(
        `SELECT completionPercentage FROM enrollments 
         WHERE studentId = ? AND courseId = ?`,
        [studentId, courseId]
      );
      return result ? (result as any).completionPercentage : 0;
    } catch (error) {
      console.error('Error getting course progress:', error);
      return 0;
    }
  },

  fetchTeacherStudentProgress: async (teacherId: number) => {
    try {
      const result = await db.getAllAsync(
        `SELECT 
          u.id as studentId,
          u.name as studentName,
          u.email as studentEmail,
          c.id as courseId,
          c.title as courseTitle,
          e.completionPercentage,
          e.enrolledAt,
          e.status,
          COUNT(l.id) as totalLessons,
          COUNT(CASE WHEN lp.isCompleted = 1 THEN 1 END) as completedLessons
        FROM enrollments e
        INNER JOIN users u ON e.studentId = u.id
        INNER JOIN courses c ON e.courseId = c.id
        LEFT JOIN lessons l ON c.id = l.courseId
        LEFT JOIN lesson_progress lp ON l.id = lp.lessonId AND lp.studentId = u.id
        WHERE c.teacherId = ? AND e.status = 'active'
        GROUP BY u.id, c.id
        ORDER BY u.name, c.title`,
        [teacherId]
      );
      return result as any[];
    } catch (error) {
      console.error('Error fetching teacher student progress:', error);
      return [];
    }
  },

  fetchCourseStudentProgress: async (courseId: number) => {
    try {
      const result = await db.getAllAsync(
        `SELECT 
          u.id as studentId,
          u.name as studentName,
          u.email as studentEmail,
          e.completionPercentage,
          e.enrolledAt,
          e.status,
          COUNT(l.id) as totalLessons,
          COUNT(CASE WHEN lp.isCompleted = 1 THEN 1 END) as completedLessons,
          SUM(lp.timeSpent) as totalTimeSpent
        FROM enrollments e
        INNER JOIN users u ON e.studentId = u.id
        LEFT JOIN lessons l ON e.courseId = l.courseId
        LEFT JOIN lesson_progress lp ON l.id = lp.lessonId AND lp.studentId = u.id
        WHERE e.courseId = ? AND e.status = 'active'
        GROUP BY u.id
        ORDER BY u.name`,
        [courseId]
      );
      return result as any[];
    } catch (error) {
      console.error('Error fetching course student progress:', error);
      return [];
    }
  },
}));
