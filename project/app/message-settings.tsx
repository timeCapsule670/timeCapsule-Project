import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { 
  ArrowLeft, 
  Edit3, 
  Play, 
  Pause, 
  Lock, 
  Users, 
  ArrowRight,
  Check
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { supabase } from '@/libs/superbase';

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
}

export default function MessageSettingsScreen() {
  const router = useRouter();
  const { childId, messageType, recordedUri, promptText } = useLocalSearchParams();
  
  const [child, setChild] = useState<Child | null>(null);
  const [messageTitle, setMessageTitle] = useState('');
  const [selectedPrivacy, setSelectedPrivacy] = useState<'private' | 'family'>('private');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState('00:00');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const sound = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const toggleAudioPlayback = async () => {
    try {
      if (isPlaying) {
        await sound.current?.pauseAsync();
        setIsPlaying(false);
      } else {
        if (!sound.current) {
          const { sound: playbackObject } = await Audio.Sound.createAsync(
            { uri: recordedUri as string },
            { shouldPlay: true }
          );
          sound.current = playbackObject;
          sound.current.setOnPlaybackStatusUpdate(status => {
            if ('isLoaded' in status && status.isLoaded) {
              if (status.didJustFinish) {
                setIsPlaying(false);
              }
              if (status.durationMillis) {
                const minutes = Math.floor(status.durationMillis / 60000);
                const seconds = ((status.durationMillis % 60000) / 1000).toFixed(0);
                setDuration(`${minutes}:${seconds.padStart(2, '0')}`);
              }
            }
          });
        } else {
          await sound.current.playAsync();
        }
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      Alert.alert('Error', 'Could not play the recording. Please try again.');
    }
  };

  const getCategoryEmoji = (categoryName: string): string => {
    const emojiMap: Record<string, string> = {
      'Milestones': '🎓',
      'Emotional Support': '😊',
      'Celebrations and Encouragement': '🎉',
      'Life Advice': '💬',
      'Just Because': '❤️',
    };
    return emojiMap[categoryName] || '💝';
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
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
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

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        Alert.alert('Error', 'Failed to load categories. Please try again.');
        return;
      }

      const transformedCategories: Category[] = (categoriesData || []).map(category => ({
        id: category.id,
        name: category.name,
        emoji: getCategoryEmoji(category.name),
      }));

      setCategories(transformedCategories);
      
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

  const handleEditRecipient = () => {
    Alert.alert('Edit Recipient', 'Navigate back to recipient selection');
  };

  const handleEditMessage = () => {
    Alert.alert('Edit Message', 'Navigate back to message recording');
  };

  const handlePrivacySelect = (privacy: 'private' | 'family') => {
    setSelectedPrivacy(privacy);
  };

  const handleTagToggle = (categoryId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleScheduleDelivery = () => {
    if (!messageTitle.trim()) {
      Alert.alert('Title Required', 'Please give your message a title before scheduling delivery.');
      return;
    }

    router.push({
      pathname: '/schedule-delivery',
      params: {
        childId: childId,
        messageType: messageType,
        recordedUri: recordedUri,
        messageTitle: messageTitle.trim(),
        privacy: selectedPrivacy,
        tags: selectedTags.join(','),
        promptText: promptText || '',
      }
    });
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
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
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Message Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Message Title Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Let's give this message a title.</Text>
            
            <TextInput
              style={styles.titleInput}
              placeholder="Message Title"
              placeholderTextColor="#9CA3AF"
              value={messageTitle}
              onChangeText={setMessageTitle}
              autoCapitalize="words"
              autoCorrect={true}
            />
          </View>

          {/* Sending To Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sending to</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEditRecipient}
                activeOpacity={0.7}
              >
                <Edit3 size={20} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.recipientCard}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg' }}
                style={styles.recipientAvatar}
                resizeMode="cover"
              />
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientName}>{child?.first_name}</Text>
                <Text style={styles.recipientAge}>Age {child ? calculateAge(child.date_of_birth) : 0}</Text>
              </View>
            </View>
          </View>

          {/* Message Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Message</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEditMessage}
                activeOpacity={0.7}
              >
                <Edit3 size={20} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.audioPlayerCard}>
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
              
              <Text style={styles.audioDuration}>00:10</Text>
            </View>
          </View>

          {/* Privacy Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
            
            <View style={styles.privacyOptions}>
              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  selectedPrivacy === 'private' && styles.privacyOptionSelected,
                ]}
                onPress={() => handlePrivacySelect('private')}
                activeOpacity={0.8}
              >
                <Lock size={20} color={selectedPrivacy === 'private' ? "#3B4F75" : "#6B7280"} strokeWidth={2} />
                <Text style={[
                  styles.privacyOptionText,
                  selectedPrivacy === 'private' && styles.privacyOptionTextSelected,
                ]}>
                  Private (Only Recipient)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  selectedPrivacy === 'family' && styles.privacyOptionSelected,
                ]}
                onPress={() => handlePrivacySelect('family')}
                activeOpacity={0.8}
              >
                <Users size={20} color={selectedPrivacy === 'family' ? "#3B4F75" : "#6B7280"} strokeWidth={2} />
                <Text style={[
                  styles.privacyOptionText,
                  selectedPrivacy === 'family' && styles.privacyOptionTextSelected,
                ]}>
                  Share With Family Group
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tags Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Let's add some tags</Text>
            
            <View style={styles.tagsContainer}>
              {categories.map((category) => {
                const isSelected = selectedTags.includes(category.id);
                
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.tagButton,
                      isSelected && styles.tagButtonSelected,
                    ]}
                    onPress={() => handleTagToggle(category.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.tagEmoji}>{category.emoji}</Text>
                    <Text style={[
                      styles.tagText,
                      isSelected && styles.tagTextSelected,
                    ]}>
                      {category.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.tagCheckmark}>
                        <Check size={16} color="#ffffff" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Schedule Delivery Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={handleScheduleDelivery}
            activeOpacity={0.9}
          >
            <Text style={styles.scheduleButtonText}>Schedule Delivery</Text>
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
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 24,
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
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  titleInput: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recipientCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recipientAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  recipientInfo: {
    flex: 1,
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
  audioPlayerCard: {
    backgroundColor: '#8B9DC3',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
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
  privacyOptions: {
    gap: 12,
  },
  privacyOption: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  privacyOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#3B4F75',
  },
  privacyOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Poppins-Medium',
  },
  privacyOptionTextSelected: {
    color: '#3B4F75',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  tagsContainer: {
    gap: 12,
  },
  tagButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  tagButtonSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#3B4F75',
  },
  tagEmoji: {
    fontSize: 24,
  },
  tagText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
    fontFamily: 'Poppins-Medium',
  },
  tagTextSelected: {
    color: '#3B4F75',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  tagCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B4F75',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  scheduleButton: {
    backgroundColor: '#334155',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#334155',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  scheduleButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});