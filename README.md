# 📚 E-Learning App - MentiQ

A comprehensive, cross-platform e-learning mobile application built with React Native and Expo. MentiQ enables seamless interaction between teachers and students with features for course management, lesson delivery, quizzes, and real-time progress tracking.

---

## 🎯 Project Overview

**MentiQ** is a full-featured e-learning platform designed to revolutionize digital education. It provides an intuitive interface for both educators and learners, supporting course creation, lesson management, interactive quizzes, and comprehensive progress analytics.

### Key Highlights
- ✅ **Cross-Platform**: iOS, Android, and Web support via Expo
- ✅ **Dual-Role System**: Separate interfaces for Teachers and Students
- ✅ **Real-Time Notifications**: Instant updates on announcements and progress
- ✅ **Offline Support**: Local SQLite database for offline functionality
- ✅ **Modern UI**: Built with React Native Paper and custom components
- ✅ **Type-Safe**: Full TypeScript implementation
- ✅ **State Management**: Zustand for efficient state handling

---

## 📊 Application Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         MentiQ E-Learning App                   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
        ┌───────▼────────┐  ┌────▼────────┐  ┌──▼──────────┐
        │   Expo Router  │  │   Navigation│  │  Auth Store │
        │   (Routing)    │  │  (Tabs/Stack)  │  (Zustand)  │
        └────────────────┘  └────────────┘  └─────────────┘
                │                │                │
        ┌───────┴────────────────┴────────────────┴────────┐
        │                                                   │
    ┌───▼──────────────┐                        ┌──────────▼────┐
    │  Student Module  │                        │ Teacher Module │
    ├──────────────────┤                        ├────────────────┤
    │ • Home Screen    │                        │ • Home Screen  │
    │ • Browse Courses │                        │ • Create Course│
    │ • Course Detail  │                        │ • Manage Lessons
    │ • Take Lessons   │                        │ • Create Quizzes
    │ • Take Quizzes   │                        │ • Announcements│
    │ • View Progress  │                        │ • View Progress│
    └──────────────────┘                        └────────────────┘
        │                                               │
        └───────────────────┬──────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Shared Screens│
                    ├────────────────┤
                    │ • Profile      │
                    │ • Announcements│
                    │ • Settings     │
                    │ • About        │
                    └────────────────┘
                            │
                    ┌───────▼────────────────┐
                    │   Data Layer           │
                    ├───────────────────────┤
                    │ • SQLite Database     │
                    │ • AsyncStorage        │
                    │ • File System         │
                    └───────────────────────┘
```

---

## 🔄 User Flow Diagrams

### Authentication Flow

```
┌─────────────┐
│   App Start │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Check Auth Token │
└──────┬───────────┘
       │
    ┌──┴──┐
    │     │
    ▼     ▼
 YES     NO
    │     │
    │     ▼
    │  ┌──────────────┐
    │  │ Login Screen │
    │  └──────┬───────┘
    │         │
    │    ┌────┴────┐
    │    │         │
    │    ▼         ▼
    │  LOGIN   SIGNUP
    │    │         │
    │    └────┬────┘
    │         │
    │         ▼
    │  ┌──────────────────┐
    │  │ Validate & Store │
    │  │ Auth Token       │
    │  └──────┬───────────┘
    │         │
    └────┬────┘
         │
         ▼
    ┌─────────────────┐
    │ Role Check      │
    └────┬────────────┘
         │
      ┌──┴──┐
      │     │
      ▼     ▼
  STUDENT  TEACHER
      │     │
      ▼     ▼
  ┌──────────────────┐
  │ Load Dashboard   │
  └──────────────────┘
```

### Student Learning Flow

```
┌──────────────────┐
│ Student Dashboard│
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
BROWSE    MY COURSES
COURSES
    │         │
    ▼         ▼
┌──────────────────┐
│ View Course List │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Select Course    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Course Details   │
├──────────────────┤
│ • Description    │
│ • Lessons        │
│ • Progress       │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
LESSONS    QUIZZES
    │         │
    ▼         ▼
