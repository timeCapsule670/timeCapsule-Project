import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Plus, ArrowRight, Calendar, GraduationCap, PartyPopper, Heart, Mail, Eye, Pause, Mic, Play, Video as VideoIcon, MessageSquare, Image as ImageIcon } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEvent } from 'expo';
import { useAudioPlayer } from 'expo-audio';
import { useVideoPlayer } from 'expo-video';
import { supabase } from '@/libs/superbase';
import { storage } from '@/utils/storage';
import HomeMessageCard from '@/components/HomeMesssageCard';

interface HomeMessage {
  id: string;
  message_type: 'text' | 'audio' | 'video' | 'image';
  content?: string;
  scheduled_at: string;
  created_at: string;
  director_id: string;
  actor_id: string;
  child: {
    first_name: string;
    last_name: string;
  };
  message_media?: {
    media_url: string;
    media_type: string;
  }[];
}

interface SuggestedMessage {
  id: string;
  text: string;
  tags: string[];
  category: string;
  icon?: React.ComponentType<any>;
  color: string;
  backgroundColor: string;
}

interface DirectorProfile {
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { firstName } = useLocalSearchParams();

  // State for messages
  const [upcomingMessages, setUpcomingMessages] = useState<HomeMessage[]>([]);
  const [recentActivity, setRecentActivity] = useState<HomeMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  
  // State for director profile
  const [directorProfile, setDirectorProfile] = useState<DirectorProfile | null>(null);

  // Media playback state
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [currentMediaUrl, setCurrentMediaUrl] = useState<string>('');

  // Audio player setup
  const audioPlayer = useAudioPlayer(currentMediaUrl);

  // Video player setup  
  const videoPlayer = useVideoPlayer(currentMediaUrl, player => {
    player.loop = false;
  });

  // Listen to playing state changes
  // @ts-ignore
  const { isPlaying: isAudioPlaying } = useEvent(audioPlayer, 'playingChange', { isPlaying: audioPlayer.playing });
  const { isPlaying: isVideoPlaying } = useEvent(videoPlayer, 'playingChange', { isPlaying: videoPlayer.playing });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Suggested messages data
  const suggestedMessages: SuggestedMessage[] = [
    {
      id: '1',
      text: 'First Day of School',
      tags: ['#EmotionalSupport', '#VoiceMessage'],
      category: 'emotional-support',
      icon: Calendar,
      color: '#000000',
      backgroundColor: '#D6C7ED',
    },
    {
      id: '2',
      text: 'On your graduation day, I want to tell you how proud I am...',
      tags: ['#Milestones', '#VideoMessage'],
      category: 'milestones',
      icon: GraduationCap,
      color: '#F59E0B',
      backgroundColor: '#FEF3C7',
    },
    {
      id: '3',
      text: 'Happy Birthday! Here\'s a little something to make you smile...',
      tags: ['#Celebrations', '#TextMessage'],
      category: 'celebrations',
      icon: PartyPopper,
      color: '#00000',
      backgroundColor: '#FFB5B5',
    },
    {
      id: '4',
      text: 'A piece of advice I wish I had known when I was your age...',
      tags: ['#LifeAdvice', '#AudioMessage'],
      category: 'life-advice',
      icon: Heart,
      color: '#3B82F6',
      backgroundColor: '#DBEAFE',
    },
  ];

  useEffect(() => {
    fetchMessages();
    fetchDirectorProfile();

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

    return () => {
      // Cleanup: pause audio if needed, but don't call remove()
      if (audioPlayer && audioPlayer.pause && !audioPlayer.release) {
        audioPlayer.pause();
      }
    };
  }, []);

  // Update player sources when currentMediaUrl changes
  useEffect(() => {
    if (currentMediaUrl) {
      const currentMessage = [...upcomingMessages, ...recentActivity].find(msg => msg.id === currentPlayingId);
      if (currentMessage?.message_type === 'audio') {
        audioPlayer.replace(currentMediaUrl);
      } else if (currentMessage?.message_type === 'video') {
        videoPlayer.replace(currentMediaUrl);
      }
    }
  }, [currentMediaUrl, currentPlayingId]);

