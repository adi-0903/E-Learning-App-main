import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('elearning.db');

export const migrateDatabase = async () => {
  try {
    // Check if announcements table exists and has the old schema
    const tableInfo = await db.getAllAsync("PRAGMA table_info(announcements)") as any[];
    const courseIdColumn = tableInfo.find((col: any) => col.name === 'courseId');
    const attachmentsColumn = tableInfo.find((col: any) => col.name === 'attachments');
    
    // Migration 1: Allow NULL courseId
    if (courseIdColumn && courseIdColumn.notnull === 1) {
      console.log('Migrating announcements table to allow NULL courseId...');
      
      // Create new table with correct schema
      await db.execAsync(`
        CREATE TABLE announcements_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          courseId INTEGER,
          teacherId INTEGER NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          attachments TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (courseId) REFERENCES courses(id),
          FOREIGN KEY (teacherId) REFERENCES users(id)
        );
      `);
      
      // Copy data from old table to new table
      await db.execAsync(`
        INSERT INTO announcements_new (id, courseId, teacherId, title, content, createdAt, updatedAt)
        SELECT id, courseId, teacherId, title, content, createdAt, updatedAt FROM announcements;
      `);
      
      // Drop old table and rename new table
      await db.execAsync('DROP TABLE announcements;');
      await db.execAsync('ALTER TABLE announcements_new RENAME TO announcements;');
      
      console.log('Database migration completed successfully');
    }
    
    // Migration 2: Add attachments column if it doesn't exist
    if (!attachmentsColumn) {
      console.log('Adding attachments column to announcements table...');
      try {
        await db.execAsync(`
          ALTER TABLE announcements ADD COLUMN attachments TEXT;
        `);
        console.log('Attachments column added successfully');
      } catch (error) {
        console.log('Attachments column may already exist or migration not needed');
      }
    }
  } catch (error) {
    console.error('Error during database migration:', error);
    // Don't throw error to prevent app crash - migration is optional
  }
};

export const initializeDatabase = async () => {
  try {
    // Users table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('teacher', 'student')),
        profileImage TEXT,
        bio TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Courses table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacherId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        coverImage TEXT,
        duration TEXT,
        level TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacherId) REFERENCES users(id)
      );
    `);

    // Lessons table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courseId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        videoUrl TEXT,
        fileUrl TEXT,
        fileType TEXT,
        duration INTEGER,
        sequenceNumber INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id)
      );
    `);

    // Quizzes table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courseId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        totalQuestions INTEGER,
        passingScore REAL,
        timeLimit INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id)
      );
    `);

    // Quiz Questions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quizId INTEGER NOT NULL,
        questionText TEXT NOT NULL,
        questionType TEXT NOT NULL CHECK(questionType IN ('multiple_choice', 'true_false', 'short_answer')),
        options TEXT,
        correctAnswer TEXT,
        sequenceNumber INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quizId) REFERENCES quizzes(id)
      );
    `);

    // Enrollments table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        courseId INTEGER NOT NULL,
        enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        completionPercentage REAL DEFAULT 0,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'dropped')),
        FOREIGN KEY (studentId) REFERENCES users(id),
        FOREIGN KEY (courseId) REFERENCES courses(id),
        UNIQUE(studentId, courseId)
      );
    `);

    // Lesson Progress table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        lessonId INTEGER NOT NULL,
        isCompleted INTEGER DEFAULT 0,
        completedAt DATETIME,
        timeSpent INTEGER DEFAULT 0,
        FOREIGN KEY (studentId) REFERENCES users(id),
        FOREIGN KEY (lessonId) REFERENCES lessons(id),
        UNIQUE(studentId, lessonId)
      );
    `);

    // Quiz Attempts table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        quizId INTEGER NOT NULL,
        score REAL,
        totalQuestions INTEGER,
        correctAnswers INTEGER,
        attemptedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        timeSpent INTEGER,
        FOREIGN KEY (studentId) REFERENCES users(id),
        FOREIGN KEY (quizId) REFERENCES quizzes(id)
      );
    `);

    // Quiz Answers table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        attemptId INTEGER NOT NULL,
        questionId INTEGER NOT NULL,
        studentAnswer TEXT,
        isCorrect INTEGER,
        FOREIGN KEY (attemptId) REFERENCES quiz_attempts(id),
        FOREIGN KEY (questionId) REFERENCES quiz_questions(id)
      );
    `);

    // Assignments table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courseId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        dueDate DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id)
      );
    `);

    // Assignment Submissions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignmentId INTEGER NOT NULL,
        studentId INTEGER NOT NULL,
        submissionText TEXT,
        submissionFile TEXT,
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        grade REAL,
        feedback TEXT,
        FOREIGN KEY (assignmentId) REFERENCES assignments(id),
        FOREIGN KEY (studentId) REFERENCES users(id)
      );
    `);

    // Announcements table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courseId INTEGER,
        teacherId INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        attachments TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id),
        FOREIGN KEY (teacherId) REFERENCES users(id)
      );
    `);

    console.log('Database initialized successfully');
    
    // Run migration after initialization
    await migrateDatabase();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const clearDatabase = async () => {
  try {
    // Drop all tables to start fresh
    await db.execAsync(`
      DROP TABLE IF EXISTS quiz_answers;
      DROP TABLE IF EXISTS quiz_attempts;
      DROP TABLE IF EXISTS assignment_submissions;
      DROP TABLE IF EXISTS assignments;
      DROP TABLE IF EXISTS announcements;
      DROP TABLE IF EXISTS lesson_progress;
      DROP TABLE IF EXISTS quiz_questions;
      DROP TABLE IF EXISTS quizzes;
      DROP TABLE IF EXISTS lessons;
      DROP TABLE IF EXISTS enrollments;
      DROP TABLE IF EXISTS courses;
      DROP TABLE IF EXISTS users;
    `);
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

export const seedDatabase = async () => {
  try {
    // Check if sample data already exists
    const existingTeacher = await db.getFirstAsync(
      'SELECT id FROM users WHERE email = ?',
      ['teacher1@school.com']
    );

    // Only seed if no sample data exists
    if (existingTeacher) {
      console.log('Database already seeded, skipping seed operation');
      return;
    }

    // Insert sample teachers
    const teacher1 = await db.runAsync(
      `INSERT INTO users (email, password, name, role, bio) 
       VALUES (?, ?, ?, ?, ?)`,
      ['teacher1@school.com', 'password123', 'John Smith', 'teacher', 'Mathematics Teacher']
    );

    const teacher2 = await db.runAsync(
      `INSERT INTO users (email, password, name, role, bio) 
       VALUES (?, ?, ?, ?, ?)`,
      ['teacher2@school.com', 'password123', 'Sarah Johnson', 'teacher', 'Science Teacher']
    );

    // Insert sample students
    const student1 = await db.runAsync(
      `INSERT INTO users (email, password, name, role, bio) 
       VALUES (?, ?, ?, ?, ?)`,
      ['student1@school.com', 'password123', 'Alice Brown', 'student', 'Grade 10 Student']
    );

    const student2 = await db.runAsync(
      `INSERT INTO users (email, password, name, role, bio) 
       VALUES (?, ?, ?, ?, ?)`,
      ['student2@school.com', 'password123', 'Bob Wilson', 'student', 'Grade 10 Student']
    );

    // No seed courses - teachers will create courses through the app
    // This ensures only teacher-created courses appear in the browse list

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

export default db;
