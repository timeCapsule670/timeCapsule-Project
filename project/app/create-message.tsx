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
} from 'react-native';
import { ArrowLeft, Video, Mic, MessageSquare, Check } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/libs/superbase';

interface Child {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    username: string;
}

interface MessageType {
    id: 'video' | 'audio' | 'text';
    label: string;
    icon: React.ComponentType<any>;
    emoji: string;
    color: string;
    backgroundColor: string;
}
export default function CreateMessageScreen() {
  const router = useRouter();
  const { promptText, promptTags, promptId } = useLocalSearchParams();
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [selectedMessageType, setSelectedMessageType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchChildren();
    
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

    // Pre-select message type based on prompt tags
    if (promptTags) {
      const tags = Array.isArray(promptTags) ? promptTags : promptTags.split(',');
      if (tags.includes('#VideoMessage')) {
        setSelectedMessageType('video');
      } else if (tags.includes('#VoiceMessage') || tags.includes('#AudioMessage')) {
        setSelectedMessageType('audio');
      } else if (tags.includes('#TextMessage')) {
        setSelectedMessageType('text');
      }
    }
  }, [promptTags]);

  const fetchChildren = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('actors')
        .select('id, first_name, last_name, date_of_birth, username')
        .order('first_name');

      if (error) {
        console.error('Error fetching children:', error);
        Alert.alert('Error', 'Failed to load children. Please try again.');
        return;
      }

      setChildren(data || []);
    } catch (error) {
      console.error('Unexpected error fetching children:', error);
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

  const messageTypes: MessageType[] = [
    {
      id: 'video',
      label: 'Video Message',
      icon: Video,
      emoji: '🎥',
      color: '#EF4444',
      backgroundColor: '#FEF2F2',
    },
    {
      id: 'audio',
      label: 'Audio Message',
      icon: Mic,
      emoji: '🎙️',
      color: '#8B5CF6',
      backgroundColor: '#F3E8FF',
    },
    {
      id: 'text',
      label: 'Text Message',
      icon: MessageSquare,
      emoji: '✍️',
      color: '#3B82F6',
      backgroundColor: '#DBEAFE',
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleChildSelect = (childId: string) => {
    setSelectedChild(childId);
    
    // Animate selection
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleMessageTypeSelect = (typeId: string) => {
    setSelectedMessageType(typeId);
    
    // Animate selection
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRecordMessage = () => {
    if (!selectedChild || !selectedMessageType) {
      return;
    }

    const selectedChildData = children.find(child => child.id === selectedChild);
    
    if (selectedMessageType === 'audio') {
      // Navigate to audio recording screen
      router.push({
        pathname: '/record-audio-message',
        params: {
          childId: selectedChild,
          promptText: promptText || '',
          promptTags: promptTags || '',
          promptId: promptId || '',
        }
      });
    } else {
      // For other message types, show placeholder
      const selectedTypeData = messageTypes.find(type => type.id === selectedMessageType);
      Alert.alert(
        'Coming Soon',
        `${selectedTypeData?.label} creation feature is coming soon!`,
        [{ text: 'OK' }]
      );
    }
  };

  const isFormValid = selectedChild && selectedMessageType;

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
          
          <Text style={styles.headerTitle}>Create Message</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Selected Prompt Section */}
          {promptText && (
            <View style={styles.promptSection}>
              <Text style={styles.promptSectionTitle}>Your Selected Prompt</Text>
              <View style={styles.promptCard}>
                <Text style={styles.promptText}>{promptText}</Text>
                {promptTags && (
                  <View style={styles.promptTags}>
                    {(Array.isArray(promptTags) ? promptTags : promptTags.split(',')).map((tag, index) => (
                      <View key={index} style={styles.promptTag}>
                        <Text style={styles.promptTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Who is this message for? */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who is this message for?</Text>
            
            <View style={styles.childrenContainer}>
              {children.map((child) => {
                const age = calculateAge(child.date_of_birth);
                const isSelected = selectedChild === child.id;
                
                return (
                  <TouchableOpacity
                    key={child.id}
                    style={[
                      styles.childCard,
                      isSelected && styles.childCardSelected,
                    ]}
                    onPress={() => handleChildSelect(child.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.childImageContainer}>
                      <Image
                        source={{ uri: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg' }}
                        style={styles.childImage}
                        resizeMode="cover"
                      />
                      {isSelected && (
                        <View style={styles.selectedOverlay}>
                          <Check size={20} color="#ffffff" strokeWidth={3} />
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.childInfo}>
                      <Text style={[
                        styles.childName,
                        isSelected && styles.childNameSelected,
                      ]}>
                        {child.first_name}
                      </Text>
                      <Text style={[
                        styles.childAge,
                        isSelected && styles.childAgeSelected,
                      ]}>
                        {age} years old
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* How would you like to share this message? */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How would you like to share this message?</Text>
            
            <View style={styles.messageTypesContainer}>
              {messageTypes.map((type) => {
                const isSelected = selectedMessageType === type.id;
                const IconComponent = type.icon;
                
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.messageTypeCard,
                      isSelected && {
                        backgroundColor: type.backgroundColor,
                        borderColor: type.color,
                      },
                    ]}
                    onPress={() => handleMessageTypeSelect(type.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.messageTypeContent}>
                      <View style={[
                        styles.messageTypeIconContainer,
                        { backgroundColor: isSelected ? type.color : '#F3F4F6' }
                      ]}>
                        <Text style={styles.messageTypeEmoji}>{type.emoji}</Text>
                      </View>
                      
                      <Text style={[
                        styles.messageTypeLabel,
                        isSelected && { color: type.color },
                      ]}>
                        {type.label}
                      </Text>
                    </View>
                    
                    {isSelected && (
                      <View style={[styles.selectedIndicator, { backgroundColor: type.color }]}>
                        <Check size={16} color="#ffffff" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Record Message Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              !isFormValid && styles.recordButtonDisabled,
            ]}
            onPress={handleRecordMessage}
            disabled={!isFormValid}
            activeOpacity={0.9}
          >
            <Text style={styles.recordButtonText}>Record Message</Text>
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
    promptSection: {
        paddingHorizontal: 24,
        paddingTop: 24,
        marginBottom: 32,
    },
    promptSectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    promptCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    promptText: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
        marginBottom: 12,
        fontFamily: 'Poppins-Regular',
    },
    promptTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    promptTag: {
        backgroundColor: '#E0E7FF',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    promptTagText: {
        fontSize: 12,
        color: '#3730A3',
        fontWeight: '500',
        fontFamily: 'Poppins-Medium',
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 20,
        fontFamily: 'Poppins-SemiBold',
    },
    childrenContainer: {
        flexDirection: 'column',
        gap: 12,
    },

    childCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    childCardSelected: {
        backgroundColor: '#EEF2FF',
        borderColor: '#3B4F75',
        shadowColor: '#3B4F75',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    childImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    childImageContainer: {
        marginRight: 12,
    },

    selectedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(59, 79, 117, 0.8)',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    childInfo: {
        flexDirection: 'column',
        justifyContent: 'center',
    },

    childName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        fontFamily: 'Poppins-SemiBold',
    },
    childAge: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: 'Poppins-Regular',
    },
    childNameSelected: {
        color: '#3B4F75',
    },
    childAgeSelected: {
        color: '#3B4F75',
    },

    messageTypesContainer: {
        flexDirection: 'column',
        gap: 12,
    },
    messageTypeCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    messageTypeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    messageTypeIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    messageTypeEmoji: {
        fontSize: 24,
    },
    messageTypeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        fontFamily: 'Poppins-SemiBold',
    },

    selectedIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },

    footer: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    recordButton: {
        backgroundColor: '#3B4F75',
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 32,
        alignItems: 'center',
        shadowColor: '#3B4F75',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    recordButtonDisabled: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0.1,
    },
    recordButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
});