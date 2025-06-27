import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useEvent } from 'expo';
import { useAudioPlayer } from 'expo-audio';
import { useVideoPlayer } from 'expo-video';
import { supabase } from '@/libs/superbase';
import VaultMessageCard from '@/components/VaultMessageCard';

interface VaultMessage {
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

export default function VaultScreen() {
  const [vaultMessages, setVaultMessages] = useState<VaultMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [currentMediaUrl, setCurrentMediaUrl] = useState<string>('');

  // Audio player setup
  const audioPlayer = useAudioPlayer(currentMediaUrl);
  
  // Video player setup  
  const videoPlayer = useVideoPlayer(currentMediaUrl, player => {
    player.loop = false;
  });

  // Listen to playing state changes
  const { isPlaying: isAudioPlaying } = useEvent(audioPlayer, 'playingChange', { isPlaying: audioPlayer.playing });
  const { isPlaying: isVideoPlaying } = useEvent(videoPlayer, 'playingChange', { isPlaying: videoPlayer.playing });

  useEffect(() => {
    fetchVaultMessages();

    return () => {
      // Cleanup players on unmount
      if (audioPlayer) {
        audioPlayer.remove();
      }
    };
  }, []);

  // Update player sources when currentMediaUrl changes
  useEffect(() => {
    if (currentMediaUrl) {
      const currentMessage = vaultMessages.find(msg => msg.id === currentPlayingId);
      if (currentMessage?.message_type === 'audio') {
        audioPlayer.replace(currentMediaUrl);
      } else if (currentMessage?.message_type === 'video') {
        videoPlayer.replace(currentMediaUrl);
      }
    }
  }, [currentMediaUrl, currentPlayingId]);

  const fetchVaultMessages = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Vault - Starting fetchVaultMessages process');
      
      // Get the current authenticated user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('❌ Vault - Authentication error:', sessionError);
        setVaultMessages([]);
        Alert.alert('Authentication Error', 'Please sign in again to view your vault.');
        return;
      }

      const authUserId = session.user.id;
      console.log('✅ Vault - Authenticated user ID:', authUserId);

      // Get the director record for the current user
      const { data: directorData, error: directorError } = await supabase
        .from('directors')
        .select('id')
        .eq('auth_user_id', authUserId)
        .single();

      if (directorError || !directorData) {
        console.error('❌ Vault - Director fetch error:', directorError);
        setVaultMessages([]);
        Alert.alert('Error', 'Could not find your profile. Please ensure you have completed onboarding.');
        return;
      }

      const directorId = directorData.id;
      console.log('✅ Vault - Director ID found:', directorId);

      // Fetch all messages for the current director, ordered by scheduled_at
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          child:actors!messages_actor_id_fkey(first_name, last_name),
          message_media(media_url, media_type)
        `)
        .eq('director_id', directorId)
        .order('scheduled_at', { ascending: false }); // Show most recent first

      if (messagesError) {
        console.error('❌ Vault - Messages fetch error:', messagesError);
        setVaultMessages([]);
        Alert.alert('Error', 'Failed to load your messages. Please try again.');
        return;
      }

      console.log('✅ Vault - Successfully fetched messages:', messagesData);
      setVaultMessages(messagesData || []);
      
    } catch (error) {
      console.error('💥 Vault - Unexpected error fetching messages:', error);
      setVaultMessages([]);
      Alert.alert('Error', 'An unexpected error occurred while fetching messages.');
    } finally {
      setIsLoading(false);
      console.log('🏁 Vault - fetchVaultMessages process finished');
    }
  };

  const handlePlayMessage = async (messageId: string, mediaUrl?: string, messageType?: string) => {
    console.log('🎵 Vault - Play message requested:', { messageId, mediaUrl, messageType });

    // Handle text messages
    if (messageType === 'text') {
      const message = vaultMessages.find(msg => msg.id === messageId);
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
        console.log('🎵 Vault - Starting audio playback');
        audioPlayer.play();
      } else if (messageType === 'video') {
        console.log('🎬 Vault - Starting video playback');
        videoPlayer.play();
      }

    } catch (error) {
      console.error('❌ Vault - Playback error:', error);
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
      console.error('❌ Vault - Error stopping playback:', error);
    }
  };

  const handleMoreOptions = (messageId: string) => {
    const message = vaultMessages.find(msg => msg.id === messageId);
    if (!message) return;

    const options = [
      { text: 'Edit Message', onPress: () => handleEditMessage(messageId) },
      { text: 'Duplicate Message', onPress: () => handleDuplicateMessage(messageId) },
      { text: 'Share Message', onPress: () => handleShareMessage(messageId) },
      { text: 'Delete Message', onPress: () => handleDeleteMessage(messageId), style: 'destructive' },
      { text: 'Cancel', style: 'cancel' },
    ];

    Alert.alert(
      'Message Options',
      `Options for message to ${message.child?.first_name}`,
      options
    );
  };

  const handleEditMessage = (messageId: string) => {
    Alert.alert('Edit Message', `Edit functionality for message ${messageId} coming soon!`);
  };

  const handleDuplicateMessage = (messageId: string) => {
    Alert.alert('Duplicate Message', `Duplicate functionality for message ${messageId} coming soon!`);
  };

  const handleShareMessage = (messageId: string) => {
    Alert.alert('Share Message', `Share functionality for message ${messageId} coming soon!`);
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
        console.error('❌ Vault - Delete error:', error);
        Alert.alert('Error', 'Failed to delete message. Please try again.');
        return;
      }

      // Remove from local state
      setVaultMessages(prev => prev.filter(msg => msg.id !== messageId));
      Alert.alert('Success', 'Message deleted successfully.');

    } catch (error) {
      console.error('❌ Vault - Unexpected delete error:', error);
      Alert.alert('Error', 'An unexpected error occurred while deleting the message.');
    }
  };

  // Get current playing state for a specific message
  const getPlayingState = (messageId: string, messageType: string) => {
    if (currentPlayingId !== messageId) return false;
    
    if (messageType === 'audio') return isAudioPlaying;
    if (messageType === 'video') return isVideoPlaying;
    
    return false;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Your Vault</Text>
        <Text style={styles.description}>
          All your saved messages and memories are stored here.
        </Text>

        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Loading your messages...</Text>
          </View>
        ) : vaultMessages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Your vault is empty. Start creating messages to see them here!
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.messagesList}>
              {vaultMessages.map((message) => (
                <VaultMessageCard
                  key={message.id}
                  message={message}
                  onPlayMessage={handlePlayMessage}
                  onMoreOptions={handleMoreOptions}
                  isPlaying={getPlayingState(message.id, message.message_type)}
                  videoPlayer={message.message_type === 'video' && currentPlayingId === message.id ? videoPlayer : undefined}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'left',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  messagesList: {
    gap: 16,
  },
});