┌──────────────────┐
│ View Content     │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
STUDY      TAKE QUIZ
    │         │
    │         ▼
    │    ┌──────────────┐
    │    │ Answer Qs    │
    │    └──────┬───────┘
    │           │
    │           ▼
    │    ┌──────────────┐
    │    │ Submit Quiz  │
    │    └──────┬───────┘
    │           │
    │           ▼
    │    ┌──────────────┐
    │    │ View Results │
    │    └──────────────┘
    │
    └─────────────────┐
                      │
                      ▼
            ┌──────────────────┐
            │ Update Progress  │
            └──────────────────┘
```

### Teacher Management Flow

```
┌──────────────────┐
│ Teacher Dashboard│
└────────┬─────────┘
         │
    ┌────┴────┬────────┬──────────┐
    │         │        │          │
    ▼         ▼        ▼          ▼
COURSES  LESSONS  QUIZZES  ANNOUNCEMENTS
    │         │        │          │
    ▼         ▼        ▼          ▼
┌──────────────────────────────────────┐
│ Management Options                   │
├──────────────────────────────────────┤
│ • Create/Edit/Delete                 │
│ • Manage Content                     │
│ • Track Student Progress             │
│ • Send Announcements                 │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────┐
│ Save to Database │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Notify Students  │
└──────────────────┘
```

---

## 🏗️ Project Structure

```
E-Learning-App-main/
│
├── app/                          # Main application directory
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── explore.tsx
│   │
│   ├── screens/                  # All application screens
│   │   ├── auth/                 # Authentication screens
│   │   ├── student/              # Student-specific screens
│   │   │   ├── StudentHomeScreen.tsx
│   │   │   ├── BrowseCoursesScreen.tsx
│   │   │   └── StudentProgressScreen.tsx
│   │   ├── teacher/              # Teacher-specific screens
│   │   │   ├── TeacherHomeScreen.tsx
│   │   │   ├── CreateCourseScreen.tsx
│   │   │   ├── CreateLessonScreen.tsx
│   │   │   ├── CreateQuizScreen.tsx
│   │   │   ├── ManageLessonsScreen.tsx
│   │   │   ├── ManageQuizzesScreen.tsx
│   │   │   ├── CreateAnnouncementScreen.tsx
│   │   │   └── TeacherProgressScreen.tsx
│   │   └── shared/               # Shared screens for both roles
│   │       ├── ProfileScreen.tsx
│   │       ├── CourseDetailScreen.tsx
│   │       ├── LessonDetailScreen.tsx
│   │       ├── QuizScreen.tsx
│   │       ├── QuizResultScreen.tsx
│   │       ├── AnnouncementsScreen.tsx
│   │       ├── AboutScreen.tsx
│   │       └── NotificationSettingsScreen.tsx
│   │
│   ├── MainApp.tsx               # Main navigation setup
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry point
│
├── components/                   # Reusable React components
│   ├── LoginScreen.tsx           # Login component
│   ├── SignupScreen.tsx          # Signup component
│   ├── StudentDashboard.tsx      # Student dashboard
│   ├── TeacherDashboard.tsx      # Teacher dashboard
│   ├── ui/                       # UI components
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   ├── parallax-scroll-view.tsx
│   └── external-link.tsx
│
├── store/                        # State management (Zustand)
│   ├── authStore.ts              # Authentication state
│   ├── courseStore.ts            # Course management state
│   ├── lessonStore.ts            # Lesson management state
│   ├── quizStore.ts              # Quiz management state
│   └── userStore.ts              # User profile state
│
├── services/                     # Business logic & API calls
│   └── database.ts               # SQLite database service
│
├── hooks/                        # Custom React hooks
│   ├── useColorScheme.ts
│   ├── useThemeColor.ts
│   └── useAuth.ts
│
├── constants/                    # Application constants
│   └── Colors.ts
│
├── assets/                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── Logo.png
│
├── package.json                  # Dependencies & scripts
├── app.json                      # Expo configuration
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.js              # ESLint configuration
└── README.md                     # This file
```

---

## 🛠️ Technology Stack

### Frontend
- **React Native** (v0.81.5) - Cross-platform mobile framework
- **Expo** (v54.0.23) - Development platform and build service
- **TypeScript** (v5.9.2) - Type-safe JavaScript
- **React Navigation** (v7.x) - Navigation library
- **React Native Paper** (v5.12.0) - Material Design components

### State Management
- **Zustand** (v4.4.0) - Lightweight state management

### Storage & Database
- **Expo SQLite** (v16.0.9) - Local database
- **AsyncStorage** (v2.2.0) - Key-value storage
- **Expo File System** (v19.0.17) - File operations

### UI & Icons
- **Expo Vector Icons** (v15.0.3) - Icon library
- **React Native Vector Icons** (v10.0.0) - Additional icons
- **Expo Linear Gradient** (v15.0.7) - Gradient backgrounds

### Media & File Handling
- **Expo Image Picker** (v17.0.8) - Image selection
- **Expo Document Picker** (v14.0.0) - Document selection
- **Expo Media Library** (v18.2.0) - Media access
- **React Native Image Viewing** (v0.2.2) - Image viewer

### Utilities
- **date-fns** (v2.30.0) - Date manipulation
- **Expo Haptics** (v15.0.7) - Haptic feedback
- **Expo Constants** (v18.0.10) - App constants

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (for macOS) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/E-Learning-App-main.git
   cd E-Learning-App-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on specific platform**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run web` | Run on web browser |
