import { create } from 'zustand';
import db from '@/services/database';

export interface Course {
  id: number;
  teacherId: number;
  teacherName?: string;
  title: string;
  description?: string;
  category?: string;
  coverImage?: string;
  duration?: string;
  level?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  fileUrl?: string;
  fileType?: string;
  duration?: number;
  sequenceNumber: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CourseState {
  courses: Course[];
  lessons: Lesson[];
  currentCourse: Course | null;
  isLoading: boolean;

  // Course operations
  fetchCourses: () => Promise<void>;
  fetchTeacherCourses: (teacherId: number) => Promise<void>;
  fetchEnrolledCourses: (studentId: number) => Promise<void>;
  getCourseById: (courseId: number) => Promise<Course | null>;
  createCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCourse: (courseId: number, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (courseId: number) => Promise<void>;

  // Lesson operations
  fetchLessons: (courseId: number) => Promise<void>;
  getLessonById: (lessonId: number) => Promise<Lesson | null>;
  createLesson: (lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLesson: (lessonId: number, updates: Partial<Lesson>) => Promise<void>;
  deleteLesson: (lessonId: number) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  lessons: [],
  currentCourse: null,
  isLoading: false,

  fetchCourses: async () => {
    set({ isLoading: true });
    try {
      // Fetch only courses created by teachers with teacher name
      const result = await db.getAllAsync(
        'SELECT c.*, u.name as teacherName FROM courses c INNER JOIN users u ON c.teacherId = u.id WHERE u.role = ? ORDER BY c.createdAt DESC',
        ['teacher']
      );
      set({ courses: result as Course[] });
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTeacherCourses: async (teacherId: number) => {
    set({ isLoading: true });
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM courses WHERE teacherId = ? ORDER BY createdAt DESC',
        [teacherId]
      );
      set({ courses: result as Course[] });
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEnrolledCourses: async (studentId: number) => {
    set({ isLoading: true });
    try {
      const result = await db.getAllAsync(
        `SELECT c.* FROM courses c 
         INNER JOIN enrollments e ON c.id = e.courseId 
         WHERE e.studentId = ? ORDER BY c.createdAt DESC`,
        [studentId]
      );
      set({ courses: result as Course[] });
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  getCourseById: async (courseId: number) => {
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM courses WHERE id = ?',
        [courseId]
      );
      return result as Course | null;
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  },

  createCourse: async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await db.runAsync(
        `INSERT INTO courses (teacherId, title, description, category, coverImage, duration, level) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          course.teacherId,
          course.title,
          course.description || null,
          course.category || null,
          course.coverImage || null,
          course.duration || null,
          course.level || null,
        ]
      );
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  updateCourse: async (courseId: number, updates: Partial<Course>) => {
    try {
      const setClause = Object.keys(updates)
        .map(key => `${key} = ?`)
        .join(', ');
      const values = Object.values(updates);

      await db.runAsync(
        `UPDATE courses SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, courseId]
      );
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  deleteCourse: async (courseId: number) => {
    try {
      // Delete related data first
      await db.runAsync('DELETE FROM lessons WHERE courseId = ?', [courseId]);
      await db.runAsync('DELETE FROM quizzes WHERE courseId = ?', [courseId]);
      await db.runAsync('DELETE FROM enrollments WHERE courseId = ?', [courseId]);
      await db.runAsync('DELETE FROM announcements WHERE courseId = ?', [courseId]);
      await db.runAsync('DELETE FROM assignments WHERE courseId = ?', [courseId]);
      await db.runAsync('DELETE FROM courses WHERE id = ?', [courseId]);
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  fetchLessons: async (courseId: number) => {
    set({ isLoading: true });
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM lessons WHERE courseId = ? ORDER BY sequenceNumber ASC',
        [courseId]
      );
      set({ lessons: result as Lesson[] });
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  getLessonById: async (lessonId: number) => {
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM lessons WHERE id = ?',
        [lessonId]
      );
      return result as Lesson | null;
    } catch (error) {
      console.error('Error fetching lesson:', error);
      return null;
    }
  },

  createLesson: async (lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await db.runAsync(
        `INSERT INTO lessons (courseId, title, description, content, videoUrl, fileUrl, fileType, duration, sequenceNumber) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lesson.courseId,
          lesson.title,
          lesson.description || null,
          lesson.content || null,
          lesson.videoUrl || null,
          lesson.fileUrl || null,
          lesson.fileType || null,
          lesson.duration || null,
          lesson.sequenceNumber || 0,
        ]
      );
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  },

  updateLesson: async (lessonId: number, updates: Partial<Lesson>) => {
    try {
      const setClause = Object.keys(updates)
        .map(key => `${key} = ?`)
        .join(', ');
      const values = Object.values(updates);

      await db.runAsync(
        `UPDATE lessons SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, lessonId]
      );
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  },

  deleteLesson: async (lessonId: number) => {
    try {
      await db.runAsync('DELETE FROM lesson_progress WHERE lessonId = ?', [lessonId]);
      await db.runAsync('DELETE FROM lessons WHERE id = ?', [lessonId]);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  },
}));