  const fetchMessages = async () => {
    try {
      console.log('🔍 Home - Starting fetchMessages process');

      // Get the current authenticated user from stored token/user data
      // Try Supabase session first, then fallback to stored user data
      let authUserId: string | null = null;
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session?.user) {
          authUserId = session.user.id;
          console.log('✅ Home - Authenticated user ID from Supabase session:', authUserId);
        } else {
          // Fallback to stored user data from JWT token
          const userData = await storage.getUserData();
          if (userData?.id || userData?.user_id) {
            authUserId = userData.id || userData.user_id;
            console.log('✅ Home - Authenticated user ID from stored user data:', authUserId);
          } else {
            console.error('❌ Home - No authentication found (no session, no stored user data)');
            setUpcomingMessages([]);
            setRecentActivity([]);
            return;
          }
        }
      } catch (authError) {
        console.error('❌ Home - Authentication error:', authError);
        // Try fallback to stored user data
        try {
          const userData = await storage.getUserData();
          if (userData?.id || userData?.user_id) {
            authUserId = userData.id || userData.user_id;
            console.log('✅ Home - Authenticated user ID from stored user data (fallback):', authUserId);
          } else {
            console.error('❌ Home - No user ID in stored user data');
            setUpcomingMessages([]);
            setRecentActivity([]);
            return;
          }
        } catch (fallbackError) {
          console.error('❌ Home - Fallback authentication error:', fallbackError);
          setUpcomingMessages([]);
          setRecentActivity([]);
          return;
        }
      }
      
      if (!authUserId) {
        console.error('❌ Home - No auth user ID found');
        setUpcomingMessages([]);
        setRecentActivity([]);
        return;
      }

      // Get the director record for the current user
      const { data: directorData, error: directorError } = await supabase
        .from('directors')
        .select('id')
        .eq('auth_user_id', authUserId)
        .single();

      if (directorError || !directorData) {
        console.error('❌ Home - Director fetch error:', directorError);
        setUpcomingMessages([]);
        setRecentActivity([]);
        return;
      }

      const directorId = directorData.id;
      console.log('✅ Home - Director ID found:', directorId);

      // Fetch upcoming messages (scheduled in the future)
      setIsLoadingMessages(true);
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('messages')
        .select(`
          *,
          child:actors!messages_actor_id_fkey(first_name, last_name),
          message_media(media_url, media_type)
        `)
        .eq('director_id', directorId)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(3);

      if (upcomingError) {
        console.error('❌ Home - Upcoming messages fetch error:', upcomingError);
      } else {
        console.log('✅ Home - Successfully fetched upcoming messages:', upcomingData);
        setUpcomingMessages(upcomingData || []);
      }
      setIsLoadingMessages(false);

