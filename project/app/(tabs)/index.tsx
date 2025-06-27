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
import { Plus, ArrowRight, Calendar, GraduationCap, PartyPopper, Heart } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEvent } from 'expo';
import { useAudioPlayer } from 'expo-audio';
import { useVideoPlayer } from 'expo-video';
import { supabase } from '@/libs/superbase';
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

export default function HomeScreen() {
  const router = useRouter();
  const { firstName } = useLocalSearchParams();

  // State for messages
  const [upcomingMessages, setUpcomingMessages] = useState<HomeMessage[]>([]);
  const [recentActivity, setRecentActivity] = useState<HomeMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

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

      // Get the current authenticated user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.error('❌ Home - Authentication error:', sessionError);
        setUpcomingMessages([]);
        setRecentActivity([]);
        return;
      }

      const authUserId = session.user.id;
      console.log('✅ Home - Authenticated user ID:', authUserId);

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>
              Hello, {firstName || 'there'}! 👋
            </Text>
            <Text style={styles.subtitle}>
              Ready to create something meaningful today?
            </Text>
          </View>

          {/* Create Message Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateMessage}
            activeOpacity={0.8}
          >
            <Plus size={24} color="#ffffff" strokeWidth={2} />
            <Text style={styles.createButtonText}>Create New Message</Text>
          </TouchableOpacity>

          {/* Suggested Messages Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Messages</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedContainer}
              style={styles.suggestedScrollView}
            >
              {suggestedMessages.map((message, index) =>
                renderSuggestedMessage(message, index)
              )}
            </ScrollView>
          </View>

          {/* Banner Section */}
          <Animated.View
            style={[
              styles.bannerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Image
              source={require('../../assets/images/home-image.png')}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Let us help you send some light. ✨</Text>
                <Text style={styles.bannerDescription}>
                  Share a thoughtful daily affirmation — schedule it now and brighten their day.
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Upcoming Messages Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Messages</Text>

            {isLoadingMessages ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Loading your upcoming messages...</Text>
              </View>
            ) : upcomingMessages.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  You haven't scheduled any messages yet. Once you do, they'll appear here with their delivery dates.
                </Text>
              </View>
            ) : (
              <View style={styles.upcomingMessagesContainer}>
                {upcomingMessages.map((message) => (
                  <HomeMessageCard
                    key={message.id}
                    message={message}
                    onPlayMessage={handlePlayMessage}
                    onMoreOptions={handleMoreOptions}
                    onSendNow={handleSendNow}
                    isPlaying={getPlayingState(message.id, message.message_type)}
                    isUpcoming={true}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Recent Activity Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>

            {isLoadingActivity ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Loading your recent activity...</Text>
              </View>
            ) : recentActivity.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No activity yet — but once you share your first message, it'll show up here.
                </Text>
              </View>
            ) : (
              <View style={styles.upcomingMessagesContainer}>
                {recentActivity.map((message) => (
                  <HomeMessageCard
                    key={message.id}
                    message={message}
                    onPlayMessage={handlePlayMessage}
                    onMoreOptions={handleMoreOptions}
                    isPlaying={getPlayingState(message.id, message.message_type)}
                    isUpcoming={false}
                  />
                ))}
              </View>
            )}
          </View>
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
});