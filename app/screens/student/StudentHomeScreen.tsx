import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import { StudentDashboard } from '@/components/StudentDashboard';

function StudentHomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { fetchStudentEnrollments } = useProgressStore();

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchStudentEnrollments(user.id);
      }
    }, [user?.id])
  );

  return (
    <View style={styles.container}>
      <StudentDashboard
        onCoursePress={(courseId) =>
          navigation.navigate('CourseDetail', { courseId })
        }
        onBrowseCoursesPress={() => navigation.navigate('BrowseCourses')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default StudentHomeScreen;