| `npm run lint` | Run ESLint for code quality |
| `npm run reset-project` | Reset project to initial state |

---

## 📱 Features

### For Students
- **Course Discovery**: Browse and search available courses
- **Interactive Learning**: Access lessons with rich media content
- **Quiz Assessments**: Take quizzes and get instant feedback
- **Progress Tracking**: Monitor learning progress with detailed analytics
- **Announcements**: Receive important updates from instructors
- **Profile Management**: Manage personal information and preferences
- **Offline Access**: Download and study content offline

### For Teachers
- **Course Management**: Create, edit, and organize courses
- **Lesson Creation**: Add multimedia lessons with descriptions
- **Quiz Builder**: Create interactive quizzes with multiple question types
- **Student Monitoring**: Track individual and class progress
- **Announcements**: Broadcast important messages to students
- **Content Management**: Manage all course materials efficiently
- **Analytics**: View detailed performance metrics

### Shared Features
- **Authentication**: Secure login and signup system
- **User Profiles**: Customizable user profiles
- **Notifications**: Real-time notification system
- **Settings**: Personalized app preferences
- **About Section**: App information and credits

---

## 🗄️ Database Schema

### Core Tables

**Users Table**
```
- id (PRIMARY KEY)
- email (UNIQUE)
- password (hashed)
- name
- role (STUDENT/TEACHER)
- profile_picture
- created_at
- updated_at
```

**Courses Table**
```
- id (PRIMARY KEY)
- teacher_id (FOREIGN KEY)
- title
- description
- category
- thumbnail
- created_at
- updated_at
```

**Lessons Table**
```
- id (PRIMARY KEY)
- course_id (FOREIGN KEY)
- title
- content
- order
- created_at
- updated_at
```

**Quizzes Table**
```
- id (PRIMARY KEY)
- course_id (FOREIGN KEY)
- title
- description
- created_at
- updated_at
```

**Quiz Questions Table**
```
- id (PRIMARY KEY)
- quiz_id (FOREIGN KEY)
- question_text
- options (JSON)
- correct_answer
- order
```

**Student Progress Table**
```
- id (PRIMARY KEY)
- student_id (FOREIGN KEY)
- course_id (FOREIGN KEY)
- completion_percentage
- last_accessed
- updated_at
```

**Quiz Results Table**
```
- id (PRIMARY KEY)
- student_id (FOREIGN KEY)
- quiz_id (FOREIGN KEY)
- score
- total_questions
- answers (JSON)
- completed_at
```

