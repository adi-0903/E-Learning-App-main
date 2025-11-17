import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { TeacherDashboard } from '@/components/TeacherDashboard';

function TeacherHomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { fetchTeacherCourses } = useCourseStore();

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchTeacherCourses(user.id);
      }
    }, [user?.id])
  );

  return (
    <View style={styles.container}>
      <TeacherDashboard
        onCoursePress={(courseId) =>
          navigation.navigate('CourseDetail', { courseId })
        }
        onCreateCoursePress={() => navigation.navigate('CreateCourse')}
        onCreateAnnouncementPress={() => navigation.navigate('CreateAnnouncement')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TeacherHomeScreen;