      // Fetch recent activity (messages scheduled in the past)
      setIsLoadingActivity(true);
      const { data: recentData, error: recentError } = await supabase
        .from('messages')
        .select(`
          *,
          child:actors!messages_actor_id_fkey(first_name, last_name),
          message_media(media_url, media_type)
        `)
        .eq('director_id', directorId)
        .lt('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: false })
        .limit(3);

      if (recentError) {
        console.error('❌ Home - Recent activity fetch error:', recentError);
      } else {
        console.log('✅ Home - Successfully fetched recent activity:', recentData);
        setRecentActivity(recentData || []);
      }
      setIsLoadingActivity(false);

    } catch (error) {
      console.error('💥 Home - Unexpected error fetching messages:', error);
      setUpcomingMessages([]);
      setRecentActivity([]);
      setIsLoadingMessages(false);
      setIsLoadingActivity(false);
    }
  };

  const fetchDirectorProfile = async () => {
    try {
      console.log('🔍 Home - Fetching director profile');
      
      // Try to get from local storage first (faster)
      const userData = await storage.getUserData();
      if (userData?.firstName && userData?.lastName) {
        setDirectorProfile({
          first_name: userData.firstName,
          last_name: userData.lastName,
          profile_picture_url: userData.profile_picture_url,
        });
        console.log('✅ Home - Director profile loaded from local storage');
        return;
      }

      // If not in local storage, fetch from Supabase
      let authUserId: string | null = null;
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session?.user) {
          authUserId = session.user.id;
        } else {
          // Fallback to stored user data
          const fallbackData = await storage.getUserData();
          if (fallbackData?.id || fallbackData?.user_id) {
            authUserId = fallbackData.id || fallbackData.user_id;
          }
        }
      } catch (authError) {
        // Fallback to stored user data
        const fallbackData = await storage.getUserData();
        if (fallbackData?.id || fallbackData?.user_id) {
          authUserId = fallbackData.id || fallbackData.user_id;
        }
      }

      if (!authUserId) {
        console.warn('⚠️ Home - No auth user ID for fetching director profile');
        return;
      }

      const { data: directorData, error: directorError } = await supabase
        .from('directors')
        .select('first_name, last_name, profile_picture_url')
        .eq('auth_user_id', authUserId)
        .single();

      if (directorError || !directorData) {
        console.error('❌ Home - Director profile fetch error:', directorError);
        return;
      }

      setDirectorProfile(directorData);
      console.log('✅ Home - Director profile fetched from Supabase');
      
      // Save to local storage for quick access next time
      try {
        await storage.setUserData({
          ...userData,
          firstName: directorData.first_name,
          lastName: directorData.last_name,
          profile_picture_url: directorData.profile_picture_url,
        });
      } catch (storageError) {
        console.warn('⚠️ Home - Failed to save profile to local storage:', storageError);
      }
    } catch (error) {
      console.error('❌ Home - Error fetching director profile:', error);
    }
  };

  const handlePlayMessage = async (messageId: string, mediaUrl?: string, messageType?: string) => {
    console.log('🎵 Home - Play message requested:', { messageId, mediaUrl, messageType });

    // Handle text messages
    if (messageType === 'text') {
      const message = [...upcomingMessages, ...recentActivity].find(msg => msg.id === messageId);
      Alert.alert(
        'Text Message',
        message?.content || 'No content available',
        [{ text: 'OK' }]
      );
      return;
    }

    // Handle image messages
    if (messageType === 'image') {
      Alert.alert(
        'Image Message',
        'Image viewing functionality will be implemented soon.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Handle audio and video messages
    if (!mediaUrl) {
      Alert.alert('Error', 'No media URL available for this message.');
      return;
    }

    // Check if we're on web platform for audio
    if (Platform.OS === 'web' && messageType === 'audio') {
      Alert.alert(
        'Not Supported',
        'Audio playback is not available on web platform. Please use the mobile app for full functionality.'
      );
      return;
    }

    try {
      // Stop any currently playing media
      if (currentPlayingId && currentPlayingId !== messageId) {
        await stopCurrentPlayback();
      }

      // If clicking the same message that's currently playing, toggle playback
      if (currentPlayingId === messageId) {
        if (messageType === 'audio' && isAudioPlaying) {
          audioPlayer.pause();
          setCurrentPlayingId(null);
          return;
        } else if (messageType === 'video' && isVideoPlaying) {
          videoPlayer.pause();
          setCurrentPlayingId(null);
          return;
        }
      }

      // Set up new playback
      setCurrentPlayingId(messageId);
      setCurrentMediaUrl(mediaUrl);

      // Start playback based on message type
      if (messageType === 'audio') {
        console.log('🎵 Home - Starting audio playback');
        audioPlayer.play();
      } else if (messageType === 'video') {
        console.log('🎬 Home - Starting video playback');
        videoPlayer.play();
      }

    } catch (error) {
      console.error('❌ Home - Playback error:', error);
      Alert.alert(
        'Playback Error',
        'Failed to play the message. Please try again.'
      );
      setCurrentPlayingId(null);
    }
  };

  const stopCurrentPlayback = async () => {
    try {
      if (isAudioPlaying) {
        audioPlayer.pause();
      }
      if (isVideoPlaying) {
        videoPlayer.pause();
      }
      setCurrentPlayingId(null);
    } catch (error) {
      console.error('❌ Home - Error stopping playback:', error);
    }
  };

  const handleMoreOptions = (messageId: string) => {
    const message = [...upcomingMessages, ...recentActivity].find(msg => msg.id === messageId);
    if (!message) return;

    const options: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }> = [
        { text: 'Edit Message', onPress: () => handleEditMessage(messageId) },
        { text: 'View Details', onPress: () => handleViewDetails(messageId) },
        { text: 'Delete Message', onPress: () => handleDeleteMessage(messageId), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ];

    Alert.alert(
      'Message Options',
      `Options for message to ${message.child?.first_name}`,
      options
    );
  };

  const handleSendNow = (messageId: string) => {
    Alert.alert(
      'Send Now',
      'Are you sure you want to send this message immediately?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Now',
          onPress: () => confirmSendNow(messageId)
        },
      ]
    );
  };

  const confirmSendNow = async (messageId: string) => {
    try {
      // Update the scheduled_at to current time
      const { error } = await supabase
        .from('messages')
        .update({ scheduled_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) {
        console.error('❌ Home - Send now error:', error);
        Alert.alert('Error', 'Failed to send message. Please try again.');
        return;
      }

      // Refresh messages to update the UI
      await fetchMessages();
      Alert.alert('Success', 'Message sent successfully!');

    } catch (error) {
      console.error('❌ Home - Unexpected send now error:', error);
      Alert.alert('Error', 'An unexpected error occurred while sending the message.');
    }
  };

  const handleEditMessage = (messageId: string) => {
    Alert.alert('Edit Message', `Edit functionality for message ${messageId} coming soon!`);
  };

  const handleViewDetails = (messageId: string) => {
    Alert.alert('View Details', `Details view for message ${messageId} coming soon!`);
  };

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDeleteMessage(messageId)
        },
      ]
    );
  };

  const confirmDeleteMessage = async (messageId: string) => {
    try {
      // Stop playback if this message is currently playing
      if (currentPlayingId === messageId) {
        await stopCurrentPlayback();
      }

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('❌ Home - Delete error:', error);
        Alert.alert('Error', 'Failed to delete message. Please try again.');
        return;
      }

      // Refresh messages to update the UI
      await fetchMessages();
      Alert.alert('Success', 'Message deleted successfully.');

    } catch (error) {
      console.error('❌ Home - Unexpected delete error:', error);
      Alert.alert('Error', 'An unexpected error occurred while deleting the message.');
    }
  };

  const handleCreateMessage = () => {
    router.push('/create-message');
  };

  const handleSuggestedMessage = (message: SuggestedMessage) => {
    router.push({
      pathname: '/create-message',
      params: {
        promptText: message.text,
        promptTags: message.tags.join(','),
        promptId: message.id,
      }
    });
  };

  // Get current playing state for a specific message
  const getPlayingState = (messageId: string, messageType: string) => {
    if (currentPlayingId !== messageId) return false;

    if (messageType === 'audio') return isAudioPlaying;
    if (messageType === 'video') return isVideoPlaying;

    return false;
  };

  // Helper function to get image URL from message_media array
  const getImageFromMedia = (messageMedia?: { media_url: string; media_type: string }[]): string | null => {
    if (!messageMedia || messageMedia.length === 0) return null;
    const imageMedia = messageMedia.find(media => media.media_type === 'image');
    return imageMedia?.media_url || null;
  };

  // Helper function to get media URL for playback (audio/video)
  const getMediaUrlForPlayback = (message: HomeMessage): string | undefined => {
    if (!message.message_media || message.message_media.length === 0) return undefined;
    
    if (message.message_type === 'audio') {
      const audioMedia = message.message_media.find(media => media.media_type === 'audio');
      return audioMedia?.media_url;
    } else if (message.message_type === 'video') {
      const videoMedia = message.message_media.find(media => media.media_type === 'video');
      return videoMedia?.media_url;
    }
    
    // For text/image messages, return the first media URL if any
    return message.message_media[0]?.media_url;
  };

  const renderSuggestedMessage = (message: SuggestedMessage, index: number) => {
    const IconComponent = message.icon;
    return (
      <TouchableOpacity
        key={message.id}
        style={[
          styles.suggestedCard,
          { backgroundColor: message.backgroundColor }
        ]}
        onPress={() => handleSuggestedMessage(message)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { backgroundColor: message.color }]}>
          {IconComponent && <IconComponent size={24} color="#ffffff" strokeWidth={2} />}
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: message.color }]} numberOfLines={2}>
            {message.text}
          </Text>
          <Text style={[styles.cardCategory, { color: message.color }]}>
            {message.category.replace('-', ' ')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {!isLoadingMessages && !isLoadingActivity && upcomingMessages.length === 0 && recentActivity.length === 0 ? (
            // Empty State - No Messages at All
            <>
              {/* Header with Profile */}
              <View style={styles.emptyHeader}>
                <Image
                  source={{ 
                    uri: directorProfile?.profile_picture_url || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' 
                  }}
                  style={styles.emptyProfileImage}
                  resizeMode="cover"
                />
                <Text style={styles.emptyGreeting}>
                  Hi {directorProfile?.first_name || firstName || 'Jamie'} 👋
                </Text>
                <Text style={styles.emptySubtitle}>
                  Your first memory is waiting to be made.
                </Text>
              </View>

              {/* Create First TimeCapsule Button */}
              <TouchableOpacity
                style={styles.emptyCreateButton}
                onPress={handleCreateMessage}
                activeOpacity={0.8}
              >
                <Plus size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.emptyCreateButtonText}>Create Your First TimeCapsule</Text>
              </TouchableOpacity>

              {/* Suggested for You Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Suggested for You</Text>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.viewAllLink}>View All</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.suggestedContainer}
                  style={styles.suggestedScrollView}
                >
                  {/* Milestone Card */}
                  <TouchableOpacity
                    style={[styles.emptySuggestedCard, { backgroundColor: '#FEF3C7' }]}
                    onPress={() => handleSuggestedMessage(suggestedMessages[1])}
                    activeOpacity={0.8}
                  >
                    <View style={styles.emptySuggestedHeader}>
                      <View style={[styles.emptyIconBadge, { backgroundColor: '#F59E0B' }]}>
                        <GraduationCap size={16} color="#ffffff" strokeWidth={2} />
                      </View>
                      <View style={[styles.emptyCategoryBadge, { backgroundColor: '#F59E0B' }]}>
                        <Text style={styles.emptyCategoryText}>Milestone</Text>
                      </View>
                    </View>
                    <Text style={styles.emptySuggestedTitle}>First Day of School</Text>
                    <Text style={styles.emptySuggestedPreview}>
                      "Here's what I want you to remember on your first day..."
                    </Text>
                    <TouchableOpacity style={styles.usePromptButton} activeOpacity={0.9}>
                      <Text style={styles.usePromptButtonText}>Use This Prompt</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {/* Support Card */}
                  <TouchableOpacity
                    style={[styles.emptySuggestedCard, { backgroundColor: '#FFE5E5' }]}
                    onPress={() => handleSuggestedMessage(suggestedMessages[0])}
                    activeOpacity={0.8}
                  >
                    <View style={styles.emptySuggestedHeader}>
                      <View style={[styles.emptyIconBadge, { backgroundColor: '#EF4444' }]}>
                        <Heart size={16} color="#ffffff" strokeWidth={2} />
                      </View>
                      <View style={[styles.emptyCategoryBadge, { backgroundColor: '#EF4444' }]}>
                        <Text style={styles.emptyCategoryText}>Support</Text>
                      </View>
                    </View>
                    <Text style={styles.emptySuggestedTitle}>Tough Times</Text>
                    <Text style={styles.emptySuggestedPreview}>
                      "When times get overwhelming, remember this..."
                    </Text>
                    <TouchableOpacity style={styles.usePromptButton} activeOpacity={0.9}>
                      <Text style={styles.usePromptButtonText}>Use This Prompt</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Your Timecapsules Empty State */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Timecapsules</Text>
                <View style={styles.emptyTimecapsulesContainer}>
                  <View style={styles.emptyTimecapsulesIconCircle}>
                    <Mail size={32} color="#8B5CF6" strokeWidth={2} />
                  </View>
                  <Text style={styles.emptyTimecapsulesText}>
                    Your future activity will appear here—send your first TimeCapsule to see it in action.
                  </Text>
                  <TouchableOpacity
                    style={styles.createOneNowButton}
                    onPress={handleCreateMessage}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.createOneNowButtonText}>Create One Now</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Message Templates Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Message Templates</Text>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.viewAllLink}>Browse</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.templatesGrid}>
                  <TouchableOpacity style={styles.templateCard} activeOpacity={0.8}>
                    <Image
                      source={{ uri: 'https://res.cloudinary.com/dhagsapm2/image/upload/v1761915746/e9fb81d616cbe1b00c3ac59b34ec30f7ff68b594_bgv7nl.jpg' }}
                      style={styles.templateImage}
                      resizeMode="cover"
                    />
                    <View style={styles.templateOverlay}>
                      <View style={styles.templateContent}>
                        <Text style={styles.templateTitle}>First Heartbreak</Text>
                        <Text style={styles.templateCategory}>Emotional Support</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.templateCard} activeOpacity={0.8}>
                    <Image
                      source={{ uri: 'https://res.cloudinary.com/dhagsapm2/image/upload/v1761915646/10d89c040a01ca995fa08795df2efcb5257df1c7_tl2ggp.png' }}
                      style={styles.templateImage}
                      resizeMode="cover"
                    />
                    <View style={styles.templateOverlay}>
                      <View style={styles.templateContent}>
                        <Text style={styles.templateTitle}>Graduation Day</Text>
                        <Text style={styles.templateCategory}>Milestone</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.templateCard} activeOpacity={0.8}>
                    <Image
                      source={{ uri: 'https://res.cloudinary.com/dhagsapm2/image/upload/v1761915734/e7c6d73f84099aaac632731cac9269b7098edc14_adq47w.png' }}
                      style={styles.templateImage}
                      resizeMode="cover"
                    />
                    <View style={styles.templateOverlay}>
                      <View style={styles.templateContent}>
                        <Text style={styles.templateTitle}>Wedding Day</Text>
                        <Text style={styles.templateCategory}>Milestone</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.templateCard} activeOpacity={0.8}>
                    <Image
                      source={{ uri: 'https://res.cloudinary.com/dhagsapm2/image/upload/v1761915913/47e174ee7e5a0cce38beb0092a5a4b642f057fc4_ujw1ql.png' }}
                      style={styles.templateImage}
                      resizeMode="cover"
                    />
                    <View style={styles.templateOverlay}>
                      <View style={styles.templateContent}>
                        <Text style={styles.templateTitle}>First Job</Text>
                        <Text style={styles.templateCategory}>Life Advice</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            // Regular State - Has Messages
            <>
              {/* Header with Profile Picture */}
              <View style={styles.headerWithProfile}>
                <Image
                  source={{ 
                    uri: directorProfile?.profile_picture_url || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' 
                  }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.greetingWithProfile}>
                    Hi {directorProfile?.first_name || firstName || 'Jamie'} 👋
                  </Text>
                  <Text style={styles.subtitleWithProfile}>
                    What memory will you create today?
                  </Text>
                </View>
              </View>

              {/* Create Message Button */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateMessage}
                activeOpacity={0.8}
              >
                <Plus size={24} color="#ffffff" strokeWidth={2} />
                <Text style={styles.createButtonText}>Create Your First TimeCapsule</Text>
              </TouchableOpacity>

              {/* Suggested for You Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Suggested for You</Text>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.viewAllLink}>View All</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.suggestedContainer}
                  style={styles.suggestedScrollView}
                >
                  {suggestedMessages.slice(0, 2).map((message, index) => (
                    <TouchableOpacity
                      key={message.id}
                      style={[styles.newSuggestedCard, { backgroundColor: message.backgroundColor }]}
                      onPress={() => handleSuggestedMessage(message)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.newSuggestedHeader}>
                        <View style={[styles.newIconBadge, { backgroundColor: message.color }]}>
                          {React.createElement(message.icon!, { size: 16, color: '#ffffff', strokeWidth: 2 })}
                        </View>
                        <View style={[styles.newCategoryBadge, { backgroundColor: message.color }]}>
                          <Text style={styles.newCategoryText}>{message.category.split('-')[0]}</Text>
                        </View>
                      </View>
                      <Text style={styles.newSuggestedTitle}>{message.text.split(',')[0]}</Text>
                      <Text style={styles.newSuggestedPreview}>
                        "{message.text.includes('...') ? message.text : `Here's what I want you to remember...`}"
                      </Text>
                      <TouchableOpacity style={[styles.usePromptButton, { backgroundColor: message.color }]} activeOpacity={0.9}>
                        <Text style={styles.usePromptButtonText}>Use This Prompt</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Your Timecapsules Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Your Timecapsules</Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/vault')}>
                    <Text style={styles.viewAllLink}>View All</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.timecapsulesContainer}
                  style={styles.timecapsulesScrollView}
                >
                  {isLoadingMessages || isLoadingActivity ? (
                    <View style={styles.loadingCard}>
                      <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                  ) : (
                    <>
                      {[...upcomingMessages, ...recentActivity].slice(0, 3).map((message) => {
                        const imageUrl = getImageFromMedia(message.message_media);
                        const playbackUrl = getMediaUrlForPlayback(message);
                        const displayImageUrl = imageUrl || 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg';
                        const audioPlaceholderUrl = 'https://images.pexels.com/photos/3865556/pexels-photo-3865556.jpeg';

                        return (
                          <View key={message.id} style={styles.timecapsuleCard}>
                            <TouchableOpacity
                              style={styles.timecapsuleImageContainer}
                              onPress={() => handlePlayMessage(message.id, playbackUrl, message.message_type)}
                              activeOpacity={0.9}
                            >
                              {message.message_type === 'audio' ? (
                                <View style={styles.audioTimecapsulePreview}>
                                  <Image
                                    source={{ uri: imageUrl || audioPlaceholderUrl }}
                                    style={styles.timecapsuleImage}
                                    resizeMode="cover"
                                  />
                                  <View style={styles.audioOverlay}>
                                    <View style={styles.waveformIcon}>
                                      {[...Array(5)].map((_, i) => (
                                        <View key={i} style={[styles.waveBar, { height: [12, 20, 16, 24, 14][i] }]} />
                                      ))}
                                    </View>
                                  </View>
                                </View>
                              ) : (
                                <Image
                                  source={{ uri: displayImageUrl }}
                                  style={styles.timecapsuleImage}
                                  resizeMode="cover"
                                />
                              )}

                              <TouchableOpacity
                                style={styles.timecapsulePlayButton}
                                onPress={() => handlePlayMessage(message.id, playbackUrl, message.message_type)}
                              >
                                {getPlayingState(message.id, message.message_type) ? (
                                  <Pause size={16} color="#ffffff" strokeWidth={2} />
                                ) : (
                                  <Play size={16} color="#ffffff" strokeWidth={2} />
                                )}
                              </TouchableOpacity>

                            <View style={styles.timecapsuleTypeIndicator}>
                              {message.message_type === 'audio' ? (
                                <Mic size={12} color="#ffffff" strokeWidth={2} />
                              ) : message.message_type === 'video' ? (
                                <VideoIcon size={12} color="#ffffff" strokeWidth={2} />
                              ) : message.message_type === 'image' ? (
                                <ImageIcon size={12} color="#ffffff" strokeWidth={2} />
                              ) : (
                                <MessageSquare size={12} color="#ffffff" strokeWidth={2} />
                              )}
                              <Text style={styles.timecapsuleTypeText}>
                                {message.message_type.charAt(0).toUpperCase() + message.message_type.slice(1)}
                              </Text>
                            </View>

                            <TouchableOpacity style={styles.bookmarkIcon}>
                              <Eye size={16} color="#ffffff" strokeWidth={2} />
                            </TouchableOpacity>
                          </TouchableOpacity>

                            <View style={styles.timecapsuleInfo}>
                              <Text style={styles.timecapsuleTitle} numberOfLines={1}>
                                {message.content?.substring(0, 20) || 'Sweet 16 Birthday'}
                              </Text>
                              <Text style={styles.timecapsuleDetails}>
                                For: {message.child?.first_name || 'Ava'} • {new Date(message.scheduled_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </Text>
                            </View>
                          </View>
                        );
                      })}

                      <TouchableOpacity
                        style={styles.createTimecapsuleCard}
                        onPress={handleCreateMessage}
                        activeOpacity={0.8}
                      >
                        <View style={styles.createTimecapsuleContent}>
                          <View style={styles.createTimecapsuleIcon}>
                            <Plus size={32} color="#8B5CF6" strokeWidth={2} />
                          </View>
                          <Text style={styles.createTimecapsuleText}>Create a New{'\n'}Timecapsule</Text>
                        </View>
                      </TouchableOpacity>
                    </>
                  )}
                </ScrollView>
              </View>

              {/* Message Templates Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Message Templates</Text>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.viewAllLink}>Browse</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.templatesGrid}>
                  <TouchableOpacity style={styles.templateCard} activeOpacity={0.8}>
                    <Image
                      source={{ uri: 'https://images.pexels.com/photos/1416736/pexels-photo-1416736.jpeg' }}
                      style={styles.templateImage}
                      resizeMode="cover"
                    />
                    <View style={styles.templateOverlay}>
                      <View style={styles.templateContent}>
                        <Text style={styles.templateTitle}>First Heartbreak</Text>
                        <Text style={styles.templateCategory}>Emotional Support</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.templateCard} activeOpacity={0.8}>
                    <Image
                      source={{ uri: 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg' }}
                      style={styles.templateImage}
                      resizeMode="cover"
                    />
                    <View style={styles.templateOverlay}>
                      <View style={styles.templateContent}>
                        <Text style={styles.templateTitle}>Graduation Day</Text>
                        <Text style={styles.templateCategory}>Milestone</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.templateCard} activeOpacity={0.8}>
                    <Image
                      source={{ uri: 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg' }}
                      style={styles.templateImage}
                      resizeMode="cover"
                    />
                    <View style={styles.templateOverlay}>
                      <View style={styles.templateContent}>
                        <Text style={styles.templateTitle}>Wedding Day</Text>
                        <Text style={styles.templateCategory}>Milestone</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.templateCard} activeOpacity={0.8}>
                    <Image
                      source={{ uri: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg' }}
                      style={styles.templateImage}
                      resizeMode="cover"
                    />
                    <View style={styles.templateOverlay}>
                      <View style={styles.templateContent}>
                        <Text style={styles.templateTitle}>First Job</Text>
                        <Text style={styles.templateCategory}>Life Advice</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding for tab bar
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 24,
  },
  headerWithProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 24,
    gap: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  greetingWithProfile: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  subtitleWithProfile: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  createButton: {
    backgroundColor: '#3B4F75',
    marginHorizontal: 24,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    gap: 12,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 24,
    fontFamily: 'Poppins-Bold',
  },
  upcomingMessagesContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  suggestedScrollView: {
    paddingLeft: 24,
  },
  suggestedContainer: {
    paddingRight: 24,
    gap: 16,
  },
  suggestedCard: {
    width: 300,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 22,
  },
  cardCategory: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textTransform: 'capitalize',
  },
  bannerContainer: {
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  bannerImage: {
    width: '100%',
    height: 160,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  bannerContent: {
    flex: 1,
    marginRight: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 10,
    paddingBottom: 25,
    fontFamily: 'Inter-Bold',
  },
  bannerDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    opacity: 0.9,
    fontFamily: 'Inter-Regular',
  },
  emptyState: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  emptyHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  emptyProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyGreeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  emptyCreateButton: {
    backgroundColor: '#3B4F75',
    marginHorizontal: 24,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  emptyCreateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  viewAllLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  emptySuggestedCard: {
    width: 280,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptySuggestedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  emptyIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyCategoryText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  emptySuggestedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  emptySuggestedPreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  usePromptButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  usePromptButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  emptyTimecapsulesContainer: {
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyTimecapsulesIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTimecapsulesText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  createOneNowButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createOneNowButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  templatesGrid: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  templateCard: {
    width: '47%',
    height: 140,
    borderRadius: 16,
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
  templateImage: {
    width: '100%',
    height: '100%',
  },
  templateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  templateContent: {
    gap: 4,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Poppins-Bold',
  },
  templateCategory: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    fontFamily: 'Poppins-Regular',
  },
  newSuggestedCard: {
    width: 280,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  newSuggestedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  newIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newCategoryText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'capitalize',
  },
  newSuggestedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  newSuggestedPreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  timecapsulesScrollView: {
    paddingLeft: 24,
  },
  timecapsulesContainer: {
    paddingRight: 24,
    gap: 16,
  },
  timecapsuleCard: {
    width: 180,
  },
  timecapsuleImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  timecapsuleImage: {
    width: '100%',
    height: '100%',
  },
  audioTimecapsulePreview: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  audioOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformIcon: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 30,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  timecapsulePlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timecapsuleTypeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timecapsuleTypeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  bookmarkIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timecapsuleInfo: {
    gap: 4,
  },
  timecapsuleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  timecapsuleDetails: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  createTimecapsuleCard: {
    width: 180,
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTimecapsuleContent: {
    alignItems: 'center',
    gap: 12,
  },
  createTimecapsuleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTimecapsuleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  loadingCard: {
    width: 180,
    height: 180,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
});