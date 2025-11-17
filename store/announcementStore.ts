import db from '@/services/database';
import { create } from 'zustand';

export interface Attachment {
  links?: string[];
  pdfs?: { name: string; uri: string }[];
  images?: { name: string; uri: string }[];
}

export interface Announcement {
  id: number;
  courseId: number | null;
  teacherId: number;
  title: string;
  content: string;
  attachments?: string; // JSON stringified Attachment object
  createdAt: string;
  updatedAt?: string;
}

interface AnnouncementState {
  announcements: Announcement[];
  isLoading: boolean;

  fetchCourseAnnouncements: (courseId: number) => Promise<void>;
  fetchSchoolAnnouncements: () => Promise<void>;
  fetchSubjectAnnouncements: () => Promise<void>;
  fetchAllAnnouncements: () => Promise<void>;
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAnnouncement: (announcementId: number, updates: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (announcementId: number) => Promise<void>;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  announcements: [],
  isLoading: false,

  fetchCourseAnnouncements: async (courseId: number) => {
    set({ isLoading: true });
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM announcements WHERE courseId = ? ORDER BY createdAt DESC',
        [courseId]
      );
      set({ announcements: result as Announcement[] });
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSchoolAnnouncements: async () => {
    set({ isLoading: true });
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM announcements WHERE courseId IS NULL ORDER BY createdAt DESC'
      );
      set({ announcements: result as Announcement[] });
    } catch (error) {
      console.error('Error fetching school announcements:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSubjectAnnouncements: async () => {
    set({ isLoading: true });
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM announcements WHERE courseId IS NOT NULL ORDER BY createdAt DESC'
      );
      set({ announcements: result as Announcement[] });
    } catch (error) {
      console.error('Error fetching subject announcements:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllAnnouncements: async () => {
    set({ isLoading: true });
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM announcements ORDER BY createdAt DESC'
      );
      set({ announcements: result as Announcement[] });
    } catch (error) {
      console.error('Error fetching all announcements:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createAnnouncement: async (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const attachmentsJson = announcement.attachments ? JSON.stringify(announcement.attachments) : null;
      const currentTimestamp = new Date().toISOString();
      await db.runAsync(
        'INSERT INTO announcements (courseId, teacherId, title, content, attachments, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [announcement.courseId, announcement.teacherId, announcement.title, announcement.content, attachmentsJson, currentTimestamp, currentTimestamp]
      );
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  updateAnnouncement: async (announcementId: number, updates: Partial<Announcement>) => {
    try {
      const setClause = Object.keys(updates)
        .map(key => `${key} = ?`)
        .join(', ');
      const values = Object.values(updates);

      await db.runAsync(
        `UPDATE announcements SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, announcementId]
      );
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  deleteAnnouncement: async (announcementId: number) => {
    try {
      await db.runAsync('DELETE FROM announcements WHERE id = ?', [announcementId]);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },
}));
