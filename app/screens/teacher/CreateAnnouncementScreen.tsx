import { useAnnouncementStore } from '@/store/announcementStore';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as IntentLauncher from 'expo-intent-launcher';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, Chip, SegmentedButtons, Text, TextInput } from 'react-native-paper';

function CreateAnnouncementScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { createAnnouncement, fetchAllAnnouncements } = useAnnouncementStore();
  const { courses } = useCourseStore();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [announcementType, setAnnouncementType] = useState<'school' | 'subject'>('school');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(
    courses.length > 0 ? courses[0].id : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [links, setLinks] = useState<string[]>([]);
  const [pdfs, setPdfs] = useState<{ name: string; uri: string }[]>([]);
  const [images, setImages] = useState<{ name: string; uri: string }[]>([]);
  const [newLink, setNewLink] = useState('');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null);

  const addLink = () => {
    if (!newLink.trim()) {
      Alert.alert('Error', 'Please enter a valid link');
      return;
    }
    // Check if it's a PDF link
    if (newLink.toLowerCase().endsWith('.pdf')) {
      const fileName = newLink.split('/').pop()?.split('?')[0] || `PDF_${pdfs.length + 1}`;
      setPdfs([...pdfs, { name: fileName, uri: newLink }]);
    } else {
      setLinks([...links, newLink]);
    }
    setNewLink('');
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const removePdfLink = (index: number) => {
    setPdfs(pdfs.filter((_, i) => i !== index));
  };

  const handlePreviewPdf = (uri: string) => {
    setPreviewUri(uri);
    setPreviewType('pdf');
  };

  const handlePreviewImage = (uri: string) => {
    setPreviewUri(uri);
    setPreviewType('image');
  };

  const closePreview = () => {
    setPreviewUri(null);
    setPreviewType(null);
  };

  const openPdfInApp = async () => {
    if (!previewUri) return;
    try {
      if (Platform.OS === 'android') {
        // For Android, use the file URI directly
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: previewUri,
          flags: 1,
        });
      } else if (Platform.OS === 'ios') {
        // For iOS, try to open with default PDF viewer
        await WebBrowser.openBrowserAsync(previewUri);
      } else {
        // For web, open in browser
        await WebBrowser.openBrowserAsync(previewUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open PDF. Make sure you have a PDF viewer installed.');
    }
  };


  const pickImageFile = async () => {
    try {
      // Request permissions first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library in settings to pick images.'
        );
        return;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      // Check if user cancelled
      if (result.canceled) {
        return;
      }

      // Get the selected image
      if (result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        const fileName = image.uri.split('/').pop() || `Image_${Date.now()}`;
        setImages([...images, { name: fileName, uri: image.uri }]);
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert('Error', error.message || 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCreateAnnouncement = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an announcement title');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter announcement content');
      return;
    }
    if (announcementType === 'subject' && !selectedCourseId) {
      Alert.alert('Error', 'Please select a subject for this announcement');
      return;
    }

    try {
      setIsLoading(true);
      const attachments = {
        links: links.length > 0 ? links : undefined,
        pdfs: pdfs.length > 0 ? pdfs : undefined,
        images: images.length > 0 ? images : undefined,
      };
      
      await createAnnouncement({
        title,
        content,
        courseId: announcementType === 'subject' && selectedCourseId ? selectedCourseId : null,
        teacherId: user!.id,
        attachments: Object.keys(attachments).some(key => attachments[key as keyof typeof attachments]) ? attachments : undefined,
      } as any);
      // Refresh the announcements list to show the new announcement
      await fetchAllAnnouncements();
      
      Alert.alert('Success', 'Announcement created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setTitle('');
            setContent('');
            setAnnouncementType('school');
            setLinks([]);
            setPdfs([]);
            setImages([]);
            navigation.goBack();
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create announcement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Premium Header */}
        <View style={styles.premiumHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <View style={styles.backButtonCircle}>
              <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>📢 Create Announcement</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Announcement Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Announcement Type</Text>
            <SegmentedButtons
              value={announcementType}
              onValueChange={(value: any) => setAnnouncementType(value)}
              buttons={[
                {
                  value: 'school',
                  label: '🏫 School-wide',
                  style: styles.segmentButton,
                  labelStyle: styles.segmentLabel,
                },
                {
                  value: 'subject',
                  label: '📚 Subject-specific',
                  style: styles.segmentButton,
                  labelStyle: styles.segmentLabel,
                },
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          {/* Subject Selection (if subject-specific) */}
          {announcementType === 'subject' && courses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Subject</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.subjectScroll}
              >
                {courses.map((course) => (
                  <TouchableOpacity
                    key={course.id}
                    onPress={() => setSelectedCourseId(course.id)}
                    style={[
                      styles.subjectChip,
                      selectedCourseId === course.id && styles.subjectChipActive,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="book-open-page-variant"
                      size={16}
                      color={selectedCourseId === course.id ? '#fff' : '#667eea'}
                    />
                    <Text
                      style={[
                        styles.subjectChipText,
                        selectedCourseId === course.id && styles.subjectChipTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {course.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Announcement Title</Text>
            <TextInput
              label="Enter title"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
              outlineColor="#e0e0e0"
              activeOutlineColor="#667eea"
              left={<TextInput.Icon icon="format-title" color="#667eea" />}
              maxLength={100}
              placeholder="e.g., Holiday Schedule, Important Notice"
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Announcement Content</Text>
            <TextInput
              label="Enter announcement details"
              value={content}
              onChangeText={setContent}
              mode="outlined"
              style={[styles.input, styles.contentInput]}
              outlineColor="#e0e0e0"
              activeOutlineColor="#667eea"
              multiline
              numberOfLines={8}
              maxLength={6000}
              placeholder="Write your announcement here..."
            />
            <Text style={styles.charCount}>{content.length}/6000</Text>
          </View>

          {/* Links Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📎 Add Links & PDFs</Text>
            <Text style={styles.linkHint}>Enter any URL or PDF link</Text>
            <View style={styles.attachmentInputContainer}>
              <TextInput
                label="Enter link or PDF URL"
                value={newLink}
                onChangeText={setNewLink}
                mode="outlined"
                style={styles.attachmentInput}
                outlineColor="#e0e0e0"
                activeOutlineColor="#667eea"
                placeholder="https://example.com or .pdf"
              />
              <Button
                mode="contained"
                onPress={addLink}
                style={styles.addButton}
                labelStyle={styles.addButtonLabel}
              >
                Add
              </Button>
            </View>
            {(links.length > 0 || pdfs.length > 0) && (
              <View style={styles.chipContainer}>
                {links.map((link, index) => (
                  <Chip
                    key={`link-${index}`}
                    icon="link"
                    onClose={() => removeLink(index)}
                    style={styles.attachmentChip}
                    textStyle={styles.chipText}
                  >
                    Link {index + 1}
                  </Chip>
                ))}
                {pdfs.map((pdf, index) => {
                  const shortName = pdf.name.length > 20 ? pdf.name.substring(0, 17) + '...' : pdf.name;
                  return (
                    <Chip
                      key={`pdf-${index}`}
                      icon="file-pdf-box"
                      onClose={() => removePdfLink(index)}
                      style={styles.attachmentChip}
                      textStyle={styles.chipText}
                    >
                      {shortName}
                    </Chip>
                  );
                })}
              </View>
            )}
          </View>

          {/* Images Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🖼️ Add Images</Text>
            <Button
              mode="contained"
              onPress={pickImageFile}
              style={styles.uploadButton}
              labelStyle={styles.uploadButtonLabel}
              icon="image-plus"
            >
              Choose Image File
            </Button>
            {images.length > 0 && (
              <View style={styles.chipContainer}>
                {images.map((image, index) => {
                  const shortName = image.name.length > 20 ? image.name.substring(0, 17) + '...' : image.name;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handlePreviewImage(image.uri)}
                      style={[styles.attachmentChip, styles.imageChip, styles.previewChip]}
                    >
                      <View style={styles.chipContent}>
                        <MaterialCommunityIcons name="image" size={16} color="#9c27b0" />
                        <Text style={styles.chipText} numberOfLines={1}>{shortName}</Text>
                        <TouchableOpacity onPress={() => removeImage(index)} style={styles.closeButton}>
                          <MaterialCommunityIcons name="close" size={16} color="#9c27b0" />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              labelStyle={styles.buttonLabel}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateAnnouncement}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
              labelStyle={styles.buttonLabel}
            >
              Publish Announcement
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Image Preview Card - Inside App */}
      {previewUri && previewType === 'image' && (
        <View style={styles.imagePreviewCard}>
          <View style={styles.previewCardHeader}>
            <Text style={styles.previewCardTitle}>Image Preview</Text>
            <TouchableOpacity onPress={closePreview} style={styles.previewCardClose}>
              <MaterialCommunityIcons name="close" size={24} color="#667eea" />
            </TouchableOpacity>
          </View>
          <Image source={{ uri: previewUri }} style={styles.previewImageInCard} />
        </View>
      )}

      {previewUri && previewType === 'pdf' && (
        <View style={styles.previewOverlay}>
          <TouchableOpacity style={styles.previewBackdrop} onPress={closePreview} />
          <View style={styles.previewContainer}>
            <TouchableOpacity style={styles.previewClose} onPress={closePreview}>
              <MaterialCommunityIcons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.pdfPreview} onPress={openPdfInApp}>
              <MaterialCommunityIcons name="file-pdf-box" size={80} color="#ff9800" />
              <Text style={styles.pdfPreviewText}>PDF Preview</Text>
              <Text style={styles.pdfPreviewSubtext}>Tap to open in external viewer</Text>
              <View style={styles.openButton}>
                <MaterialCommunityIcons name="open-in-app" size={20} color="#fff" />
                <Text style={styles.openButtonText}>Open PDF</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f3f9',
  },
  scrollView: {
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 22,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    elevation: 5,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0d0d0d',
    marginBottom: 18,
    letterSpacing: 0.4,
  },
  segmentedButtons: {
    marginBottom: 0,
  },
  segmentButton: {
    borderColor: '#667eea',
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subjectScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: '#f0f4ff',
    borderWidth: 1.5,
    borderColor: '#667eea',
    marginRight: 10,
    elevation: 3,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  subjectChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    elevation: 6,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  subjectChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#667eea',
    maxWidth: 100,
    letterSpacing: 0.2,
  },
  subjectChipTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f8f9fc',
    borderRadius: 13,
    borderWidth: 0,
    fontSize: 15,
    fontWeight: '500',
  },
  contentInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
    fontWeight: '600',
  },
  linkHint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    elevation: 2,
    marginBottom: 24,
  },
  infoCardContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 6,
  },
  infoDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    backgroundColor: '#f8f9fc',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#667eea',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  attachmentInputContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  attachmentInput: {
    flex: 1,
    backgroundColor: '#f8f9fc',
    borderRadius: 13,
    borderWidth: 0,
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    borderRadius: 13,
    elevation: 6,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  addButtonLabel: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  uploadButton: {
    backgroundColor: '#667eea',
    marginTop: 14,
    borderRadius: 13,
    elevation: 6,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  uploadButtonLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.3,
  },
  cancelSmallButton: {
    borderColor: '#ddd',
    borderWidth: 1,
    flex: 0.8,
  },
  cancelSmallLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 13,
    marginTop: 18,
    paddingHorizontal: 0,
  },
  attachmentChip: {
    backgroundColor: '#e8eef7',
    borderColor: '#667eea',
    borderWidth: 1.2,
    paddingHorizontal: 13,
    paddingVertical: 9,
    maxWidth: '85%',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  pdfChip: {
    backgroundColor: '#fff8e1',
    borderColor: '#ff9800',
    borderWidth: 1.2,
    paddingHorizontal: 13,
    paddingVertical: 9,
    maxWidth: '80%',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#ff9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  imageChip: {
    backgroundColor: '#f3e5f5',
    borderColor: '#9c27b0',
    borderWidth: 1.2,
    paddingHorizontal: 13,
    paddingVertical: 9,
    maxWidth: '80%',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#9c27b0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.2,
  },
  previewChip: {
    cursor: 'pointer',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 4,
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  previewBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxWidth: '90%',
    maxHeight: '80%',
    zIndex: 1001,
    position: 'relative',
  },
  previewClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1002,
    padding: 8,
  },
  previewImage: {
    width: 300,
    height: 400,
    borderRadius: 12,
    resizeMode: 'contain',
  },
  pdfPreview: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  pdfPreviewText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
  },
  pdfPreviewSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  openButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  imagePreviewCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 999,
  },
  previewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  previewCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  previewCardClose: {
    padding: 4,
  },
  previewImageInCard: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: '#f8f9fa',
  },
});

export default CreateAnnouncementScreen;
