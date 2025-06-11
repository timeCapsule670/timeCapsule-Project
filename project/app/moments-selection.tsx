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
} from 'react-native';
import { ArrowLeft, GraduationCap, Smile, PartyPopper, MessageSquare, Heart, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface MomentType {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  emoji: string;
}

export default function MomentsSelectionScreen() {
  const router = useRouter();
  const [selectedMoments, setSelectedMoments] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
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
      Animated.timing(progressAnim, {
        toValue: 0.4, // 40% progress (second step)
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleMomentToggle = (momentId: string) => {
    setSelectedMoments(prev => {
      if (prev.includes(momentId)) {
        return prev.filter(id => id !== momentId);
      } else {
        return [...prev, momentId];
      }
    });
    
    // Animate selection
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (selectedMoments.length > 0) {
      // Navigate to next setup step or main app
      router.push('/child-profile-setup');
    }
  };

  const momentTypes: MomentType[] = [
    { 
      id: 'milestones', 
      label: 'Milestones', 
      icon: GraduationCap,
      emoji: '🎓'
    },
    { 
      id: 'emotional-support', 
      label: 'Emotional Support', 
      icon: Smile,
      emoji: '😊'
    },
    { 
      id: 'celebrations', 
      label: 'Celebrations & Encouragement', 
      icon: PartyPopper,
      emoji: '🎉'
    },
    { 
      id: 'life-advice', 
      label: 'Life Advice', 
      icon: MessageSquare,
      emoji: '💬'
    },
    { 
      id: 'just-because', 
      label: 'Just Because', 
      icon: Heart,
      emoji: '❤️'
    },
  ];

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
          
          <Text style={styles.headerTitle}>Let's Get To Know You</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]}
            />
          </View>
        </View>

        {/* Main Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.mainContent}>
            <Text style={styles.question}>
              What kinds of moments are most important to you?{' '}
              <Text style={styles.questionSubtext}>(Select all that apply)</Text>
            </Text>
            
            <View style={styles.momentsContainer}>
              {momentTypes.map((moment, index) => {
                const isSelected = selectedMoments.includes(moment.id);
                const IconComponent = moment.icon;
                
                return (
                  <Animated.View
                    key={moment.id}
                    style={[
                      {
                        opacity: fadeAnim,
                        transform: [
                          { 
                            translateY: slideAnim.interpolate({
                              inputRange: [0, 30],
                              outputRange: [0, 20 + (index * 5)],
                            })
                          }
                        ],
                      }
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.momentButton,
                        isSelected && styles.momentButtonSelected,
                      ]}
                      onPress={() => handleMomentToggle(moment.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.momentContent}>
                        <View style={styles.momentIconContainer}>
                          <Text style={styles.momentEmoji}>{moment.emoji}</Text>
                        </View>
                        
                        <Text 
                          style={[
                            styles.momentButtonText,
                            isSelected && styles.momentButtonTextSelected,
                          ]}
                        >
                          {moment.label}
                        </Text>
                      </View>
                      
                      {isSelected && (
                        <View style={styles.selectedIndicator}>
                          <Check size={16} color="#ffffff" strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              selectedMoments.length === 0 && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={selectedMoments.length === 0}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <ArrowLeft 
              size={20} 
              color="#ffffff" 
              strokeWidth={2}
              style={styles.nextArrow}
            />
          </TouchableOpacity>
          
          <Text style={styles.footerDescription}>
            These questions will help us personalize your experience and suggest meaningful messages to create.
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 45,
    paddingBottom: 24,
    justifyContent: 'space-between',
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
    marginHorizontal: 10,
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    paddingBottom: 32,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B4F75',
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 40,
  },
  questionSubtext: {
    fontSize: 20,
    fontWeight: '400',
    color: '#6B7280',
  },
  momentsContainer: {
    gap: 16,
  },
  momentButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  momentButtonSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#3B4F75',
    shadowColor: '#3B4F75',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  momentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  momentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  momentEmoji: {
    fontSize: 24,
  },
  momentButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  momentButtonTextSelected: {
    color: '#3B4F75',
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B4F75',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  footer: {
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
  },
  nextButton: {
    backgroundColor: '#3B4F75',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  nextArrow: {
    transform: [{ rotate: '180deg' }],
  },
  footerDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});