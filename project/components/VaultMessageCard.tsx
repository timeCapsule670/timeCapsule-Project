import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Mic, Video, MessageSquare, Play, MoreVertical } from 'lucide-react-native';

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

interface VaultMessageCardProps {
  message: VaultMessage;
  onPlayMessage: (messageId: string, mediaUrl?: string, messageType?: string) => void;
  onMoreOptions: (messageId: string) => void;
}

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

export default function VaultMessageCard({ message, onPlayMessage, onMoreOptions }: VaultMessageCardProps) {
  const messageTypeConfig = {
    audio: { icon: Mic, label: 'Audio Message', color: '#8B5CF6' },
    video: { icon: Video, label: 'Video Message', color: '#EF4444' },
    text: { icon: MessageSquare, label: 'Text Message', color: '#3B82F6' },
    image: { icon: MessageSquare, label: 'Image Message', color: '#F59E0B' }, // Assuming MessageSquare for image for now
  };

  const config = messageTypeConfig[message.message_type] || messageTypeConfig.text;
  const IconComponent = config.icon;
  const mediaUrl = message.message_media && message.message_media.length > 0 ? message.message_media[0].media_url : undefined;

  return (
    <View style={styles.messageCard}>
      {/* Message Card Header */}
      <View style={styles.messageCardHeader}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => onPlayMessage(message.id, mediaUrl, message.message_type)}
          activeOpacity={0.7}
        >
          <Play size={20} color="#ffffff" strokeWidth={2} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.messageOptionsButton} onPress={() => onMoreOptions(message.id)} activeOpacity={0.7}>
          <MoreVertical size={20} color="#9CA3AF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Message Content Preview */}
      <View style={styles.messageContentPreview}>
        {message.message_type === 'audio' && (
          <View style={styles.waveformPreview}>
            {[...Array(12)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waveformBarPreview,
                  { height: Math.random() * 20 + 8 }
                ]}
              />
            ))}
          </View>
        )}
        
        {(message.message_type === 'video' || message.message_type === 'image') && mediaUrl && (
          <View style={styles.mediaPreviewContainer}>
            <Image
              source={{ uri: mediaUrl }}
              style={styles.mediaThumbnail}
              resizeMode="cover"
            />
            <View style={styles.playIconOverlay}>
              <Play size={24} color="#ffffff" strokeWidth={2} />
            </View>
          </View>
        )}
        
        {message.message_type === 'text' && (
          <View style={styles.textPreviewContainer}>
            <Text style={styles.textPreviewText} numberOfLines={3}>
              {message.content || 'Dear Future Child...'}
            </Text>
          </View>
        )}
      </View>

      {/* Message Details */}
      <View style={styles.messageDetails}>
        <Text style={styles.messageCardTitle}>
          {message.content?.substring(0, 30) || 'Untitled Message'}
          {(message.content?.length || 0) > 30 ? '...' : ''}
        </Text>
        
        <Text style={styles.messageRecipient}>
          To: {message.child?.first_name || 'Child'}
        </Text>
        
        <View style={styles.messageTypeContainer}>
          <IconComponent size={16} color={config.color} strokeWidth={2} />
          <Text style={[styles.messageType, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
        
        <Text style={styles.messageScheduled}>
          <Text style={styles.messageScheduledLabel}>Scheduled: </Text>
          <Text style={styles.messageScheduledDate}>
            {formatScheduledDate(message.scheduled_at)}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  messageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  messageOptionsButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContentPreview: {
    marginBottom: 16,
  },
  waveformPreview: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 40,
    gap: 2,
  },
  waveformBarPreview: {
    width: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 1.5,
    opacity: 0.7,
  },
  mediaPreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    height: 120,
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textPreviewContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textPreviewText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  messageDetails: {
    marginBottom: 16,
  },
  messageCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  messageRecipient: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  messageTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  messageType: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  messageScheduled: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  messageScheduledLabel: {
    color: '#6B7280',
  },
  messageScheduledDate: {
    color: '#EF4444',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});
