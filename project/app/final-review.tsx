import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { ArrowLeft, Mail, Check, Mic, Video as VideoIcon, MessageSquare, Edit3, Play, Pause, Calendar, Image as ImageIcon } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEvent } from 'expo';
import { useAudioPlayer } from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';
import { supabase } from '@/libs/superbase';
import { apiService } from '@/libs/api';
import { storage } from '@/utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingAnimation from '@/components/loading-animation';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  username: string;
  profile_image_url?: string;
}

export default function FinalReviewScreen() {
  const router = useRouter();
  const {
    childId,
    messageType,
    recordedUri,
    messageTitle,
    privacy,
    tags,
    promptText,
    deliveryOption,
    scheduledDate,
    scheduledTime,
    repeatAnnually,
    lifeMomentDescription,
    reminderOption,
    imageUri,
  } = useLocalSearchParams();

  const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null);

  const [child, setChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  // Audio player setup
  const audioPlayer = useAudioPlayer(recordedUri && messageType === 'audio' ? recordedUri as string : '');
  
  // Video player setup
  const videoPlayer = useVideoPlayer(recordedUri && messageType === 'video' ? recordedUri as string : '', player => {
    player.loop = false;
  });

  // Listen to playing state changes
    // @ts-ignore
  const { isPlaying: isAudioPlaying } = useEvent(audioPlayer, 'playingChange', { isPlaying: audioPlayer.playing });
  const { isPlaying: isVideoPlaying } = useEvent(videoPlayer, 'playingChange', { isPlaying: videoPlayer.playing });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    fetchChildData();

    // Load uploaded image from session storage
    storage.getUploadedImageUri().then((storedUri) => {
      if (storedUri) {
        setUploadedImageUri(storedUri);
      } else if (imageUri) {
        // Fallback to imageUri from params
        setUploadedImageUri(imageUri as string);
      }
    });

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

   return () => {
      // Cleanup: pause audio if needed, but don't call remove()
      if (audioPlayer && audioPlayer.pause && !audioPlayer.release) {
        audioPlayer.pause();
      }
    };
  }, []);

  // Update player sources when recordedUri changes
  useEffect(() => {
    if (recordedUri) {
      if (messageType === 'audio') {
        try {
          audioPlayer.replace(recordedUri as string);
        } catch (error: unknown) {
          console.error('Error loading audio:', error);
        }
      } else if (messageType === 'video') {
        videoPlayer.replaceAsync(recordedUri as string).catch((error: unknown) => {
          console.error('Error loading video:', error);
        });
      }
    }
  }, [recordedUri, messageType]);

  const fetchChildData = async () => {
    try {
      // Handle vault messages
      if (childId === 'vault') {
        setChild({
          id: 'vault',
          first_name: 'Vault',
          last_name: 'Messages',
          date_of_birth: '2000-01-01',
          username: 'vault'
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Fetch child data using API service (same method as create-message.tsx)
      const res = await apiService.getChildProfiles();
      // Backend returns { data: { actors: [...], relationships: [...] } }
      const actorsList = (res as any)?.data?.actors ?? (res as any)?.data ?? [];
      
      // Find the specific child by childId
      const childData = actorsList.find((actor: any) => actor.id === childId);
      
      if (!childData) {
        console.error('Child not found with id:', childId);
        Alert.alert('Error', 'Failed to load child data. Please try again.');
        return;
      }

      // Map API response to local Child interface
      const mappedChild: Child = {
        id: childData.id,
        first_name: childData.first_name ?? childData.firstName ?? childData.name?.split(' ')[0] ?? '',
        last_name: childData.last_name ?? childData.lastName ?? (childData.name?.split(' ').slice(1).join(' ') || ''),
        date_of_birth: childData.date_of_birth ?? childData.birthday ?? '',
        username: childData.username,
        profile_image_url: childData.profile_image_url ?? childData.profilePictureUrl ?? undefined,
      };

      setChild(mappedChild);
    } catch (error) {
      console.error('Unexpected error fetching child:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatScheduledDate = (scheduledAt: string): string => {
    try {
      const date = new Date(scheduledAt);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const dayWithSuffix = (day: number) => {
        if (day > 3 && day < 21) return day + 'th';
        switch (day % 10) {
          case 1: return day + 'st';
          case 2: return day + 'nd';
          case 3: return day + 'rd';
          default: return day + 'th';
        }
      };
      
      return `${monthNames[date.getMonth()]} ${dayWithSuffix(date.getDate())}, ${date.getFullYear()}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getDeliveryDisplay = () => {
    if (deliveryOption === 'specificDate' && scheduledDate && scheduledTime) {
      const formattedDate = formatScheduledDate(scheduledDate as string);
      return `${formattedDate} at ${scheduledTime}${repeatAnnually === 'true' ? ' (Repeats Annually)' : ''}`;
    } else if (deliveryOption === 'lifeMoment' && lifeMomentDescription) {
      return `Triggered by: ${lifeMomentDescription}`;
    } else if (deliveryOption === 'manuallyLater') {
      return 'Will be sent manually later';
    }
    return 'Not scheduled';
  };

  const getMessageTypeDisplay = () => {
    const typeMap = {
      audio: { icon: Mic, label: 'Audio Message', color: '#8B5CF6' },
      video: { icon: VideoIcon, label: 'Video Message', color: '#EF4444' },
      text: { icon: MessageSquare, label: 'Text Message', color: '#3B82F6' },
      image: { icon: ImageIcon, label: 'Image Message', color: '#10B981' },
    };
    return typeMap[messageType as keyof typeof typeMap] || { icon: MessageSquare, label: 'Message', color: '#6B7280' };
  };

  const toggleMediaPlayback = async () => {
    if (messageType === 'video') {
      if (!recordedUri) {
        Alert.alert('No Video', 'No video file available to play.');
        return;
      }

      try {
        if (isVideoPlaying) {
          await videoPlayer.pause();
        } else {
          // Ensure video is loaded before playing
          if (recordedUri) {
            await videoPlayer.replaceAsync(recordedUri as string);
          }
          await videoPlayer.play();
        }
      } catch (error) {
        console.error('Error controlling video playback:', error);
        Alert.alert('Error', 'Failed to control video playback. Please try again.');
      }
    } else if (messageType === 'audio') {
      if (Platform.OS === 'web') {
        Alert.alert('Not Supported', 'Audio playback is not available on web platform');
        return;
      }

      if (!recordedUri) {
        Alert.alert('No Audio', 'No audio file available to play.');
        return;
      }

      try {
        if (isAudioPlaying) {
          await audioPlayer.pause();
        } else {
          // Ensure audio is loaded before playing
          if (recordedUri) {
            await audioPlayer.replace(recordedUri as string);
          }
          await audioPlayer.play();
        }
      } catch (error) {
        console.error('Failed to play audio:', error);
        Alert.alert('Error', 'Failed to play audio. Please try again.');
      }
    }
  };

  const renderMessagePreview = () => {
    const typeDisplay = getMessageTypeDisplay();
    const IconComponent = typeDisplay.icon;

    if (messageType === 'video' && recordedUri) {
      return (
        <View style={styles.videoPlayerCard}>
          <VideoView
            style={styles.videoPlayer}
            player={videoPlayer}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
          />

          <TouchableOpacity
            style={styles.videoPlayButton}
            onPress={toggleMediaPlayback}
            activeOpacity={0.8}
          >
            {isVideoPlaying ? (
              <Pause size={32} color="#ffffff" strokeWidth={2} />
            ) : (
              <Play size={32} color="#ffffff" strokeWidth={2} />
            )}
          </TouchableOpacity>

          <View style={styles.videoOverlay}>
            <View style={styles.videoTypeIndicator}>
              <VideoIcon size={16} color="#ffffff" strokeWidth={2} />
              <Text style={styles.videoTypeText}>Video Message</Text>
            </View>
          </View>
        </View>
      );
    } else if (messageType === 'audio' && recordedUri) {
      // Use uploaded image as background if available, otherwise use placeholder
      const backgroundImageUri = uploadedImageUri || 'https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=800';
      
      return (
        <View style={styles.audioPlayerCard}>
          <Image
            source={{ uri: backgroundImageUri }}
            style={styles.audioBackground}
            resizeMode="cover"
          />
          <View style={styles.audioOverlay}>
            <View style={styles.waveformContainer}>
              {[...Array(30)].map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.waveformBar,
                    {
                      height: Math.random() * 40 + 10,
                      backgroundColor: '#FFFFFF'
                    }
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.playButton}
              onPress={toggleMediaPlayback}
              activeOpacity={0.8}
            >
              {isAudioPlaying ? (
                <Pause size={28} color="#ffffff" strokeWidth={2.5} />
              ) : (
                <Play size={28} color="#ffffff" strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (messageType === 'image') {
      // Use uploaded image from session storage if available, otherwise use recordedUri
      const imageSource = uploadedImageUri || recordedUri;
      
      if (!imageSource) {
        return (
          <View style={styles.fallbackPreviewCard}>
            <ImageIcon size={32} color="#10B981" strokeWidth={2} />
            <Text style={[styles.fallbackPreviewText, { color: '#10B981' }]}>
              Image Message
            </Text>
          </View>
        );
      }

      return (
        <View style={styles.imagePreviewCard}>
          <View style={styles.imagePreviewHeader}>
            <ImageIcon size={20} color="#10B981" strokeWidth={2} />
            <Text style={styles.imagePreviewTitle}>Image Message</Text>
          </View>
          <Image
            source={{ uri: imageSource as string }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
          {promptText && (
            <View style={styles.imagePreviewTextContainer}>
              <Text style={styles.imagePreviewText}>
                {promptText}
              </Text>
            </View>
          )}
        </View>
      );
    } else if (messageType === 'text') {
      // Show uploaded image if available, otherwise just text
      if (uploadedImageUri) {
        return (
          <View style={styles.textPreviewCard}>
            <View style={styles.textPreviewHeader}>
              <MessageSquare size={20} color="#3B82F6" strokeWidth={2} />
              <Text style={styles.textPreviewTitle}>Text Message</Text>
            </View>
            <Image
              source={{ uri: uploadedImageUri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            {promptText && (
              <View style={styles.textPreviewContent}>
                <Text style={styles.textPreviewText} numberOfLines={6}>
                  {promptText}
                </Text>
              </View>
            )}
          </View>
        );
      }
      
      return (
        <View style={styles.textPreviewCard}>
          <View style={styles.textPreviewHeader}>
            <MessageSquare size={20} color="#3B82F6" strokeWidth={2} />
            <Text style={styles.textPreviewTitle}>Text Message</Text>
          </View>
          <View style={styles.textPreviewContent}>
            <Text style={styles.textPreviewText} numberOfLines={6}>
              {promptText || 'Your message content will appear here...'}
            </Text>
          </View>
        </View>
      );
    }

    // Fallback for unknown message types
    return (
      <View style={styles.fallbackPreviewCard}>
        <IconComponent size={32} color={typeDisplay.color} strokeWidth={2} />
        <Text style={[styles.fallbackPreviewText, { color: typeDisplay.color }]}>
          {typeDisplay.label}
        </Text>
      </View>
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleEditMessage = () => {
    router.push({
      pathname: '/message-settings',
      params: {
        childId,
        messageType,
        recordedUri,
        promptText,
      }
    });
  };

  const handleEditSchedule = () => {
    router.push({
      pathname: '/schedule-delivery',
      params: {
        childId,
        messageType,
        recordedUri,
        messageTitle,
        privacy,
        tags,
        promptText,
      }
    });
  };

  const handleScheduleMessage = async () => {
    if (!child) {
      Alert.alert('Error', 'Child data not loaded. Please try again.');
      return;
    }

    setIsSaving(true);

    try {
      console.log('🚀 Final Review - Starting message scheduling process');

      // Get the current authenticated user from stored token/user data
      // Try Supabase session first, then fallback to stored user data
      let authUserId: string | null = null;
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session?.user) {
          authUserId = session.user.id;
          console.log('✅ Final Review - Authenticated user ID from Supabase session:', authUserId);
        } else {
          // Fallback to stored user data from JWT token
          const userData = await storage.getUserData();
          if (userData?.id || userData?.user_id) {
            authUserId = userData.id || userData.user_id;
            console.log('✅ Final Review - Authenticated user ID from stored user data:', authUserId);
          } else {
            console.error('❌ Final Review - No authentication found (no session, no stored user data)');
            console.log('Debug - stored userData:', userData);
            Alert.alert('Authentication Error', 'Please sign in again to continue.');
            setIsSaving(false);
            return;
          }
        }
      } catch (authError) {
        console.error('❌ Final Review - Authentication error:', authError);
        // Try fallback to stored user data
        try {
          const userData = await storage.getUserData();
          if (userData?.id || userData?.user_id) {
            authUserId = userData.id || userData.user_id;
            console.log('✅ Final Review - Authenticated user ID from stored user data (fallback):', authUserId);
          } else {
            console.error('❌ Final Review - No user ID in stored user data');
            console.log('Debug - stored userData:', userData);
            Alert.alert('Authentication Error', 'Please sign in again to continue.');
            setIsSaving(false);
            return;
          }
        } catch (fallbackError) {
          console.error('❌ Final Review - Fallback authentication error:', fallbackError);
          Alert.alert('Authentication Error', 'Please sign in again to continue.');
          setIsSaving(false);
          return;
        }
      }
      
      if (!authUserId) {
        console.error('❌ Final Review - No auth user ID found');
        Alert.alert('Authentication Error', 'Please sign in again to continue.');
        setIsSaving(false);
        return;
      }

      // Get the director record for the current user
      const { data: directorData, error: directorError } = await supabase
        .from('directors')
        .select('id')
        .eq('auth_user_id', authUserId)
        .single();

      if (directorError || !directorData) {
        console.error('❌ Final Review - Director fetch error:', directorError);
        Alert.alert('Error', 'Could not find your profile. Please try again.');
        setIsSaving(false);
        return;
      }

      const directorId = directorData.id;
      console.log('✅ Final Review - Director ID found:', directorId);

      // Prepare scheduled_at timestamp
      let scheduledAt: string;
      if (deliveryOption === 'specificDate' && scheduledDate && scheduledTime) {
        try {
          const [month, day, year] = (scheduledDate as string).split('/');
          const [time, period] = (scheduledTime as string).split(' ');
          const [hours, minutes] = time.split(':');
          
          let hour24 = parseInt(hours, 10);
          if (period.toUpperCase() === 'PM' && hour24 !== 12) hour24 += 12;
          if (period.toUpperCase() === 'AM' && hour24 === 12) hour24 = 0;
          
          const scheduledDateTime = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            hour24,
            parseInt(minutes)
          );
          
          scheduledAt = scheduledDateTime.toISOString();
        } catch (error) {
          console.error('❌ Final Review - Date parsing error:', error);
          scheduledAt = new Date().toISOString();
        }
      } else {
        // For life moments and manual delivery, use current timestamp as placeholder
        scheduledAt = new Date().toISOString();
      }

      console.log('📅 Final Review - Scheduled at:', scheduledAt);

      // Insert message into messages table
      // Calculate proper scheduled_at based on delivery option
      let finalScheduledAt: string;
      if (child?.first_name === 'Vault') {
        // Vault messages: use far future date
        finalScheduledAt = '9999-12-31T00:00:00Z';
      } else if (deliveryOption === 'now') {
        // Send now: use current time
        finalScheduledAt = new Date().toISOString();
      } else if (deliveryOption === 'specificDate' && scheduledDate && scheduledTime) {
        // Specific date: parse and use the scheduled date/time
        try {
          const [month, day, year] = (scheduledDate as string).split('/');
          const [time, period] = (scheduledTime as string).split(' ');
          const [hours, minutes] = time.split(':');
          
          let hour24 = parseInt(hours, 10);
          if (period.toUpperCase() === 'PM' && hour24 !== 12) hour24 += 12;
          if (period.toUpperCase() === 'AM' && hour24 === 12) hour24 = 0;
          
          const scheduledDateTime = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            hour24,
            parseInt(minutes)
          );
          
          finalScheduledAt = scheduledDateTime.toISOString();
        } catch (error) {
          console.error('❌ Final Review - Date parsing error:', error);
          finalScheduledAt = new Date().toISOString();
        }
      } else {
        // Default: use current time
        finalScheduledAt = new Date().toISOString();
      }

      const messageData = {
        director_id: directorId,
        actor_id: childId,
        scheduled_at: finalScheduledAt,
        message_type: messageType,
        content: promptText || null,
      };

      console.log('📝 Final Review - Message data to insert:', messageData);

      const { data: insertedMessage, error: messageError } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (messageError) {
        console.error('❌ Final Review - Message insertion error:', messageError);
        Alert.alert('Error', 'Failed to save message. Please try again.');
        setIsSaving(false);
        return;
      }

      console.log('✅ Final Review - Message inserted successfully:', insertedMessage);
      const messageId = insertedMessage.id;

      // Determine the image source: prefer uploaded image from session storage, then recordedUri, then imageUri param
      const finalImageUri = uploadedImageUri || recordedUri || (imageUri as string);
      
      // Insert media if applicable
      if (messageType === 'image') {
        // For image messages, use the uploaded image
        if (finalImageUri) {
          const mediaData = {
            message_id: messageId,
            media_url: finalImageUri as string,
            media_type: 'image',
          };

          console.log('📎 Final Review - Image media data to insert:', mediaData);

          const { error: mediaError } = await supabase
            .from('message_media')
            .insert(mediaData);

          if (mediaError) {
            console.error('❌ Final Review - Image media insertion error:', mediaError);
            console.log('⚠️ Final Review - Continuing despite media error');
          } else {
            console.log('✅ Final Review - Image media inserted successfully');
          }
        }
      } else if (messageType === 'text' && finalImageUri) {
        // For text messages with uploaded image, save the image
        const mediaData = {
          message_id: messageId,
          media_url: finalImageUri as string,
          media_type: 'image',
        };

        console.log('📎 Final Review - Text message image media data to insert:', mediaData);

        const { error: mediaError } = await supabase
          .from('message_media')
          .insert(mediaData);

        if (mediaError) {
          console.error('❌ Final Review - Text message image media insertion error:', mediaError);
          console.log('⚠️ Final Review - Continuing despite image media error');
        } else {
          console.log('✅ Final Review - Text message image media inserted successfully');
        }
      } else if (recordedUri && (messageType === 'audio' || messageType === 'video')) {
        // For audio/video messages, save the audio/video media
        const mediaData = {
          message_id: messageId,
          media_url: recordedUri as string,
          media_type: messageType,
        };

        console.log('📎 Final Review - Audio/Video media data to insert:', mediaData);

        const { error: mediaError } = await supabase
          .from('message_media')
          .insert(mediaData);

        if (mediaError) {
          console.error('❌ Final Review - Audio/Video media insertion error:', mediaError);
          console.log('⚠️ Final Review - Continuing despite media error');
        } else {
          console.log('✅ Final Review - Audio/Video media inserted successfully');
        }

        // If there's also an uploaded image for audio/video messages, save it separately
        if (finalImageUri && finalImageUri !== recordedUri) {
          const imageMediaData = {
            message_id: messageId,
            media_url: finalImageUri as string,
            media_type: 'image',
          };

          console.log('📎 Final Review - Additional image media data to insert:', imageMediaData);

          const { error: imageMediaError } = await supabase
            .from('message_media')
            .insert(imageMediaData);

          if (imageMediaError) {
            console.error('❌ Final Review - Additional image media insertion error:', imageMediaError);
            console.log('⚠️ Final Review - Continuing despite image media error');
          } else {
            console.log('✅ Final Review - Additional image media inserted successfully');
          }
        }
      }

      // Insert categories if applicable
      if (tags && typeof tags === 'string') {
        const tagIds = tags.split(',').filter(id => id.trim());
        if (tagIds.length > 0) {
          const categoryData = tagIds.map(categoryId => ({
            message_id: messageId,
            category_id: categoryId.trim(),
          }));

          console.log('🏷️ Final Review - Category data to insert:', categoryData);

          const { error: categoryError } = await supabase
            .from('message_categories')
            .insert(categoryData);

          if (categoryError) {
            console.error('❌ Final Review - Category insertion error:', categoryError);
            // Don't fail the entire process for category errors
            console.log('⚠️ Final Review - Continuing despite category error');
          } else {
            console.log('✅ Final Review - Categories inserted successfully');
          }
        }
      }

      console.log('🎉 Final Review - Message scheduling completed successfully');
      
      // Clear uploaded image from session storage after successful save
      await storage.removeUploadedImageUri();
      
      // Keep isSaving true to show loading animation, navigation will happen in onComplete

    } catch (error) {
      console.error('💥 Final Review - Unexpected error during scheduling:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setIsSaving(false);
    }
  };

  const handleLoadingComplete = () => {
    // Navigate to message success screen after loading animation completes
    router.replace({
      pathname: '/message-success',
      params: {
        childName: child?.first_name || 'your loved one',
        messageType: messageType as string,
      }
    });
  };

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

  const messageTypeDisplay = getMessageTypeDisplay();
  const MessageTypeIcon = messageTypeDisplay.icon;

  // Show loading animation as full screen when saving
  if (isSaving) {
    return (
      <LoadingAnimation
        duration={5000}
        showSuccess={true}
        onComplete={handleLoadingComplete}
      />
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
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <ArrowLeft size={24} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Final Review</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Success Icon */}
          <Animated.View
            style={[
              styles.successIconContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#A78BFA', '#60A5FA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.successIcon}
            >
              <Mail size={40} color="#ffffff" strokeWidth={2} />
            </LinearGradient>
          </Animated.View>

          {/* Success Message */}
          <Text style={styles.successTitle}>Your Message is Ready</Text>
          <Text style={styles.successSubtitle}>
            We've saved your message securely and privately.
          </Text>

          {/* Sending To Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sending to</Text>
              <TouchableOpacity onPress={handleEditMessage} activeOpacity={0.7}>
                <Edit3 size={18} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <View style={styles.recipientCard}>
              <View style={styles.recipientAvatar}>
                {child?.profile_image_url ? (
                  <Image source={{ uri: child.profile_image_url }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{child?.first_name?.charAt(0) || 'C'}</Text>
                )}
              </View>
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientName}>{child?.first_name || 'Child'}</Text>
                <Text style={styles.recipientAge}>Age {calculateAge(child?.date_of_birth || '2014-01-01')}</Text>
              </View>
            </View>
          </View>

          {/* Message Title Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Message Title</Text>
              <TouchableOpacity onPress={handleEditMessage} activeOpacity={0.7}>
                <Edit3 size={18} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <Text style={styles.messageTitle}>{messageTitle || 'I love you Ava'}</Text>
          </View>

          {/* Preview Media Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Preview Media</Text>
              <TouchableOpacity onPress={handleEditMessage} activeOpacity={0.7}>
                <Edit3 size={18} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            {renderMessagePreview()}
          </View>


          {/* Scheduled Delivery Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Scheduled Delivery</Text>
              <TouchableOpacity onPress={handleEditSchedule} activeOpacity={0.7}>
                <Edit3 size={18} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <View style={styles.deliveryCard}>
              <View style={styles.deliveryHeader}>
                <View style={styles.deliveryIconContainer}>
                  <Calendar size={20} color="#6B7280" strokeWidth={2} />
                </View>
                <View style={styles.deliveryTextContainer}>
                  <Text style={styles.deliveryTitle}>Scheduled Delivery</Text>
                  <Text style={styles.deliverySubtitle}>Send by Date & Time</Text>
                </View>
              </View>
              <View style={styles.deliveryDetails}>
                <View style={styles.deliveryRow}>
                  <Text style={styles.deliveryLabel}>Date:</Text>
                  <Text style={styles.deliveryValue}>{scheduledDate ? formatScheduledDate(scheduledDate as string) : 'August 17, 2030'}</Text>
                </View>
                <View style={styles.deliveryRow}>
                  <Text style={styles.deliveryLabel}>Time:</Text>
                  <Text style={styles.deliveryValue}>{scheduledTime || '9:00 AM'}</Text>
                </View>
                <View style={styles.deliveryRow}>
                  <Text style={styles.deliveryLabel}>Reminder</Text>
                  <Text style={styles.deliveryValue}>{reminderOption || '1 day before'}</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.scheduleButton, isSaving && styles.scheduleButtonDisabled]}
            onPress={handleScheduleMessage}
            disabled={isSaving}
            activeOpacity={0.9}
          >
            <Text style={styles.scheduleButtonText}>
              {isSaving ? 'Scheduling...' : 'Schedule'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
    paddingBottom: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
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
    color: '#4B5563',
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
    paddingVertical: 24,
    paddingBottom: 40,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 24,
    fontFamily: 'Poppins-Regular',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Poppins-SemiBold',
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B5998',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3B5998',
    fontFamily: 'Poppins-SemiBold',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
    fontFamily: 'Poppins-SemiBold',
  },
  recipientAge: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Poppins-Regular',
  },
  messageTitle: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
  },
  // Video Player Styles
  videoPlayerCard: {
    backgroundColor: '#000000',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    height: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
  },
  videoTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  videoTypeText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  // Audio Player Styles
  audioPlayerCard: {
    backgroundColor: '#000000',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    height: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  audioBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  audioOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    gap: 2,
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
  waveformBar: {
    width: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
    opacity: 0.9,
  },
  audioDuration: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  // Text Preview Styles
  textPreviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  textPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    fontFamily: 'Poppins-SemiBold',
  },
  textPreviewContent: {
    padding: 16,
  },
  textPreviewText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  // Image Preview Styles
  imagePreviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  imagePreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    fontFamily: 'Poppins-SemiBold',
  },
  imagePreview: {
    width: '100%',
    height: 250,
    backgroundColor: '#F3F4F6',
  },
  imagePreviewTextContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  imagePreviewText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  // Fallback Preview Styles
  fallbackPreviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fallbackPreviewText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  deliveryCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  deliveryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deliveryTextContainer: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'Poppins-SemiBold',
  },
  deliverySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  deliveryDetails: {
    gap: 12,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  deliveryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Poppins-SemiBold',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
  },
  scheduleButton: {
    backgroundColor: '#2C3E5F',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#2C3E5F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  scheduleButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  scheduleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});