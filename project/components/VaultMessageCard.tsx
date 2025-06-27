import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Play, Pause, MoreVertical, Mic, Video as VideoIcon, MessageSquare, Image as ImageIcon } from 'lucide-react-native';
import { VideoView } from 'expo-video';

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
  isPlaying?: boolean;
  videoPlayer?: any;
}

export default function VaultMessageCard({ 
  message, 
  onPlayMessage, 
  onMoreOptions, 
  isPlaying = false,
  videoPlayer 
}: VaultMessageCardProps) {
  
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return 'Today';
      } else if (diffDays === 2) {
        return 'Yesterday';
      } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
      }
    } catch (error) {
      return 'Unknown date';
    }
  };

  const formatScheduledDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      if (date > now) {
        return `Scheduled for ${date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        })}`;
      } else {
        return `Delivered ${formatDate(dateString)}`;
      }
    } catch (error) {
      return 'Unknown schedule';
    }
  };

  const getMessageTypeDisplay = () => {
    const typeMap = {
      audio: { icon: Mic, label: 'Audio Message', color: '#8B5CF6' },
      video: { icon: VideoIcon, label: 'Video Message', color: '#EF4444' },
      text: { icon: MessageSquare, label: 'Text Message', color: '#3B82F6' },
      image: { icon: ImageIcon, label: 'Image Message', color: '#10B981' },
    };
    return typeMap[message.message_type] || { icon: MessageSquare, label: 'Message', color: '#6B7280' };
  };

  const getMediaUrl = (): string | undefined => {
    return message.message_media?.[0]?.media_url;
  };

  const renderMessagePreview = () => {
    const typeDisplay = getMessageTypeDisplay();
    const IconComponent = typeDisplay.icon;
    const mediaUrl = getMediaUrl();

    if (message.message_type === 'video' && mediaUrl) {
      return (
        <View style={styles.videoPreviewContainer}>
          {videoPlayer ? (
            <VideoView
              style={styles.videoPreview}
              player={videoPlayer}
              allowsFullscreen={false}
              allowsPictureInPicture={false}
            />
          ) : (
            <Image
              source={{ uri: 'https://images.pexels.com/photos/4145353/pexels-photo-4145353.jpeg' }}
              style={styles.videoPreview}
              resizeMode="cover"
            />
          )}
          
          <TouchableOpacity
            style={styles.playButtonOverlay}
            onPress={() => onPlayMessage(message.id, mediaUrl, message.message_type)}
            activeOpacity={0.8}
          >
            {isPlaying ? (
              <Pause size={24} color="#ffffff" strokeWidth={2} />
            ) : (
              <Play size={24} color="#ffffff" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>
      );
    } else if (message.message_type === 'audio' && mediaUrl) {
      return (
        <View style={[styles.audioPreviewContainer, { backgroundColor: typeDisplay.color }]}>
          <TouchableOpacity
            style={styles.audioPlayButton}
            onPress={() => onPlayMessage(message.id, mediaUrl, message.message_type)}
            activeOpacity={0.8}
          >
            {isPlaying ? (
              <Pause size={20} color="#ffffff" strokeWidth={2} />
            ) : (
              <Play size={20} color="#ffffff" strokeWidth={2} />
            )}
          </TouchableOpacity>
          
          <View style={styles.waveformContainer}>
            {[...Array(12)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    height: Math.random() * 20 + 8,
                    backgroundColor: isPlaying ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'
                  }
                ]}
              />
            ))}
          </View>
          
          <Text style={styles.audioDuration}>
            {isPlaying ? 'Playing...' : '00:15'}
          </Text>
        </View>
      );
    } else if (message.message_type === 'text') {
      return (
        <TouchableOpacity
          style={styles.textPreviewContainer}
          onPress={() => onPlayMessage(message.id, undefined, message.message_type)}
          activeOpacity={0.8}
        >
          <View style={styles.textPreviewHeader}>
            <IconComponent size={16} color={typeDisplay.color} strokeWidth={2} />
            <Text style={[styles.textPreviewLabel, { color: typeDisplay.color }]}>
              {typeDisplay.label}
            </Text>
          </View>
          <Text style={styles.textPreviewContent} numberOfLines={3}>
            {message.content || 'No content available'}
          </Text>
        </TouchableOpacity>
      );
    } else if (message.message_type === 'image' && mediaUrl) {
      return (
        <TouchableOpacity
          style={styles.imagePreviewContainer}
          onPress={() => onPlayMessage(message.id, mediaUrl, message.message_type)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: mediaUrl }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <IconComponent size={20} color="#ffffff" strokeWidth={2} />
            <Text style={styles.imageOverlayText}>{typeDisplay.label}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Fallback for unknown types
    return (
      <View style={styles.fallbackPreviewContainer}>
        <IconComponent size={24} color={typeDisplay.color} strokeWidth={2} />
        <Text style={[styles.fallbackPreviewText, { color: typeDisplay.color }]}>
          {typeDisplay.label}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {/* Message Preview */}
      {renderMessagePreview()}

      {/* Message Details */}
      <View style={styles.messageDetails}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageTitle} numberOfLines={1}>
            {message.content?.substring(0, 30) || 'Untitled Message'}
            {(message.content?.length || 0) > 30 ? '...' : ''}
          </Text>
          
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => onMoreOptions(message.id)}
            activeOpacity={0.7}
          >
            <MoreVertical size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <Text style={styles.messageRecipient}>
          To: {message.child?.first_name || 'Unknown'} {message.child?.last_name || ''}
        </Text>

        <Text style={styles.messageSchedule}>
          {formatScheduledDate(message.scheduled_at)}
        </Text>

        <Text style={styles.messageCreated}>
          Created {formatDate(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  // Video Preview Styles
  videoPreviewContainer: {
    position: 'relative',
    height: 180,
    backgroundColor: '#000000',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Audio Preview Styles
  audioPreviewContainer: {
    height: 120,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  audioPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformContainer: {
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
  audioDuration: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  // Text Preview Styles
  textPreviewContainer: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    minHeight: 120,
  },
  textPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  textPreviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  textPreviewContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  // Image Preview Styles
  imagePreviewContainer: {
    position: 'relative',
    height: 180,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageOverlayText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  // Fallback Preview Styles
  fallbackPreviewContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  fallbackPreviewText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  // Message Details Styles
  messageDetails: {
    padding: 20,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  moreButton: {
    padding: 4,
  },
  messageRecipient: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  messageSchedule: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: 'Poppins-Medium',
  },
  messageCreated: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
});