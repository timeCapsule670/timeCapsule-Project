import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { ArrowLeft, Mail, Check, Mic, Video as VideoIcon, MessageSquare, Edit3, ArrowRight, Home, Play, Pause } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEvent } from 'expo';
import { useAudioPlayer } from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';
import { supabase } from '@/libs/superbase';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  username: string;
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
  } = useLocalSearchParams();

  const [child, setChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Audio player setup
  const audioPlayer = useAudioPlayer(recordedUri && messageType === 'audio' ? recordedUri as string : '');
  
  // Video player setup
  const videoPlayer = useVideoPlayer(recordedUri && messageType === 'video' ? recordedUri as string : '', player => {
    player.loop = false;
  });

  // Listen to playing state changes
  const { isPlaying: isAudioPlaying } = useEvent(audioPlayer, 'playingChange', { isPlaying: audioPlayer.playing });
  const { isPlaying: isVideoPlaying } = useEvent(videoPlayer, 'playingChange', { isPlaying: videoPlayer.playing });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    fetchChildData();

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
        audioPlayer.replace(recordedUri as string);
      } else if (messageType === 'video') {
        videoPlayer.replace(recordedUri as string);
      }
    }
  }, [recordedUri, messageType]);

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
    };
    return typeMap[messageType as keyof typeof typeMap] || { icon: MessageSquare, label: 'Message', color: '#6B7280' };
  };

  const toggleMediaPlayback = async () => {
    if (messageType === 'video') {
      try {
        if (isVideoPlaying) {
          videoPlayer.pause();
        } else {
          videoPlayer.play();
        }
      } catch (error) {
        console.error('Error controlling video playback:', error);
        Alert.alert('Error', 'Failed to control video playback.');
      }
    } else if (messageType === 'audio') {
      if (Platform.OS === 'web') {
        Alert.alert('Not Supported', 'Audio playback is not available on web platform');
        return;
      }

      if (!recordedUri) return;

      try {
        if (isAudioPlaying) {
          audioPlayer.pause();
        } else {
          audioPlayer.play();
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
      return (
        <View style={styles.audioPlayerCard}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={toggleMediaPlayback}
            activeOpacity={0.8}
          >
            {isAudioPlaying ? (
              <Pause size={24} color="#ffffff" strokeWidth={2} />
            ) : (
              <Play size={24} color="#ffffff" strokeWidth={2} />
            )}
          </TouchableOpacity>

          <View style={styles.waveformContainer}>
            {[...Array(20)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    height: Math.random() * 30 + 10,
                    backgroundColor: isAudioPlaying ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'
                  }
                ]}
              />
            ))}
          </View>

          <Text style={styles.audioDuration}>00:10</Text>
        </View>
      );
    } else if (messageType === 'text') {
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

  const handleCreateAnotherMessage = () => {
    router.push('/create-message');
  };

  const handleViewScheduledMessages = () => {
    router.push('/(tabs)/vault');
  };

  const handleGoHome = () => {
    router.push('/(tabs)');
  };

  const handleScheduleMessage = async () => {
    if (!child) {
      Alert.alert('Error', 'Child data not loaded. Please try again.');
      return;
    }

    setIsSaving(true);

    try {
      console.log('🚀 Final Review - Starting message scheduling process');

      // Get the current authenticated user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('❌ Final Review - Authentication error:', sessionError);
        Alert.alert('Authentication Error', 'Please sign in again to continue.');
        return;
      }

      const authUserId = session.user.id;
      console.log('✅ Final Review - Authenticated user ID:', authUserId);

      // Get the director record for the current user
      const { data: directorData, error: directorError } = await supabase
        .from('directors')
        .select('id')
        .eq('auth_user_id', authUserId)
        .single();

      if (directorError || !directorData) {
        console.error('❌ Final Review - Director fetch error:', directorError);
        Alert.alert('Error', 'Could not find your profile. Please try again.');
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
      const messageData = {
        director_id: directorId,
        actor_id: childId,
        message_type: messageType,
        content: messageType === 'text' ? (promptText as string) : null,
        scheduled_at: scheduledAt,
        auth_user_id: authUserId,
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
        return;
      }

      console.log('✅ Final Review - Message inserted successfully:', insertedMessage);
      const messageId = insertedMessage.id;

      // Insert media if applicable
      if (recordedUri && (messageType === 'audio' || messageType === 'video' || messageType === 'image')) {
        const mediaData = {
          message_id: messageId,
          media_url: recordedUri as string,
          media_type: messageType,
        };

        console.log('📎 Final Review - Media data to insert:', mediaData);

        const { error: mediaError } = await supabase
          .from('message_media')
          .insert(mediaData);

        if (mediaError) {
          console.error('❌ Final Review - Media insertion error:', mediaError);
          // Don't fail the entire process for media errors
          console.log('⚠️ Final Review - Continuing despite media error');
        } else {
          console.log('✅ Final Review - Media inserted successfully');
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

      // Show success message and navigate
      Alert.alert(
        'Message Scheduled!',
        'Your message has been saved and will be delivered at the right moment.',
        [
          {
            text: 'View My Messages',
            onPress: () => router.push('/(tabs)/vault'),
          },
          {
            text: 'Go Home',
            onPress: () => router.push('/(tabs)'),
            style: 'default',
          },
        ]
      );

    } catch (error) {
      console.error('💥 Final Review - Unexpected error during scheduling:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
            <View style={styles.successIcon}>
              <Mail size={32} color="#3B4F75" strokeWidth={2} />
              <View style={styles.checkmarkOverlay}>
                <Check size={20} color="#ffffff" strokeWidth={3} />
              </View>
            </View>
          </Animated.View>

          {/* Success Message */}
          <Text style={styles.successTitle}>Your Message is Ready</Text>
          <Text style={styles.successSubtitle}>
            It's been saved and will be delivered at just the right moment.
          </Text>

          {/* Message Preview Section */}
          <View style={styles.messagePreviewSection}>
            <Text style={styles.messagePreviewTitle}>Your Message</Text>
            {renderMessagePreview()}
          </View>

          {/* Message Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Message Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>To:</Text>
              <Text style={styles.detailValue}>{child?.first_name || 'Child'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Title:</Text>
              <Text style={styles.detailValue}>{messageTitle || 'Untitled Message'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Format:</Text>
              <View style={styles.formatContainer}>
                <MessageTypeIcon size={16} color="#374151" strokeWidth={2} />
                <Text style={styles.detailValue}>{messageTypeDisplay.label}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery:</Text>
              <Text style={styles.detailValue}>{getDeliveryDisplay()}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEditMessage}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Edit Message</Text>
              <ArrowRight size={16} color="#374151" strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEditSchedule}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Edit Schedule</Text>
              <ArrowRight size={16} color="#374151" strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCreateAnotherMessage}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Create Another Message</Text>
              <ArrowRight size={16} color="#374151" strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewScheduledMessages}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>View My Scheduled Messages</Text>
              <ArrowRight size={16} color="#374151" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Inspirational Message */}
          <View style={styles.inspirationalContainer}>
            <Text style={styles.inspirationalTitle}>That was a powerful thing you just did.</Text>
            <Text style={styles.inspirationalSubtitle}>
              One day, this may mean everything to them.
            </Text>
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

          <Text style={styles.footerNote}>
            We've saved your message securely and privately.
          </Text>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  checkmarkOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
  },
  messagePreviewSection: {
    marginBottom: 32,
  },
  messagePreviewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
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
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 40,
    gap: 2,
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
    opacity: 0.8,
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
  detailsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
    flex: 2,
    textAlign: 'right',
  },
  formatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
    gap: 8,
  },
  actionButtonsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Poppins-Medium',
  },
  inspirationalContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  inspirationalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  inspirationalSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 16,
  },
  scheduleButton: {
    backgroundColor: '#3B4F75',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  scheduleButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  scheduleButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  footerNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: 'Poppins-Regular',
  },
});