import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
  Image,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { ArrowLeft, Edit3, ArrowRight, ImageIcon, X, Camera, Image as ImageIconSolid } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/libs/superbase';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  username: string;
}

export default function RecordTextMessageScreen() {
  const router = useRouter();
  const { childId, promptText, promptTags, promptId } = useLocalSearchParams();
  
  const [child, setChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const characterLimit = 500;

  useEffect(() => {
    fetchChildData();
    checkPermissions();
    
    // Pre-fill with prompt text if available
    if (promptText && typeof promptText === 'string') {
      setMessageText(promptText);
    }
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchChildData = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('actors')
        .select('id, first_name, last_name, date_of_birth, username')
        .eq('id', childId)
        .single();

      if (error) {
        console.error('Error fetching child:', error);
        Alert.alert('Error', 'Failed to load child data. Please try again.');
        return;
      }

      setChild(data);
    } catch (error) {
      console.error('Unexpected error fetching child:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPermissions = async () => {
    if (Platform.OS === 'web') {
      setHasMediaLibraryPermission(false);
      setHasCameraPermission(false);
      return;
    }

    try {
      // Check media library permission
      const mediaLibraryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.granted);

      // Check camera permission
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.granted);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setHasMediaLibraryPermission(false);
      setHasCameraPermission(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleBack = () => {
    router.back();
  };

  const handleEditRecipient = () => {
    Alert.alert('Edit Recipient', 'Navigate back to recipient selection');
  };

  const handleSpiceItUp = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Image attachment is not available on web platform. Please use the mobile app for full functionality.');
      return;
    }
    setShowImageOptions(true);
  };

  const requestMediaLibraryPermission = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasMediaLibraryPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return false;
    }
  };

  const requestCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  };

  const pickImageFromLibrary = async () => {
    setShowImageOptions(false);

    if (!hasMediaLibraryPermission) {
      const granted = await requestMediaLibraryPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please grant access to your photo library to attach images to your messages.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAttachedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const takePhoto = async () => {
    setShowImageOptions(false);

    if (!hasCameraPermission) {
      const granted = await requestCameraPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please grant camera access to take photos for your messages.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAttachedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
  };

  const handleMessageSettings = () => {
    if (!messageText.trim()) {
      Alert.alert('Message Required', 'Please write a message before proceeding to settings.');
      return;
    }

    // Navigate to message settings with all necessary parameters
    router.push({
      pathname: '/message-settings',
      params: {
        childId: childId,
        messageType: 'text',
        recordedUri: attachedImage || '', // Pass image URI if attached
        promptText: messageText.trim(),
        promptTags: promptTags || '',
        promptId: promptId || '',
      }
    });
  };

  const remainingCharacters = characterLimit - messageText.length;
  const isOverLimit = remainingCharacters < 0;
  const isFormValid = messageText.trim().length > 0 && !isOverLimit;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Record Text Message</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Sending To Section */}
          <View style={styles.sendingToSection}>
            <View style={styles.sendingToHeader}>
              <Text style={styles.sendingToTitle}>Sending To</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEditRecipient}
                activeOpacity={0.7}
              >
                <Edit3 size={16} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.childCard}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg' }}
                style={styles.childAvatar}
                resizeMode="cover"
              />
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child?.first_name}</Text>
                <Text style={styles.childAge}>Age {child ? calculateAge(child.date_of_birth) : 0}</Text>
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.mainTitle}>Let's Write Something Meaningful</Text>
            <Text style={styles.mainSubtitle}>
              Type a message your loved one will read one day.
            </Text>

            {/* Message Input Section */}
            <View style={styles.messageSection}>
              <Text style={styles.messageSectionTitle}>Your Message</Text>
              
              <View style={styles.messageInputContainer}>
                <TextInput
                  style={[
                    styles.messageInput,
                    isOverLimit && styles.messageInputError,
                  ]}
                  placeholder="Write your message here..."
                  placeholderTextColor="#9CA3AF"
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  textAlignVertical="top"
                  maxLength={characterLimit + 50} // Allow slight overflow for warning
                />
                
                <View style={styles.characterCounter}>
                  <Text style={[
                    styles.characterCountText,
                    isOverLimit && styles.characterCountError,
                  ]}>
                    {remainingCharacters}/{characterLimit}
                  </Text>
                </View>
              </View>

              {isOverLimit && (
                <Text style={styles.errorText}>
                  Message is too long. Please shorten it by {Math.abs(remainingCharacters)} characters.
                </Text>
              )}
            </View>

            {/* Attached Image Preview */}
            {attachedImage && (
              <View style={styles.attachedImageSection}>
                <Text style={styles.attachedImageTitle}>Attached Image</Text>
                <View style={styles.attachedImageContainer}>
                  <Image
                    source={{ uri: attachedImage }}
                    style={styles.attachedImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={removeAttachedImage}
                    activeOpacity={0.7}
                  >
                    <X size={20} color="#ffffff" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Spice It Up Section */}
            <TouchableOpacity
              style={styles.spiceItUpButton}
              onPress={handleSpiceItUp}
              activeOpacity={0.7}
            >
              <View style={styles.spiceItUpContent}>
                <ImageIcon size={24} color="#6B7280" strokeWidth={2} />
                <Text style={styles.spiceItUpText}>Spice it Up with an Image</Text>
              </View>
              <ArrowLeft 
                size={20} 
                color="#6B7280" 
                strokeWidth={2}
                style={styles.spiceItUpArrow}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Message Settings Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.messageSettingsButton,
              !isFormValid && styles.messageSettingsButtonDisabled,
            ]}
            onPress={handleMessageSettings}
            disabled={!isFormValid}
            activeOpacity={0.9}
          >
            <Text style={[
              styles.messageSettingsButtonText,
              !isFormValid && styles.messageSettingsButtonTextDisabled,
            ]}>
              Message Settings
            </Text>
            <ArrowRight size={20} color={!isFormValid ? "#9CA3AF" : "#ffffff"} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Image</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowImageOptions(false)}
                activeOpacity={0.7}
              >
                <X size={24} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Choose how you'd like to add an image to your message.
            </Text>
            
            <View style={styles.imageOptionsContainer}>
              <TouchableOpacity
                style={styles.imageOptionButton}
                onPress={pickImageFromLibrary}
                activeOpacity={0.7}
              >
                <ImageIconSolid size={24} color="#3B4F75" strokeWidth={2} />
                <Text style={styles.imageOptionText}>Choose from Photos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.imageOptionButton}
                onPress={takePhoto}
                activeOpacity={0.7}
              >
                <Camera size={24} color="#3B4F75" strokeWidth={2} />
                <Text style={styles.imageOptionText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sendingToSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 32,
  },
  sendingToHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sendingToTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  childCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  childAge: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  mainContent: {
    paddingHorizontal: 24,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'Poppins-Regular',
  },
  messageSection: {
    marginBottom: 32,
  },
  messageSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  messageInputContainer: {
    position: 'relative',
  },
  messageInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
    minHeight: 200,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  characterCounter: {
    position: 'absolute',
    bottom: 16,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  characterCountText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  characterCountError: {
    color: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  attachedImageSection: {
    marginBottom: 32,
  },
  attachedImageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  attachedImageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  attachedImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spiceItUpButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  spiceItUpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  spiceItUpText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 16,
    fontFamily: 'Poppins-Medium',
  },
  spiceItUpArrow: {
    transform: [{ rotate: '180deg' }],
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  messageSettingsButton: {
    backgroundColor: '#3B4F75',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  messageSettingsButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  messageSettingsButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  messageSettingsButtonTextDisabled: {
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  imageOptionsContainer: {
    gap: 12,
  },
  imageOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  imageOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Poppins-SemiBold',
  },
});