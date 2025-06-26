import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {
  Settings,
  Bell,
  Plus,
  Edit3,
  Play,
  MoreVertical,
  MessageSquare,
  Mic,
  Video as VideoIcon,
  Calendar,
  Send,
  Lightbulb,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/libs/superbase';

interface Director {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  director_type?: string;
}

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  username: string;
  scheduled_count: number;
  draft_count: number;
}

interface FamilyMember {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface UpcomingMessage {
  id: string;
  message_type: 'text' | 'audio' | 'video';
  content?: string;
  scheduled_at: string;
  child: {
    first_name: string;
  };
  message_media?: {
    media_url: string;
    media_type: string;
  }[];
}

interface ActivityStats {
  scheduled: number;
  voice: number;
  video: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [director, setDirector] = useState<Director | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [upcomingMessages, setUpcomingMessages] = useState<UpcomingMessage[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats>({ scheduled: 0, voice: 0, video: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Get the current authenticated user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Authentication error:', sessionError);
        return;
      }

      const authUserId = session.user.id;

      // Fetch director profile
      const { data: directorData, error: directorError } = await supabase
        .from('directors')
        .select('id, first_name, last_name, email, director_type')
        .eq('auth_user_id', authUserId)
        .single();

      if (directorError) {
        console.error('Error fetching director:', directorError);
        return;
      }

      setDirector(directorData);

      if (directorData) {
        // Fetch children with message counts
        await fetchChildren(directorData.id);
        
        // Fetch upcoming messages
        await fetchUpcomingMessages(directorData.id);
        
        // Fetch activity stats
        await fetchActivityStats(directorData.id);
        
        // Fetch family members (placeholder for now)
        setFamilyMembers([
          {
            id: '1',
            first_name: 'John',
            last_name: 'Johnson',
            role: 'Father',
          },
        ]);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChildren = async (directorId: string) => {
    try {
      // Get director-actor relationships
      const { data: relationships, error: relationshipError } = await supabase
        .from('director_actor')
        .select('actor_id')
        .eq('director_id', directorId);

      if (relationshipError) {
        console.error('Error fetching relationships:', relationshipError);
        return;
      }

      if (!relationships || relationships.length === 0) {
        setChildren([]);
        return;
      }

      const actorIds = relationships.map(rel => rel.actor_id);

      // Fetch children data
      const { data: childrenData, error: childrenError } = await supabase
        .from('actors')
        .select('id, first_name, last_name, date_of_birth, username')
        .in('id', actorIds);

      if (childrenError) {
        console.error('Error fetching children:', childrenError);
        return;
      }

      // For each child, get message counts
      const childrenWithCounts = await Promise.all(
        (childrenData || []).map(async (child) => {
          // Get scheduled messages count
          const { count: scheduledCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('actor_id', child.id)
            .gte('scheduled_at', new Date().toISOString());

          // For now, set draft count to 0 (would need a drafts table)
          const draftCount = 0;

          return {
            ...child,
            scheduled_count: scheduledCount || 0,
            draft_count: draftCount,
          };
        })
      );

      setChildren(childrenWithCounts);
    } catch (error) {
      console.error('Error in fetchChildren:', error);
    }
  };

  const fetchUpcomingMessages = async (directorId: string) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          child:actors!messages_actor_id_fkey(first_name),
          message_media(media_url, media_type)
        `)
        .eq('director_id', directorId)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(3);

      if (messagesError) {
        console.error('Error fetching upcoming messages:', messagesError);
        return;
      }

      setUpcomingMessages(messagesData || []);
    } catch (error) {
      console.error('Error in fetchUpcomingMessages:', error);
    }
  };

  const fetchActivityStats = async (directorId: string) => {
    try {
      // Get total scheduled messages
      const { count: scheduledCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('director_id', directorId);

      // Get voice messages count
      const { count: voiceCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('director_id', directorId)
        .eq('message_type', 'audio');

      // Get video messages count
      const { count: videoCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('director_id', directorId)
        .eq('message_type', 'video');

      setActivityStats({
        scheduled: scheduledCount || 0,
        voice: voiceCount || 0,
        video: videoCount || 0,
      });
    } catch (error) {
      console.error('Error fetching activity stats:', error);
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

  const handleAccountSettings = () => {
    Alert.alert('Account Settings', 'Account settings feature coming soon!');
  };

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Notification settings feature coming soon!');
  };

  const handleAddChild = () => {
    router.push('/child-profile-setup');
  };

  const handleChildPress = (childId: string) => {
    router.push({
      pathname: '/create-message',
      params: { childId }
    });
  };

  const handleAddFamilyMember = () => {
    Alert.alert('Add Family Member', 'Family member invitation feature coming soon!');
  };

  const handleSendNow = (messageId: string) => {
    Alert.alert('Send Now', 'Send message now feature coming soon!');
  };

  const handleMessageOptions = (messageId: string) => {
    Alert.alert('Message Options', 'Message options feature coming soon!');
  };

  const handleSuggestedAction = (action: string) => {
    if (action === 'birthday') {
      Alert.alert('Birthday Reminder', 'Birthday message creation feature coming soon!');
    }
  };

  const renderMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Mic size={16} color="#8B5CF6" strokeWidth={2} />;
      case 'video':
        return <VideoIcon size={16} color="#EF4444" strokeWidth={2} />;
      case 'text':
        return <MessageSquare size={16} color="#3B82F6" strokeWidth={2} />;
      default:
        return <MessageSquare size={16} color="#6B7280" strokeWidth={2} />;
    }
  };

  const renderUpcomingMessage = (message: UpcomingMessage, index: number) => {
    const isVideo = message.message_type === 'video';
    const isAudio = message.message_type === 'audio';
    const isText = message.message_type === 'text';

    return (
      <View key={message.id} style={styles.upcomingMessageCard}>
        {/* Message Preview */}
        {isVideo && (
          <View style={styles.videoPreview}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/4145353/pexels-photo-4145353.jpeg' }}
              style={styles.videoThumbnail}
              resizeMode="cover"
            />
            <View style={styles.playOverlay}>
              <Play size={24} color="#ffffff" strokeWidth={2} />
            </View>
          </View>
        )}

        {isAudio && (
          <View style={styles.audioPreview}>
            <View style={styles.audioPlayButton}>
              <Play size={20} color="#ffffff" strokeWidth={2} />
            </View>
            <View style={styles.waveform}>
              {[...Array(8)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveformBar,
                    { height: Math.random() * 20 + 8 }
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {isText && (
          <View style={styles.textPreview}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/3865556/pexels-photo-3865556.jpeg' }}
              style={styles.textImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Message Details */}
        <View style={styles.messageDetails}>
          <Text style={styles.messageTitle}>
            {message.content?.substring(0, 20) || 'Untitled Message'}
            {(message.content?.length || 0) > 20 ? '...' : ''}
          </Text>
          <Text style={styles.messageRecipient}>
            For: {message.child?.first_name || 'Child'}
          </Text>
          
          <View style={styles.messageTypeRow}>
            {renderMessageTypeIcon(message.message_type)}
            <Text style={styles.messageType}>
              {message.message_type === 'audio' ? 'Audio Message' :
               message.message_type === 'video' ? 'Video Message' : 'Text Message'}
            </Text>
          </View>
          
          <Text style={styles.scheduledDate}>
            Scheduled: {formatScheduledDate(message.scheduled_at)}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.messageActions}>
          <TouchableOpacity
            style={styles.sendNowButton}
            onPress={() => handleSendNow(message.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.sendNowText}>Send Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.messageOptionsButton}
            onPress={() => handleMessageOptions(message.id)}
            activeOpacity={0.7}
          >
            <MoreVertical size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' }}
              style={styles.profileAvatar}
              resizeMode="cover"
            />
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>
                {director ? `${director.first_name} ${director.last_name}` : 'User Name'}
              </Text>
              <Text style={styles.profileEmail}>
                {director?.email || 'user@example.com'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileButton} activeOpacity={0.7}>
            <Edit3 size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Account Settings & Notifications */}
        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleAccountSettings}
            activeOpacity={0.7}
          >
            <Settings size={20} color="#6B7280" strokeWidth={2} />
            <Text style={styles.settingText}>Account Settings</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleNotifications}
            activeOpacity={0.7}
          >
            <Bell size={20} color="#6B7280" strokeWidth={2} />
            <Text style={styles.settingText}>Notifications</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.activityStats}>
            <View style={styles.activityStat}>
              <View style={styles.activityIcon}>
                <Calendar size={20} color="#3B82F6" strokeWidth={2} />
              </View>
              <Text style={styles.activityNumber}>{activityStats.scheduled}</Text>
              <Text style={styles.activityLabel}>Scheduled</Text>
            </View>
            
            <View style={styles.activityStat}>
              <View style={styles.activityIcon}>
                <Mic size={20} color="#8B5CF6" strokeWidth={2} />
              </View>
              <Text style={styles.activityNumber}>{activityStats.voice}</Text>
              <Text style={styles.activityLabel}>Voice</Text>
            </View>
            
            <View style={styles.activityStat}>
              <View style={styles.activityIcon}>
                <VideoIcon size={20} color="#EF4444" strokeWidth={2} />
              </View>
              <Text style={styles.activityNumber}>{activityStats.video}</Text>
              <Text style={styles.activityLabel}>Video</Text>
            </View>
          </View>
        </View>

        {/* Your Children Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Children</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddChild}
              activeOpacity={0.7}
            >
              <Plus size={20} color="#3B4F75" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No children added yet. Tap the + button to add your first child.
              </Text>
            </View>
          ) : (
            <View style={styles.childrenContainer}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={styles.childCard}
                  onPress={() => handleChildPress(child.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.childHeader}>
                    <Image
                      source={{ uri: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg' }}
                      style={styles.childAvatar}
                      resizeMode="cover"
                    />
                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{child.first_name}</Text>
                      <Text style={styles.childAge}>Age {calculateAge(child.date_of_birth)}</Text>
                    </View>
                    <TouchableOpacity style={styles.childEditButton} activeOpacity={0.7}>
                      <Edit3 size={16} color="#6B7280" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.childStats}>
                    <View style={styles.childStat}>
                      <Text style={styles.childStatNumber}>{child.scheduled_count}</Text>
                      <Text style={styles.childStatLabel}>Scheduled</Text>
                    </View>
                    <View style={styles.childStat}>
                      <Text style={styles.childStatNumber}>{child.draft_count}</Text>
                      <Text style={styles.childStatLabel}>Draft</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Family Group Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Family Group</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddFamilyMember}
              activeOpacity={0.7}
            >
              <Plus size={20} color="#3B4F75" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.familyContainer}>
            {familyMembers.map((member) => (
              <View key={member.id} style={styles.familyMemberCard}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' }}
                  style={styles.familyAvatar}
                  resizeMode="cover"
                />
                <View style={styles.familyInfo}>
                  <Text style={styles.familyName}>{member.first_name} {member.last_name}</Text>
                  <Text style={styles.familyRole}>{member.role}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Messages Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Messages</Text>
          
          {upcomingMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No upcoming messages scheduled. Create your first message to see it here.
              </Text>
            </View>
          ) : (
            <View style={styles.upcomingMessagesContainer}>
              {upcomingMessages.map((message, index) => renderUpcomingMessage(message, index))}
            </View>
          )}
        </View>

        {/* Suggested Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Actions</Text>
          
          <TouchableOpacity
            style={styles.suggestedActionCard}
            onPress={() => handleSuggestedAction('birthday')}
            activeOpacity={0.8}
          >
            <View style={styles.suggestedActionIcon}>
              <Lightbulb size={20} color="#F59E0B" strokeWidth={2} />
            </View>
            <View style={styles.suggestedActionContent}>
              <Text style={styles.suggestedActionTitle}>Ava's birthday is in 2 weeks!</Text>
              <Text style={styles.suggestedActionSubtitle}>Create a special birthday message</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
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
  profileCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  editProfileButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  settingsSection: {
    marginBottom: 32,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  settingArrow: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  activityNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  activityLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  childrenContainer: {
    gap: 16,
  },
  childCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
    fontFamily: 'Poppins-SemiBold',
  },
  childAge: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  childEditButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  childStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  childStat: {
    alignItems: 'center',
  },
  childStatNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  childStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  familyContainer: {
    gap: 12,
  },
  familyMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  familyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  familyInfo: {
    flex: 1,
  },
  familyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
    fontFamily: 'Poppins-SemiBold',
  },
  familyRole: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  upcomingMessagesContainer: {
    gap: 16,
  },
  upcomingMessageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
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
  videoPreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    height: 120,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPreview: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  audioPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 30,
    gap: 2,
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
    opacity: 0.8,
  },
  textPreview: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    height: 120,
  },
  textImage: {
    width: '100%',
    height: '100%',
  },
  messageDetails: {
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  messageRecipient: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  messageTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  messageType: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
  },
  scheduledDate: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sendNowButton: {
    backgroundColor: '#3B4F75',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendNowText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  messageOptionsButton: {
    padding: 8,
  },
  suggestedActionCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  suggestedActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  suggestedActionContent: {
    flex: 1,
  },
  suggestedActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  suggestedActionSubtitle: {
    fontSize: 14,
    color: '#B45309',
    fontFamily: 'Poppins-Regular',
  },
  emptyState: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
});