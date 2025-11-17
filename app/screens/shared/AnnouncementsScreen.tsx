import { useAnnouncementStore, type Attachment } from '@/store/announcementStore';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { ActivityIndicator, FAB, Searchbar, Text } from 'react-native-paper';

function AnnouncementsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { announcements, isLoading, fetchCourseAnnouncements, fetchSchoolAnnouncements, fetchSubjectAnnouncements, fetchAllAnnouncements, deleteAnnouncement } = useAnnouncementStore();
  const { courses } = useCourseStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'school' | 'subject'>('all');
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState<Array<{uri: string}>>([]);

  useEffect(() => {
    // Fetch announcements based on selected filter
    if (selectedFilter === 'all') {
      fetchAllAnnouncements();
    } else if (selectedFilter === 'school') {
      fetchSchoolAnnouncements();
    } else if (selectedFilter === 'subject') {
      fetchSubjectAnnouncements();
    }
  }, [selectedFilter]);

  useEffect(() => {
    // Default to showing all announcements
    if (!selectedFilter) {
      setSelectedFilter('all');
    }
  }, []);

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteAnnouncement = (announcementId: number, title: string) => {
    Alert.alert(
      'Delete Announcement',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAnnouncement(announcementId);
              // Refresh the announcements list
              if (selectedFilter === 'all') {
                fetchAllAnnouncements();
              } else if (selectedFilter === 'school') {
                fetchSchoolAnnouncements();
              } else if (selectedFilter === 'subject') {
                fetchSubjectAnnouncements();
              }
              Alert.alert('Success', 'Announcement deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete announcement');
            }
          },
        },
      ]
    );
  };

  const parseAttachments = (attachmentsStr: string | undefined): Attachment | null => {
    if (!attachmentsStr) return null;
    try {
      return JSON.parse(attachmentsStr);
    } catch (error) {
      console.error('Error parsing attachments:', error);
      return null;
    }
  };

  const handleOpenLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      Alert.alert('Error', 'Unable to open link');
    }
  };

  const handleOpenPdf = async (uri: string) => {
    try {
      if (Platform.OS === 'android') {
        // For Android, use IntentLauncher with MIME type to open with available PDF viewer
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: uri,
          flags: 1,
          type: 'application/pdf',
        });
      } else if (Platform.OS === 'ios') {
        // For iOS, try to open with default PDF viewer
        await IntentLauncher.startActivityAsync('ios.intent.action.VIEW', {
          data: uri,
          flags: 1,
        });
      } else {
        await WebBrowser.openBrowserAsync(uri);
      }
    } catch (error) {
      console.error('PDF open error:', error);
      Alert.alert('Error', 'Unable to open PDF. Make sure you have a PDF viewer installed.');
    }
  };

  const handleImagePress = (images: Array<{name: string; uri: string}>, index: number) => {
    const imageViewerFormat = images.map(img => ({ uri: img.uri }));
    setCurrentImages(imageViewerFormat);
    setCurrentImageIndex(index);
    setImageViewerVisible(true);
  };

  const handleDownloadImage = async (imageUri: string, imageName?: string) => {
    try {
      // Check if it's a local file URI
      const isLocalFile = imageUri.startsWith('file://');
      
      // Check if running in Expo Go
      const isExpoGo = __DEV__ && !Platform.select({ 
        native: false, 
        default: true 
      });

      if (isExpoGo || isLocalFile) {
        // In Expo Go or for local files, show alternative options
        const message = isLocalFile 
          ? 'This is a local image file. You can view it in the image viewer but cannot download it directly.'
          : 'Due to Android permission changes, image download is limited in Expo Go. Please:\n\n1. Use a development build for full functionality\n2. Or manually save the image by long-pressing it';
        
        Alert.alert(
          'Image Access',
          message,
          [
            { text: 'OK', style: 'cancel' }
          ]
        );
        return;
      }

      // Request media library permissions (write only)
      const { status } = await MediaLibrary.requestPermissionsAsync(false);
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library permissions to download images.');
        return;
      }

      // Generate a unique filename if not provided
      const fileName = imageName || `announcement_image_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Download the image
      const downloadResult = await FileSystem.downloadAsync(imageUri, fileUri);
      
      if (downloadResult.status === 200) {
        // Save to media library
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        await MediaLibrary.createAlbumAsync('ELearning Downloads', asset, false);
        
        Alert.alert('Success', 'Image downloaded successfully!');
      } else {
        Alert.alert('Error', 'Failed to download image');
      }
    } catch (error) {
      console.error('Download error:', error);
      
      // Check if it's a local file URI to avoid WebBrowser error
      const isLocalFile = imageUri.startsWith('file://');
      
      if (isLocalFile) {
        Alert.alert(
          'Download Error', 
          'Unable to download local image file. Local files can only be viewed in the image viewer.',
          [{ text: 'OK', style: 'cancel' }]
        );
      } else {
        // Provide fallback for remote images only
        Alert.alert(
          'Download Error', 
          'Unable to download image. This may be due to Expo Go limitations. Consider using a development build for full functionality.',
          [
            { text: 'Open in Browser', onPress: () => WebBrowser.openBrowserAsync(imageUri) },
            { text: 'OK', style: 'cancel' }
          ]
        );
      }
    }
  };

  const renderAnnouncementItem = (announcement: any) => {
    const isSchoolWide = announcement.courseId === null;
    const courseName = isSchoolWide ? null : courses.find(c => c.id === announcement.courseId)?.title;
    const attachments = parseAttachments(announcement.attachments);
    
    return (
      <View key={announcement.id} style={styles.announcementCard}>
        {/* Premium Gradient Header */}
        <LinearGradient
          colors={isSchoolWide ? ['#ff9800', '#ff5722'] : ['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.announcementGradientHeader}
        >
          <View style={styles.announcementHeaderContent}>
            <View style={styles.announcementBadgeContainer}>
              <MaterialCommunityIcons 
                name={isSchoolWide ? "school" : "book-open-page-variant"} 
                size={16} 
                color="#fff" 
              />
              <Text style={styles.announcementBadgeText}>
                {isSchoolWide ? "School-wide" : courseName || "Course"}
              </Text>
            </View>
            <View style={styles.announcementHeaderActions}>
              <Text style={styles.announcementDate}>
                {format(new Date(announcement.createdAt), 'MMM dd')}
              </Text>
              {user?.role === 'teacher' && announcement.teacherId === user.id && (
                <TouchableOpacity
                  onPress={() => handleDeleteAnnouncement(announcement.id, announcement.title)}
                  style={styles.deleteButton}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Card Content */}
        <View style={styles.announcementCardContent}>
          <Text style={styles.announcementTitle} numberOfLines={2}>
            {announcement.title}
          </Text>
          <Text style={styles.announcementContent} numberOfLines={3}>
            {announcement.content}
          </Text>

          {/* Compact Attachments Section */}
          {attachments && ((attachments.images?.length || 0) > 0 || (attachments.pdfs?.length || 0) > 0 || (attachments.links?.length || 0) > 0) && (
            <View style={styles.attachmentsContainer}>
              <View style={styles.attachmentSummary}>
                {attachments.images && attachments.images.length > 0 && (
                  <TouchableOpacity 
                    style={styles.attachmentBadge}
                    onPress={() => handleImagePress(attachments.images!, 0)}
                  >
                    <MaterialCommunityIcons name="image" size={16} color="#667eea" />
                    <Text style={styles.attachmentBadgeText}>{attachments.images.length} Image{attachments.images.length > 1 ? 's' : ''}</Text>
                  </TouchableOpacity>
                )}
                
                {attachments.pdfs && attachments.pdfs.length > 0 && (
                  <TouchableOpacity 
                    style={styles.attachmentBadge}
                    onPress={() => handleOpenPdf(attachments.pdfs![0].uri)}
                  >
                    <MaterialCommunityIcons name="file-pdf-box" size={16} color="#ff9800" />
                    <Text style={styles.attachmentBadgeText}>{attachments.pdfs.length} PDF{attachments.pdfs.length > 1 ? 's' : ''}</Text>
                  </TouchableOpacity>
                )}
                
                {attachments.links && attachments.links.length > 0 && (
                  <TouchableOpacity 
                    style={styles.attachmentBadge}
                    onPress={() => handleOpenLink(attachments.links![0])}
                  >
                    <MaterialCommunityIcons name="link" size={16} color="#4caf50" />
                    <Text style={styles.attachmentBadgeText}>{attachments.links.length} Link{attachments.links.length > 1 ? 's' : ''}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (isLoading && announcements.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.premiumHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>📢 Announcements</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search announcements..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <MaterialCommunityIcons 
              name="view-dashboard" 
              size={16} 
              color={selectedFilter === 'all' ? '#fff' : '#667eea'} 
            />
            <Text style={[styles.filterTabText, selectedFilter === 'all' && styles.filterTabTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'school' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('school')}
          >
            <MaterialCommunityIcons 
              name="school" 
              size={16} 
              color={selectedFilter === 'school' ? '#fff' : '#667eea'} 
            />
            <Text style={[styles.filterTabText, selectedFilter === 'school' && styles.filterTabTextActive]}>
              School-wise
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'subject' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('subject')}
          >
            <MaterialCommunityIcons 
              name="book-open-page-variant" 
              size={16} 
              color={selectedFilter === 'subject' ? '#fff' : '#667eea'} 
            />
            <Text style={[styles.filterTabText, selectedFilter === 'subject' && styles.filterTabTextActive]}>
              Subject
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredAnnouncements}
        renderItem={({ item }) => renderAnnouncementItem(item)}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        scrollEnabled={filteredAnnouncements.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bell-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No announcements</Text>
          </View>
        }
      />

      {user?.role === 'teacher' && (
        <FAB
          icon="bell-plus"
          label="New Announcement"
          onPress={() => navigation.navigate('CreateAnnouncement')}
          style={styles.fab}
        />
      )}

      {/* Image Viewer Modal */}
      <ImageViewing
        images={currentImages}
        imageIndex={currentImageIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        HeaderComponent={({ imageIndex }: { imageIndex: number }) => (
          <View style={styles.imageViewerHeader}>
            <TouchableOpacity
              style={styles.imageViewerButton}
              onPress={() => setImageViewerVisible(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imageViewerButton}
              onPress={() => handleDownloadImage(currentImages[imageIndex]?.uri, `image_${imageIndex + 1}.jpg`)}
            >
              <MaterialCommunityIcons name="download" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumHeader: {
    backgroundColor: '#667eea',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    minHeight: 100,
  },
  headerContent: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
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
  },
  courseSelector: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 4,
  },
  courseTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  courseTabActive: {
    borderBottomColor: '#667eea',
  },
  courseTabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  courseTabTextActive: {
    color: '#667eea',
    fontWeight: '700',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchbar: {
    elevation: 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  announcementCard: {
    marginBottom: 20,
    elevation: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
    overflow: 'hidden',
  },
  announcementHeader: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  announcementTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    lineHeight: 24,
  },
  announcementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    alignSelf: 'flex-start',
  },
  announcementBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  announcementDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  announcementContent: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    borderWidth: 2,
    borderColor: '#667eea',
    marginRight: 12,
    minWidth: 80,
  },
  filterTabActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667eea',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  announcementActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  attachmentsContainer: {
    marginTop: 16,
  },
  attachmentSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  attachmentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  attachmentSection: {
    marginBottom: 12,
  },
  attachmentSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  attachmentScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  imageThumbnail: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    position: 'relative',
    elevation: 3,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageThumbnailImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.08)',
    elevation: 1,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  attachmentItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(102, 126, 234, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  imageViewerHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  imageViewerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementGradientHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  announcementHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  announcementBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  announcementHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  announcementCardContent: {
    padding: 20,
  },
});

// Reusable Premium Header Component
const PremiumHeader = ({ title, badge }: any) => (
  <View style={styles.premiumHeader}>
    <View style={styles.headerContent}>
      <Text style={styles.greeting}>{badge} {title}</Text>
    </View>
  </View>
);

export default AnnouncementsScreen;
