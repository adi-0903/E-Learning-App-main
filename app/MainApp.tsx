import { useAuthStore } from '@/store/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens - using absolute imports
// Student screens
import BrowseCoursesScreen from '@/app/screens/student/BrowseCoursesScreen';
import StudentHomeScreen from '@/app/screens/student/StudentHomeScreen';
import StudentProgressScreen from '@/app/screens/student/StudentProgressScreen';

// Teacher screens
import CreateAnnouncementScreen from '@/app/screens/teacher/CreateAnnouncementScreen';
import CreateCourseScreen from '@/app/screens/teacher/CreateCourseScreen';
import CreateLessonScreen from '@/app/screens/teacher/CreateLessonScreen';
import CreateQuizScreen from '@/app/screens/teacher/CreateQuizScreen';
import EditCourseScreen from '@/app/screens/teacher/EditCourseScreen';
import ManageLessonsScreen from '@/app/screens/teacher/ManageLessonsScreen';
import ManageQuizzesScreen from '@/app/screens/teacher/ManageQuizzesScreen';
import TeacherHomeScreen from '@/app/screens/teacher/TeacherHomeScreen';
import TeacherProgressScreen from '@/app/screens/teacher/TeacherProgressScreen';

// Shared screens
import AboutScreen from '@/app/screens/shared/AboutScreen';
import AnnouncementsScreen from '@/app/screens/shared/AnnouncementsScreen';
import CourseDetailScreen from '@/app/screens/shared/CourseDetailScreen';
import LessonDetailScreen from '@/app/screens/shared/LessonDetailScreen';
import ProfileScreen from '@/app/screens/shared/ProfileScreen';
import QuizResultScreen from '@/app/screens/shared/QuizResultScreen';
import QuizScreen from '@/app/screens/shared/QuizScreen';
import NotificationSettingsScreen from './screens/shared/NotificationSettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Student Navigation Stack
function StudentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
      <Stack.Screen name="BrowseCourses" component={BrowseCoursesScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="QuizResult" component={QuizResultScreen} />
    </Stack.Navigator>
  );
}

// Profile Navigation Stack (for both Student and Teacher)
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    </Stack.Navigator>
  );
}

// Teacher Navigation Stack
function TeacherStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
      <Stack.Screen name="CreateCourse" component={CreateCourseScreen} />
      <Stack.Screen name="CreateAnnouncement" component={CreateAnnouncementScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="EditCourse" component={EditCourseScreen} />
      <Stack.Screen name="ManageLessons" component={ManageLessonsScreen} />
      <Stack.Screen name="CreateLesson" component={CreateLessonScreen} />
      <Stack.Screen name="ManageQuizzes" component={ManageQuizzesScreen} />
      <Stack.Screen name="CreateQuiz" component={CreateQuizScreen} />
    </Stack.Navigator>
  );
}

// Student Tab Navigator
function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={StudentStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AnnouncementsTab"
        component={AnnouncementsScreen}
        options={{
          tabBarLabel: 'Announcements',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={StudentProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Teacher Announcements Stack
function TeacherAnnouncementsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AnnouncementsMain" component={AnnouncementsScreen} />
      <Stack.Screen name="CreateAnnouncement" component={CreateAnnouncementScreen} />
    </Stack.Navigator>
  );
}

// Teacher Tab Navigator
function TeacherTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={TeacherStack}
        options={{
          tabBarLabel: 'Courses',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-multiple" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AnnouncementsTab"
        component={TeacherAnnouncementsStack}
        options={{
          tabBarLabel: 'Announcements',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={TeacherProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function MainApp() {
  const { user } = useAuthStore();

  return user?.role === 'teacher' ? <TeacherTabs /> : <StudentTabs />;
}

export default MainApp;
