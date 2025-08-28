import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Image,
  Alert,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { ArrowLeft, Camera, Upload, X, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '@/libs/api';

// Avatar options for users who skip photo upload
const avatarOptions = [
  { id: '1', imageUrl: require('../assets/images/avatar1.png'), label: 'Avatar 1' },
  { id: '2', imageUrl: require('../assets/images/avatar2.png'), label: 'Avatar 2' },
  { id: '3', imageUrl: require('../assets/images/avatar3.png'), label: 'Avatar 3' },
  { id: '4', imageUrl: require('../assets/images/avatar4.png'), label: 'Avatar 4' },
  { id: '5', imageUrl: require('../assets/images/teenage-girl.png'), label: 'Teenage Girl' },
  { id: '6', imageUrl: require('../assets/images/profile.png'), label: 'Profile' },
];

export default function PersonalizeProfileScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0.8)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    checkPermissions();
    
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 0.8, // 80% progress
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

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

  const handleBack = () => {
    router.back();
  };

  const pickImageFromLibrary = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Photo upload is not available on web platform. Please use the mobile app for full functionality.');
      return;
    }

    if (!hasMediaLibraryPermission) {
      const granted = await requestMediaLibraryPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please grant access to your photo library to upload a profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Camera is not available on web platform. Please use the mobile app for full functionality.');
      return;
    }

    if (!hasCameraPermission) {
      const granted = await requestCameraPermission();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please grant camera access to take a profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const uploadImageToAPI = async (imageUri: string): Promise<string | null> => {
    try {
      console.log('🚀 Starting image upload with URI:', imageUri);
      
      // Validate the URI
      if (!imageUri || typeof imageUri !== 'string') {
        console.error('❌ Invalid image URI:', imageUri);
        return null;
      }
      
      console.log('📤 Calling API service uploadProfilePicture...');
      
      // Pass the image URI directly to the API service
      // The API service will handle both File objects (web) and URIs (React Native)
      const uploadResponse = await apiService.uploadProfilePicture(imageUri);
      console.log('✅ Upload successful:', uploadResponse);
      console.log('🖼️ Image URL:', uploadResponse.data.image_url);
      return uploadResponse.data.image_url;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  };

  const saveProfilePictureToAPI = async (type: 'upload' | 'avatar', data: string) => {
    try {
      console.log('💾 Saving profile picture:', { type, data });
      const response = await apiService.saveProfilePicture({ type, data });
      console.log('✅ Profile picture saved successfully:', response.message);
    } catch (error) {
      console.error('❌ Error saving profile picture:', error);
      throw error;
    }
  };

  const handleNext = async () => {
    if (selectedImage) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadImageToAPI(selectedImage);
        if (imageUrl) {
          await saveProfilePictureToAPI('upload', imageUrl);
          router.push('/moments-selection');
        } else {
          Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to save profile picture. Please try again.');
      } finally {
        setIsUploading(false);
      }
    } else if (selectedAvatar) {
      try {
        const selectedAvatarData = avatarOptions.find(avatar => avatar.id === selectedAvatar);
        if (selectedAvatarData) {
          // For local avatars, we need to handle them differently since they're not real URLs
          // For now, let's skip saving local avatars and just proceed to the next step
          console.log('Local avatar selected, skipping profile picture save for now');
          router.push('/moments-selection');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to save avatar. Please try again.');
      }
    } else {
      // No image or avatar selected, proceed to next step
      router.push('/moments-selection');
    }
  };

  const handleChooseAvatar = () => {
    setShowAvatarModal(true);
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    setSelectedImage(null); // Clear any selected image
  };

  const handleAvatarConfirm = () => {
    setShowAvatarModal(false);
  };

  const renderProfileImage = () => {
    if (selectedImage) {
      return (
        <Animated.View
          style={[
            styles.imagePreviewContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={{ uri: selectedImage }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.cameraOverlay}
            onPress={takePhoto}
            activeOpacity={0.7}
          >
            <Camera size={20} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>
      );
    } else if (selectedAvatar) {
      const selectedAvatarData = avatarOptions.find(avatar => avatar.id === selectedAvatar);
      return (
        <Animated.View
          style={[
            styles.avatarPreviewContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={selectedAvatarData?.imageUrl}
            style={styles.avatarPreviewImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.cameraOverlay}
            onPress={takePhoto}
            activeOpacity={0.7}
          >
            <Camera size={20} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.uploadPlaceholder,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../assets/images/teenage-girl.png')}
          style={styles.placeholderImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.cameraOverlay}
          onPress={takePhoto}
          activeOpacity={0.7}
        >
          <Camera size={20} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
          
          <Text style={styles.headerTitle}>Personalize profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]}
            />
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.title}>
              Choose a profile picture so your child can see who's leaving them messages.
            </Text>

            {/* Image Upload Area */}
            <View style={styles.imageUploadSection}>
              {renderProfileImage()}
            </View>

            {/* Upload Photo Button */}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImageFromLibrary}
              activeOpacity={0.8}
            >
              <Camera size={20} color="#ffffff" strokeWidth={2} />
              <Text style={styles.uploadButtonText}>Upload Photo</Text>
            </TouchableOpacity>

            {/* Or Choose Avatar Section */}
            <View style={styles.avatarSection}>
              <Text style={styles.avatarSectionTitle}>or choose an Avatar</Text>
              
                             <ScrollView
                 horizontal
                 showsHorizontalScrollIndicator={false}
                 contentContainerStyle={styles.avatarPreviewRow}
               >
                 {avatarOptions.map((avatar) => (
                   <TouchableOpacity
                     key={avatar.id}
                     style={[
                       styles.avatarPreviewOption,
                       selectedAvatar === avatar.id && styles.avatarPreviewOptionSelected,
                     ]}
                     onPress={() => handleAvatarSelect(avatar.id)}
                     activeOpacity={0.7}
                   >
                     <Image
                       source={avatar.imageUrl}
                       style={styles.avatarPreviewImage}
                       resizeMode="cover"
                     />
                     {selectedAvatar === avatar.id && (
                       <View style={styles.avatarCheckmark}>
                         <Check size={16} color="#ffffff" strokeWidth={3} />
                       </View>
                     )}
                   </TouchableOpacity>
                 ))}
               </ScrollView>

              <TouchableOpacity
                style={styles.moreAvatarsButton}
                onPress={handleChooseAvatar}
                activeOpacity={0.7}
              >
                <Text style={styles.moreAvatarsText}>See more avatars</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              isUploading && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={isUploading}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>
              {isUploading ? 'Uploading...' : 'Next'}
            </Text>
            <ArrowLeft 
              size={20} 
              color="#ffffff" 
              strokeWidth={2}
              style={styles.nextArrow}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Avatar Selection Modal */}
      <Modal
        visible={showAvatarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.avatarModalContent}>
            <View style={styles.avatarModalHeader}>
              <Text style={styles.modalTitle}>Choose Your Avatar</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAvatarModal(false)}
                activeOpacity={0.7}
              >
                <X size={24} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Select an avatar that represents you best.
            </Text>
            
                         <ScrollView 
               horizontal 
               style={styles.avatarGrid} 
               showsHorizontalScrollIndicator={false}
               contentContainerStyle={styles.avatarOptions}
             >
               {avatarOptions.map((avatar) => (
                 <TouchableOpacity
                   key={avatar.id}
                   style={[
                     styles.avatarOption,
                     selectedAvatar === avatar.id && styles.avatarOptionSelected,
                   ]}
                   onPress={() => handleAvatarSelect(avatar.id)}
                   activeOpacity={0.7}
                 >
                   <Image
                     source={avatar.imageUrl}
                     style={styles.avatarOptionImage}
                     resizeMode="cover"
                   />
                   {selectedAvatar === avatar.id && (
                     <View style={styles.avatarCheckmark}>
                       <Check size={16} color="#ffffff" strokeWidth={3} />
                     </View>
                   )}
                 </TouchableOpacity>
               ))}
             </ScrollView>
            
            <TouchableOpacity
              style={[
                styles.avatarConfirmButton,
                !selectedAvatar && styles.avatarConfirmButtonDisabled,
              ]}
              onPress={handleAvatarConfirm}
              disabled={!selectedAvatar}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.avatarConfirmButtonText,
                !selectedAvatar && styles.avatarConfirmButtonTextDisabled,
              ]}>
                Confirm Selection
              </Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
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
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#334155',
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 48,
    fontFamily: 'Poppins-SemiBold',
  },
  imageUploadSection: {
    marginBottom: 32,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  avatarPreviewContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  uploadPlaceholder: {
    position: 'relative',
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#334155',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadButton: {
    backgroundColor: '#A3C4F3',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 200,
  },
  uploadButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  avatarSection: {
    alignItems: 'center',
    width: '100%',
  },
  avatarSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
    fontFamily: 'Poppins-SemiBold',
  },
  avatarPreviewRow: {
    paddingHorizontal: 8,
    gap: 16,
    marginBottom: 20,
  },
  avatarPreviewOption: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A3C4F3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarPreviewOptionSelected: {
    borderColor: '#334155',
    backgroundColor: '#DBEAFE',
  },
  moreAvatarsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  moreAvatarsText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins-Medium',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  nextButton: {
    backgroundColor: '#334155',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#334155',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  nextArrow: {
    transform: [{ rotate: '180deg' }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  avatarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  avatarGrid: {
    maxHeight: 300,
  },
  avatarOptions: {
    paddingHorizontal: 8,
    gap: 12,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  avatarOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#334155',
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  avatarCheckmark: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarConfirmButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  avatarConfirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  avatarConfirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  avatarConfirmButtonTextDisabled: {
    color: '#ffffff',
  },
});