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
import { ArrowLeft, Calendar, MoreVertical, Play, Pause, ArrowRight } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/libs/superbase';

// Platform-specific imports for Audio
let Audio: any;
if (Platform.OS !== 'web') {
  Audio = require('expo-av').Audio;
}

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  username: string;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  backgroundColor: string;
}

export default function PreviewMessageScreen() {
  const router = useRouter();
  const {
    childId,
    messageType,
    recordedUri,
    messageTitle,
    privacy,
    tags, // This will be a comma-separated string of category IDs
    promptText,
    deliveryOption,
    scheduledDate,
    scheduledTime,
    repeatAnnually,
    lifeMomentDescription,
    reminderOption,
  } = useLocalSearchParams();

  const [child, setChild] = useState<Child | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackObject, setPlaybackObject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Mapping function to get visual properties for category names
  const getCategoryVisuals = (categoryName: string) => {
    const visuals: Record<string, { emoji: string; color: string; backgroundColor: string }> = {
      'Emotional Support': {
        emoji: '😊',
        color: '#8B5CF6',
        backgroundColor: '#F3E8FF',
      },
      'Milestones': {
        emoji: '🎓',
        color: '#F59E0B',
        backgroundColor: '#FEF3C7',
      },
      'Celebrations and Encouragement': {
        emoji: '🎉',
        color: '#EC4899',
        backgroundColor: '#FCE7F3',
      },
      'Life Advice': {
        emoji: '💬',
        color: '#3B82F6',
        backgroundColor: '#DBEAFE',
      },
      'Just Because': {
        emoji: '❤️',
        color: '#EF4444',
        backgroundColor: '#FEF2F2',
      },
    };
    
    return visuals[categoryName] || {
      emoji: '💝',
      color: '#6B7280',
      backgroundColor: '#F3F4F6',
    };
  };

  useEffect(() => {
    fetchData();

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
      if (playbackObject) {
        playbackObject.unloadAsync();
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch child data
      const { data: childData, error: childError } = await supabase
        .from('actors')
        .select('id, first_name, last_name, date_of_birth, username')
        .eq('id', childId)
        .single();

      if (childError) {
        console.error('Error fetching child:', childError);
        Alert.alert('Error', 'Failed to load child data. Please try again.');
        return;
      }
      setChild(childData);

      // Fetch categories for tags
      const tagIds = typeof tags === 'string' ? tags.split(',').filter(id => id.trim()) : [];
      if (tagIds.length > 0) {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name')
          .in('id', tagIds);

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          Alert.alert('Error', 'Failed to load categories. Please try again.');
          return;
        }

        const transformedCategories: Category[] = (categoriesData || []).map(category => {
          const visuals = getCategoryVisuals(category.name);
          return {
            id: category.id,
            name: category.name,
            emoji: visuals.emoji,
            color: visuals.color,
            backgroundColor: visuals.backgroundColor,
          };
        });
        setCategories(transformedCategories);
      }
    } catch (error) {
      console.error('Unexpected error fetching data:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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

  const handleBack = () => {
    router.back();
  };

  const handleMoreOptions = () => {
    Alert.alert('More Options', 'Additional options coming soon!');
  };

  const toggleAudioPlayback = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Audio playback is not available on web platform');
      return;
    }

    if (!recordedUri) {
      Alert.alert('No Audio', 'No recorded audio to play.');
      return;
    }

    try {
      if (isPlaying) {
        if (playbackObject) {
          await playbackObject.pauseAsync();
        }
        setIsPlaying(false);
      } else {
        if (playbackObject) {
          await playbackObject.playAsync();
        } else {
          const { sound } = await Audio.Sound.createAsync(
            { uri: recordedUri as string },
            { shouldPlay: true }
          );
          setPlaybackObject(sound);
          sound.setOnPlaybackStatusUpdate((status: any) => {
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          });
        }
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
      Alert.alert('Error', 'Failed to play audio. Please try again.');
    }
  };

  const handleFinalReview = () => {
    router.push({
      pathname: '/final-review',
      params: {
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
      },
    });
  };

  const formatDeliveryDate = (dateStr: string, timeStr: string): string => {
    try {
      const [month, day, year] = dateStr.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
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
      return dateStr;
    }
  };

  const renderDeliveryInfo = () => {
    if (deliveryOption === 'specificDate' && scheduledDate && scheduledTime) {
      const formattedDate = formatDeliveryDate(scheduledDate as string, scheduledTime as string);
      return (
        <View style={styles.deliveryInfoRow}>
          <Calendar size={20} color="#6B7280" style={styles.deliveryIcon} />
          <Text style={styles.deliveryInfoText}>
            Scheduled for {formattedDate}, {scheduledTime}
            {repeatAnnually === 'true' && ' (Repeats Annually)'}
          </Text>
        </View>
      );
    } else if (deliveryOption === 'lifeMoment' && lifeMomentDescription) {
      return (
        <View style={styles.deliveryInfoRow}>
          <Text style={styles.deliveryInfoText}>Triggered by: {lifeMomentDescription}</Text>
        </View>
      );
    } else if (deliveryOption === 'manuallyLater') {
      return (
        <View style={styles.deliveryInfoRow}>
          <Text style={styles.deliveryInfoText}>Will be sent manually later</Text>
        </View>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading preview...</Text>
        </View>
      </SafeAreaView>
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
          <Text style={styles.headerTitle}>Preview Message</Text>
          <TouchableOpacity style={styles.moreOptionsButton} onPress={handleMoreOptions} activeOpacity={0.7}>
            <MoreVertical size={24} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Message Info Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{messageTitle || 'Untitled Message'}</Text>
            <View style={styles.recipientInfo}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg' }}
                style={styles.recipientAvatar}
                resizeMode="cover"
              />
              <View>
                <Text style={styles.recipientName}>{child?.first_name || 'Child'}</Text>
                <Text style={styles.recipientAge}>Age {child ? calculateAge(child.date_of_birth) : 0}</Text>
              </View>
            </View>
            {renderDeliveryInfo()}
          </View>

          {/* Message Content Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Message Content</Text>
            <View style={styles.audioPlayerContainer}>
              <Text style={styles.audioDuration}>02:00</Text>
              <View style={styles.waveformContainer}>
                {[...Array(20)].map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.waveformBar,
                      { height: Math.random() * 30 + 10 }
                    ]}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={styles.playButton}
                onPress={toggleAudioPlayback}
                activeOpacity={0.8}
              >
                {isPlaying ? (
                  <Pause size={24} color="#ffffff" strokeWidth={2} />
                ) : (
                  <Play size={24} color="#ffffff" strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Message Category Card */}
          {categories.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Message Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map(category => (
                  <View 
                    key={category.id} 
                    style={[
                      styles.categoryTag,
                      { 
                        backgroundColor: category.backgroundColor,
                        borderColor: category.color,
                      }
                    ]}
                  >
                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    <Text style={[styles.categoryText, { color: category.color }]}>
                      {category.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.finalReviewButton}
            onPress={handleFinalReview}
            activeOpacity={0.9}
          >
            <Text style={styles.finalReviewButtonText}>Final Review</Text>
            <ArrowRight size={20} color="#ffffff" strokeWidth={2} />
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
  moreOptionsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 20,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
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
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Poppins-Bold',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recipientAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  recipientAge: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  deliveryIcon: {
    marginRight: 8,
  },
  deliveryInfoText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  audioPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8B9DC3',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  audioDuration: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Poppins-Bold',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 40,
    flex: 1,
    marginHorizontal: 16,
    gap: 2,
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
    opacity: 0.8,
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  finalReviewButton: {
    backgroundColor: '#3B4F75',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  finalReviewButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});