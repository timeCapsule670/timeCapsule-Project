import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Lightbulb, RotateCcw, Video, Mic, Edit3, Image as ImageIcon, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MessageType {
  id: 'video' | 'audio' | 'text' | 'image';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  iconBackground: string;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [selectedMessageType, setSelectedMessageType] = useState<string | null>(null);
  const [showMessageTypes, setShowMessageTypes] = useState(false);


  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      // Heart beating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(heartAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(heartAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const messageTypes: MessageType[] = [
    {
      id: 'video',
      title: 'Record a Video Message',
      description: 'Send a video that feels like a hug',
      icon: Video,
      iconColor: '#9E6802',
      iconBackground: '#FDCB6E',
    },
    {
      id: 'audio',
      title: 'Record an Audio Message',
      description: 'Share your voice with warmth and emotion',
      icon: Mic,
      iconColor: '#000000',
      iconBackground: '#A3C4F3',
    },
    {
      id: 'text',
      title: 'Write a Text Message',
      description: 'Express yourself through words',
      icon: Edit3,
      iconColor: '#000000',
      iconBackground: '#D6C7ED',
    },
    {
      id: 'image',
      title: 'Upload an Image',
      description: 'Upload your favorite memory',
      icon: ImageIcon,
      iconColor: '#ffffff',
      iconBackground: '#6B7280',
    },
  ];

  const handleUsePrompt = () => {
    const promptText = "How do you think your childhood shaped who you are today?";
    const promptTags = "#LifeAdvice,#TextMessage";
    
    router.push({
      pathname: '/create-message',
      params: {
        promptText,
        promptTags,
        promptId: 'welcome-prompt-1',
      }
    });
  };

  const handleRefreshPrompt = () => {
    // In a real app, this would fetch a new random prompt
    Alert.alert('New Prompt', 'Prompt refresh functionality will be implemented soon!');
  };

  const handleSelectMessageType = () => {
    setShowMessageTypes(true);
    
    // Animate the message types section
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleMessageTypeSelect = (typeId: string) => {
    setSelectedMessageType(typeId);
    
    // Navigate to create message page with the selected type
    router.push({
      pathname: '/create-message',
      params: {
        messageType: typeId,
        promptText: "How do you think your childhood shaped who you are today?",
        promptTags: "#LifeAdvice",
        promptId: 'welcome-prompt-1',
      }
    });
  };

  const handleSkip = () => {
    router.push('/(tabs)');
  };

  const handleCloseMessageTypes = () => {
    setShowMessageTypes(false);
  };

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
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Icon */}
          <Animated.View
            style={[
              styles.headerIconContainer,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <View style={styles.iconWrapper}>
              {/* Person with arms up */}
             <Image
              source={require('../assets/images/logo.png')}
              style={styles.personIcon}
              resizeMode="contain"
            />
            </View>
          </Animated.View>

          {/* Main Title */}
          <Text style={styles.title}>
            Your Time Capsule is ready!
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Let's create your first message!
          </Text>

          {/* Inspiration Section */}
          <View style={styles.inspirationSection}>
            <Text style={styles.inspirationTitle}>
              Need Inspiration? Try one of these prompts
            </Text>

            <View style={styles.promptCard}>
              <View style={styles.promptHeader}>
                <View style={styles.promptIconContainer}>
                  <Lightbulb size={20} color="#F59E0B" strokeWidth={2} />
                </View>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleRefreshPrompt}
                  activeOpacity={0.7}
                >
                  <RotateCcw size={20} color="#6B7280" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <Text style={styles.promptText}>
                How do you think your childhood shaped who you are today?
              </Text>

              <TouchableOpacity
                style={styles.usePromptButton}
                onPress={handleUsePrompt}
                activeOpacity={0.8}
              >
                <Text style={styles.usePromptButtonText}>Use Prompt</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Message Type Selection */}
          <View style={styles.messageTypeSection}>
            <View style={styles.messageTypeSectionHeader}>
              <Text style={styles.messageTypeSectionTitle}>Select Message Type</Text>
              {showMessageTypes && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseMessageTypes}
                  activeOpacity={0.7}
                >
                  <X size={20} color="#6B7280" strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>

            {!showMessageTypes ? (
              <TouchableOpacity
                style={styles.selectMessageTypeButton}
                onPress={handleSelectMessageType}
                activeOpacity={0.8}
              >
                <Text style={styles.selectMessageTypeText}>Choose Message Type</Text>
              </TouchableOpacity>
            ) : (
              <Animated.View
                style={[
                  styles.messageTypesContainer,
                  {
                    opacity: fadeAnim,
                  }
                ]}
              >
                {messageTypes.map((type, index) => {
                  const IconComponent = type.icon;
                  const isSelected = selectedMessageType === type.id;
                  
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.messageTypeCard,
                        isSelected && styles.messageTypeCardSelected
                      ]}
                      onPress={() => handleMessageTypeSelect(type.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.messageTypeIcon, { backgroundColor: type.iconBackground }]}>
                        <IconComponent size={24} color={type.iconColor} strokeWidth={2} />
                      </View>
                      
                      <View style={styles.messageTypeContent}>
                        <Text style={[
                          styles.messageTypeTitle,
                          isSelected && styles.messageTypeTitleSelected
                        ]}>
                          {type.title}
                        </Text>
                        <Text style={[
                          styles.messageTypeDescription,
                          isSelected && styles.messageTypeDescriptionSelected
                        ]}>
                          {type.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {/* Skip Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
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
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personIcon: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 32,
    color: '#4A5B87',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    fontFamily: 'Poppins-Medium',
  },
  inspirationSection: {
    marginBottom: 40,
  },
  inspirationTitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'left',
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  promptCard: {
    backgroundColor: '#FBF9FD',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8A5FCC',
    borderStyle: 'dashed',
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  promptIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  usePromptButton: {
    backgroundColor: '#B093DC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    
  },
  usePromptButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  messageTypeSection: {
    marginBottom: 40,
  },
  messageTypeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  messageTypeSectionTitle: {
    fontSize: 18,
    color: '#5A5A5A',
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 27,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectMessageTypeButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
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
  selectMessageTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Poppins-Medium',
  },
  messageTypesContainer: {
    gap: 16,
  },
  messageTypeCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  messageTypeCardSelected: {
    backgroundColor: '#4A5B87',
  },
  messageTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageTypeContent: {
    flex: 1,
  },
  messageTypeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  messageTypeTitleSelected: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  messageTypeDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  messageTypeDescriptionSelected: {
    color: '#ffffff',
  },
  footer: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
});