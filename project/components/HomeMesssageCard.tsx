import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Play, Pause, MoreVertical, Mic, Video as VideoIcon, MessageSquare, Image as ImageIcon } from 'lucide-react-native';

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

interface HomeMessageCardProps {
  message: HomeMessage;
  onPlayMessage: (messageId: string, mediaUrl?: string, messageType?: string) => void;
  onMoreOptions: (messageId: string) => void;
  onSendNow?: (messageId: string) => void;
  isPlaying?: boolean;
  isUpcoming?: boolean;
}

export default function HomeMessageCard({ 
  message, 
  onPlayMessage, 
  onMoreOptions, 
  onSendNow,
  isPlaying = false,
  isUpcoming = false
}: HomeMessageCardProps) {
  
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      if (isUpcoming) {
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
      } else {
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
      }
    } catch (error) {
      return 'Unknown date';
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

    if (message.message_type === 'video') {
      return (
        <View style={styles.videoPreviewContainer}>
          <Image
            source={{ uri: mediaUrl || 'https://images.pexels.com/photos/4145353/pexels-photo-4145353.jpeg' }}
            style={styles.videoPreview}
            resizeMode="cover"
          />
          
          <TouchableOpacity
            style={styles.playButtonOverlay}
            onPress={() => onPlayMessage(message.id, mediaUrl, message.message_type)}
            activeOpacity={0.8}
          >
            {isPlaying ? (
              <Pause size={20} color="#ffffff" strokeWidth={2} />
            ) : (
              <Play size={20} color="#ffffff" strokeWidth={2} />
            )}
          </TouchableOpacity>
          
          <View style={styles.videoTypeIndicator}>
            <VideoIcon size={14} color="#ffffff" strokeWidth={2} />
            <Text style={styles.videoTypeText}>Video</Text>
          </View>
        </View>
      );
    } else if (message.message_type === 'audio') {
      return (
        <View style={[styles.audioPreviewContainer, { backgroundColor: typeDisplay.color }]}>
          <TouchableOpacity
            style={styles.audioPlayButton}
            onPress={() => onPlayMessage(message.id, mediaUrl, message.message_type)}
            activeOpacity={0.8}
          >
            {isPlaying ? (
              <Pause size={16} color="#ffffff" strokeWidth={2} />
            ) : (
              <Play size={16} color="#ffffff" strokeWidth={2} />
            )}
          </TouchableOpacity>
          
          <View style={styles.waveformContainer}>
            {[...Array(8)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    height: Math.random() * 16 + 6,
                    backgroundColor: isPlaying ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'
                  }
                ]}
              />
            ))}
          </View>
        </View>
      );
    } else if (message.message_type === 'text') {
      return (
        <View style={styles.textPreviewContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/3865556/pexels-photo-3865556.jpeg' }}
            style={styles.textBackgroundImage}
            resizeMode="cover"
          />
          <View style={styles.textOverlay}>
            <IconComponent size={16} color="#ffffff" strokeWidth={2} />
            <Text style={styles.textOverlayLabel}>Text Message</Text>
          </View>
        </View>
      );
    } else if (message.message_type === 'image') {
      return (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: mediaUrl || 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg' }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <IconComponent size={14} color="#ffffff" strokeWidth={2} />
            <Text style={styles.imageOverlayText}>Image</Text>
          </View>
        </View>
      );
    }

    // Fallback
    return (
      <View style={styles.fallbackPreviewContainer}>
        <IconComponent size={20} color={typeDisplay.color} strokeWidth={2} />
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {/* Message Preview */}
      <View style={styles.previewSection}>
        {renderMessagePreview()}
      </View>

      {/* Message Details */}
      <View style={styles.messageDetails}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageTitle} numberOfLines={1}>
            {message.content?.substring(0, 25) || 'Untitled Message'}
            {(message.content?.length || 0) > 25 ? '...' : ''}
          </Text>
          
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => onMoreOptions(message.id)}
            activeOpacity={0.7}
          >
            <MoreVertical size={16} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <Text style={styles.messageRecipient}>
          For: {message.child?.first_name || 'Unknown'}
        </Text>

        <View style={styles.messageTypeRow}>
          {React.createElement(getMessageTypeDisplay().icon, {
            size: 14,
            color: getMessageTypeDisplay().color,
            strokeWidth: 2
          })}
          <Text style={[styles.messageType, { color: getMessageTypeDisplay().color }]}>
            {getMessageTypeDisplay().label}
          </Text>
        </View>

        <Text style={styles.messageScheduled}>
          <Text style={styles.messageScheduledLabel}>
            {isUpcoming ? 'Scheduled: ' : 'Delivered: '}
          </Text>
          <Text style={[styles.messageScheduledDate, { color: isUpcoming ? '#EF4444' : '#10B981' }]}>
            {formatDate(message.scheduled_at)}
          </Text>
        </Text>

        {/* Send Now Button for Upcoming Messages */}
        {isUpcoming && onSendNow && (
          <TouchableOpacity
            style={styles.sendNowButton}
            onPress={() => onSendNow(message.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.sendNowButtonText}>Send Now</Text>
          </TouchableOpacity>
        )}
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
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewSection: {
    height: 100,
  },
  // Video Preview Styles
  videoPreviewContainer: {
    position: 'relative',
    height: '100%',
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
    transform: [{ translateX: -16 }, { translateY: -16 }],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTypeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  videoTypeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  // Audio Preview Styles
  audioPreviewContainer: {
    height: '100%',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 24,
    gap: 2,
  },
  waveformBar: {
    width: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
    opacity: 0.8,
  },
  // Text Preview Styles
  textPreviewContainer: {
    position: 'relative',
    height: '100%',
  },
  textBackgroundImage: {
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textOverlayLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  // Image Preview Styles
  imagePreviewContainer: {
    position: 'relative',
    height: '100%',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageOverlayText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  // Fallback Preview Styles
  fallbackPreviewContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  // Message Details Styles
  messageDetails: {
    padding: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  moreButton: {
    padding: 4,
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
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  messageScheduledLabel: {
    color: '#6B7280',
  },
  messageScheduledDate: {
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  sendNowButton: {
    backgroundColor: '#3B4F75',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sendNowButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});