---

## 🔐 Authentication & Security

### Authentication Flow
1. User enters credentials (email/password)
2. Credentials validated against database
3. JWT token generated and stored locally
4. Token included in subsequent requests
5. Token refreshed on app startup

### Security Measures
- ✅ Password hashing using industry-standard algorithms
- ✅ Secure token storage in AsyncStorage
- ✅ HTTPS for all network communications
- ✅ Input validation and sanitization
- ✅ Role-based access control (RBAC)
- ✅ Session management

---

## 🎨 UI/UX Design

### Design Principles
- **Material Design 3**: Modern, clean interface
- **Responsive Layout**: Adapts to all screen sizes
- **Dark Mode Support**: Automatic theme switching
- **Accessibility**: WCAG compliant
- **Haptic Feedback**: Tactile user interactions

### Color Scheme
- **Primary**: Modern blue (#007AFF)
- **Secondary**: Accent colors for emphasis
- **Background**: Light/Dark mode adaptive
- **Text**: High contrast for readability

---

## 📊 State Management with Zustand

### Store Structure

```typescript
// Auth Store
useAuthStore
├── user
├── token
├── isAuthenticated
├── login()
├── logout()
└── signup()

// Course Store
useCourseStore
├── courses
├── selectedCourse
├── fetchCourses()
├── createCourse()
├── updateCourse()
└── deleteCourse()

// Lesson Store
useLessonStore
├── lessons
├── selectedLesson
├── fetchLessons()
├── createLesson()
└── updateLesson()

// Quiz Store
useQuizStore
├── quizzes
├── currentQuiz
├── results
├── submitQuiz()
└── getResults()

// User Store
useUserStore
├── profile
├── preferences
├── updateProfile()
└── updatePreferences()
```

---

## 🧪 Testing

### Testing Strategy
- Unit tests for utility functions
- Component tests for UI components
- Integration tests for user flows
- E2E tests for critical paths

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## 📦 Building for Production

### iOS Build
```bash
eas build --platform ios
```

### Android Build
```bash
eas build --platform android
```

### Web Build
```bash
npm run web
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: App won't start
- **Solution**: Clear cache and reinstall dependencies
  ```bash
  npm cache clean --force
  rm -rf node_modules
  npm install
  ```

**Issue**: Database errors
- **Solution**: Reset the database
  ```bash
  npm run reset-project
  ```

**Issue**: Navigation not working
- **Solution**: Check Expo Router configuration in `app.json`

**Issue**: Permissions denied (Android)
- **Solution**: Grant permissions in app settings or reinstall app

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use meaningful variable names
- Add comments for complex logic
- Maintain consistent formatting

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team & Credits

**Project**: MentiQ E-Learning Platform
**Version**: 1.0.0
**Owner**: adi_09
**Platform**: Expo (iOS, Android, Web)

### Key Contributors
- Development Team
- UI/UX Designers
- Quality Assurance

---

## 📞 Support & Contact

For support, feature requests, or bug reports:
- 📧 Email: support@mentiq.app
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

## 🔗 Useful Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Guide](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

## 📈 Roadmap

### v1.1.0 (Upcoming)
- [ ] Video streaming support
- [ ] Live class features
- [ ] Advanced analytics dashboard
- [ ] Mobile app push notifications
- [ ] Social learning features

### v1.2.0 (Future)
- [ ] AI-powered recommendations
- [ ] Gamification system
- [ ] Peer-to-peer learning
- [ ] Advanced reporting tools
- [ ] API for third-party integrations

---

## ✨ Key Achievements

- ✅ Full-featured e-learning platform
- ✅ Cross-platform compatibility (iOS, Android, Web)
- ✅ Offline functionality
- ✅ Real-time notifications
- ✅ Comprehensive progress tracking
- ✅ Intuitive user interface
- ✅ Type-safe codebase
- ✅ Scalable architecture

---

**Last Updated**: November 2025
**Status**: Active Development
**Maintained By**: Development Team

---

*Made with ❤️ for educators and learners worldwide*
