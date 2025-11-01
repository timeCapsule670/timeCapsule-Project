import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Image,
  Alert,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ArrowLeft, Camera, Upload, X, Check, Calendar, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { apiService } from '@/libs/api';
import { supabase } from '@/libs/superbase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '@/utils/storage';


export default function PersonalizeProfileScreen() {
  const router = useRouter();
  
  // Form data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  
  // Image states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // UI states
  const [isUploading, setIsUploading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    general: '',
  });
  
  // Permissions
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
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

  const formatDate = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const parseDate = (dateString: string): Date | null => {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      birthday: '',
      general: '',
    };

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!birthday.trim()) {
      newErrors.birthday = 'Birthday is required';
    } else if (!dateOfBirth) {
      newErrors.birthday = 'Please enter a valid date (MM/DD/YYYY)';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'birthday':
        setBirthday(value);
        const parsedDate = parseDate(value);
        setDateOfBirth(parsedDate);
        break;
    }
    
    // Clear errors when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setDateOfBirth(selectedDate);
      setBirthday(formatDate(selectedDate));
      
      // Clear error
      if (errors.birthday) {
        setErrors(prev => ({ ...prev, birthday: '' }));
      }
      
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    } else if (Platform.OS === 'ios') {
      setShowDatePicker(false);
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

  const uploadImageToSupabase = async (imageUri: string): Promise<string | null> => {
    try {
      console.log('🚀 Starting direct Supabase upload with URI:', imageUri);
      
      // Validate the URI
      if (!imageUri || typeof imageUri !== 'string') {
        console.error('❌ Invalid image URI:', imageUri);
        return null;
      }
      
      // Read the image file as base64
      console.log('📖 Reading image file...');
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });

      // Convert base64 to Uint8Array
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Generate unique filename using timestamp and random string
      // Format: timestamp-randomstring.ext
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}-${randomStr}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      console.log('📤 Uploading to Supabase Storage:', {
        bucket: 'avatars',
        path: filePath,
      });

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, byteArray, {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('❌ Supabase upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload successful, getting public URL...');

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log('✅ Supabase public URL:', publicUrl);

      // Verify it's a Supabase URL format
      if (!publicUrl.includes('supabase.co/storage')) {
        console.warn('⚠️ URL does not appear to be a Supabase URL:', publicUrl);
      } else {
        console.log('✅ Verified Supabase storage URL format');
      }

      return publicUrl;
    } catch (error) {
      console.error('❌ Error uploading image to Supabase:', error);
      console.error('❌ Error type:', typeof error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error message:', errorMessage);
      
      return null;
    }
  };

  const saveDirectorProfile = async () => {
    try {
      // Prepare request data with profile information
      const requestData: {
        type: 'upload' | 'avatar';
        data: string;
        firstName?: string;
        lastName?: string;
        dateOfBirth?: string;
      } = {
        type: 'upload',
        data: '',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };

      // Add date of birth if provided (format as YYYY-MM-DD)
      if (dateOfBirth) {
        requestData.dateOfBirth = dateOfBirth.toISOString().split('T')[0];
      }

      // Handle profile picture upload if selected
      if (selectedImage) {
        console.log('📤 Uploading profile picture directly to Supabase Storage...');
        try {
          const imageUrl = await uploadImageToSupabase(selectedImage);
          if (imageUrl) {
            requestData.data = imageUrl;
            requestData.type = 'upload';
            console.log('✅ Image uploaded successfully, Supabase URL:', imageUrl);
            console.log('✅ Ready to save profile with image URL:', {
              type: requestData.type,
              data: requestData.data,
              firstName: requestData.firstName,
              lastName: requestData.lastName,
              dateOfBirth: requestData.dateOfBirth,
            });
          } else {
            // Upload failed but no error thrown, use default avatar
            console.warn('⚠️ Image upload returned null, attempting to fetch a default avatar');
            try {
              const avatars = await apiService.getAvatars();
              const fallbackId = avatars?.data?.[0]?.id;
              if (fallbackId) {
                requestData.type = 'avatar';
                requestData.data = fallbackId;
              } else {
                console.warn('⚠️ No avatars available; skipping avatar assignment.');
              }
            } catch (e) {
              console.warn('⚠️ Failed to fetch avatars for fallback:', e);
            }
          }
        } catch (uploadError) {
          // If image upload fails (server down, network error, etc.), use default avatar
          // Don't block the user from proceeding with onboarding
          console.warn('⚠️ Image upload failed, attempting to fetch a default avatar:', uploadError);
          try {
            const avatars = await apiService.getAvatars();
            const fallbackId = avatars?.data?.[0]?.id;
            if (fallbackId) {
              requestData.type = 'avatar';
              requestData.data = fallbackId;
            } else {
              console.warn('⚠️ No avatars available; skipping avatar assignment.');
            }
          } catch (e) {
            console.warn('⚠️ Failed to fetch avatars for fallback:', e);
          }
        }
      } else {
        // If no image selected, use default avatar so we can still save profile info
        // This ensures firstName, lastName, and dateOfBirth are saved through this endpoint
        try {
          const avatars = await apiService.getAvatars();
          const fallbackId = avatars?.data?.[0]?.id;
          if (fallbackId) {
            requestData.type = 'avatar';
            requestData.data = fallbackId;
          } else {
            console.warn('⚠️ No avatars available; proceeding without avatar');
          }
        } catch (e) {
          console.warn('⚠️ Failed to fetch avatars; proceeding without avatar:', e);
        }
        console.log('⚠️ No profile picture selected, using default avatar');
      }

      // Save profile picture and personal information in a single request
      // Format: { type: "upload", data: "https://...supabase.co/...", firstName: "...", lastName: "...", dateOfBirth: "YYYY-MM-DD" }
      console.log('💾 Preparing to save profile to /api/avatars/director/profile-picture');
      console.log('💾 Request data:', { 
        type: requestData.type, 
        data: requestData.data,
        hasData: !!requestData.data,
        firstName: requestData.firstName,
        lastName: requestData.lastName,
        dateOfBirth: requestData.dateOfBirth
      });
      
      // Validate that we have data before making the API call
      // The API requires a non-empty 'data' field
      if (!requestData.data || requestData.data.trim() === '') {
        console.warn('⚠️ No profile picture data available, skipping profile save');
        console.warn('⚠️ User can update profile later. Allowing to continue.');
        return null;
      }
      
      try {
        console.log('📡 Calling saveProfilePicture API...');
        const response = await apiService.saveProfilePicture(requestData);
        console.log('✅ Profile saved successfully:', response.message);
        console.log('🖼️ Profile picture URL:', response.data.profile_picture_url);
        
        // Save profile data locally for quick access on other screens
        try {
          await storage.setUserData({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            profile_picture_url: response.data.profile_picture_url,
            dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
          });
          console.log('✅ Profile data saved locally');
        } catch (storageError) {
          console.warn('⚠️ Failed to save profile data locally:', storageError);
          // Don't throw - this is not critical
        }
        
        return response;
      } catch (saveError) {
        // If profile save fails (server down, etc.), log but don't throw
        // Allow user to proceed with onboarding - they can update profile later
        console.error('❌ Profile save failed, but allowing user to continue:', saveError);
        // Return null to indicate save didn't succeed, but don't block user
        return null;
      }
    } catch (error) {
      // Catch any other unexpected errors
      console.error('❌ Unexpected error in saveDirectorProfile:', error);
      // Don't throw - allow user to proceed
      return null;
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    
    try {
      const saveResult = await saveDirectorProfile();
      
      if (!saveResult) {
        // Profile save failed (server down, network error, etc.)
        // Show informational message but allow user to proceed
        setErrors(prev => ({
          ...prev,
          general: 'Note: Profile save had issues, but you can continue. You can update your profile later when the server is available.',
        }));
        
        // Navigate after a short delay to let user see the message
        setTimeout(() => {
          router.push('/moments-selection');
        }, 2000);
      } else {
        // Profile saved successfully, proceed immediately
        router.push('/moments-selection');
      }
    } catch (error) {
      // This shouldn't happen now, but handle it just in case
      console.error('Unexpected error in handleNext:', error);
      router.push('/moments-selection');
    } finally {
      setIsUploading(false);
    }
  };


  const renderBirthdayInput = () => {
    // Allow manual typing on all platforms
    return (
      <View style={[styles.inputWrapper, styles.birthdayInputWrapper, errors.birthday ? styles.inputError : null]}>
        <Calendar size={20} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder="MM/DD/YYYY"
          placeholderTextColor="#94A3B8"
          value={birthday}
          onChangeText={(value) => handleInputChange('birthday', value)}
          keyboardType="numeric"
        />
      </View>
    );
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
            style={styles.changeImageButton}
            onPress={() => setSelectedImage(null)}
            activeOpacity={0.7}
          >
            <X size={20} color="#ffffff" strokeWidth={2} />
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
        <View style={styles.uploadIcon}>
          <Camera size={32} color="#9CA3AF" strokeWidth={2} />
        </View>
        <Text style={styles.uploadPlaceholderText}>Add your photo</Text>
      </Animated.View>
    );
  };

  const isFormValid = firstName.trim().length >= 2 && lastName.trim().length >= 2 && birthday.trim().length > 0 && dateOfBirth;

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
          
          <Text style={styles.headerTitle}>Tell Us About Yourself</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* General Error Message */}
          {errors.general ? (
            <View style={styles.generalErrorContainer}>
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          ) : null}

          {/* First Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>My First Name Is:</Text>
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.firstName ? styles.inputError : null]}>
                <User size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="First Name"
                  placeholderTextColor="#94A3B8"
                  value={firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {errors.firstName ? (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              ) : null}
            </View>
          </View>

          {/* Last Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>My Last Name Is:</Text>
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.lastName ? styles.inputError : null]}>
                <User size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Last Name"
                  placeholderTextColor="#94A3B8"
                  value={lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {errors.lastName ? (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              ) : null}
            </View>
          </View>

          {/* Birthday Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>My Birthday Is:</Text>
            <View style={styles.inputContainer}>
              <View style={styles.birthdayInputContainer}>
                {renderBirthdayInput()}
                <TouchableOpacity
                 
                  onPress={showDatePickerModal}
                  activeOpacity={0.7}
                >
                 <Image
                  source={require('../assets/images/solar_calendar-line-duotone.png')}
                  style={styles.calendarButtonImage}
                 />
                </TouchableOpacity>
              </View>
              {errors.birthday ? (
                <Text style={styles.errorText}>{errors.birthday}</Text>
              ) : null}
            </View>
          </View>

          {/* Profile Picture Section */}
          <View style={styles.profilePictureSection}>
            <Text style={styles.profilePictureTitle}>Let's Upload A Profile Picture (Optional)</Text>

            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <View style={styles.illustration}>
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.illustrationImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={require('../assets/images/family-upload.png')}
                    style={styles.illustrationImage}
                  />
                )}
              </View>
            </View>

           

            {/* Upload Buttons */}
            <View style={styles.uploadButtonsContainer}>
              <TouchableOpacity
                style={styles.takePhotoButton}
                onPress={takePhoto}
                activeOpacity={0.8}
              >
                <Text style={styles.takePhotoButtonText}>Take a Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.choosePhotoButton}
                onPress={pickImageFromLibrary}
                activeOpacity={0.8}
              >
                <Text style={styles.choosePhotoButtonText}>Choose a Photo</Text>
              </TouchableOpacity>
            </View>

          </View>

          {/* Footer Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                (!isFormValid || isUploading) && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!isFormValid || isUploading}
              activeOpacity={0.9}
            >
              <Text style={styles.nextButtonText}>
                {isUploading ? 'Saving...' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}

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
    fontSize: 22,
    fontWeight: '600',
    color: '#5A5A5A',
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
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  generalErrorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  generalErrorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#5A5A5A',
    marginBottom: 12,
    fontFamily: 'Poppins-Light',
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#49454F',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 56,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    paddingVertical: 16,
    fontFamily: 'Poppins-Regular',
  },
  birthdayInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  birthdayInputWrapper: {
    width: '80%',
  },
  datePickerText: {
    paddingVertical: 16,
  },
  placeholderText: {
    color: '#94A3B8',
  },
 
  calendarButtonImage: {
    width: 70,
    height: 70,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  profilePictureSection: {
    alignItems: 'center',
    marginTop: 32,
  },
  profilePictureTitle: {
    fontSize: 16,
    color: '#5A5A5A',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Poppins-Light',
    lineHeight: 21,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  illustration: {
    alignItems: 'center',
    marginBottom: 16,
  },
  illustrationImage: {
    width: 200,
    height: 200,
    filter: 'lightgray 6.5px 6.794px / 96.399% 100% no-repeat',
  },
  peopleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  person1: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  person2: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personEmoji: {
    fontSize: 24,
  },
  heartEmoji: {
    fontSize: 20,
  },
  phoneContainer: {
    alignItems: 'center',
  },
  phone: {
    width: 80,
    height: 100,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIconText: {
    fontSize: 16,
  },
  illustrationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  imageUploadSection: {
    marginBottom: 24,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  changeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadPlaceholderText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  uploadButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  takePhotoButton: {
    flex: 1,
    backgroundColor: '#A3C4F3',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
   
  },
  takePhotoButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Light',
  },
  choosePhotoButton: {
    flex: 1,
    backgroundColor: '#A3C4F3',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
   
  },
  choosePhotoButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Light',
  },
  footer: {
    paddingHorizontal: 5,
    paddingBottom: 32,
    paddingTop: 24,
  },
  nextButton: {
    backgroundColor: '#3B4F75',
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontFamily: 'Poppins-Light',
  },
  nextArrow: {
    transform: [{ rotate: '180deg' }],
  },
});