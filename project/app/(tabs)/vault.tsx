import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { supabase } from '@/libs/superbase';
import VaultMessageCard from '@/components/VaultMessageCard'; // Import the new component

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

  useEffect(() => {
    fetchVaultMessages();
  }, []);

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

  const handlePlayMessage = (messageId: string, mediaUrl?: string, messageType?: string) => {
    // Implement actual playback logic here based on mediaUrl and messageType
    // For now, use an alert
    Alert.alert('Play Message', `Playing message ID: ${messageId}\nType: ${messageType}\nMedia URL: ${mediaUrl || 'N/A'}`);
  };

  const handleMoreOptions = (messageId: string) => {
    Alert.alert('More Options', `Options for message ID: ${messageId}`);
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
    marginHorizontal: 0, // Remove horizontal margin from here
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
    paddingBottom: 20, // Add some padding at the bottom
  },
  messagesList: {
    gap: 16, // Space between message cards
  },
});
