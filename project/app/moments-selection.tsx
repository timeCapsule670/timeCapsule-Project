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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, GraduationCap, Smile, PartyPopper, MessageSquare, Heart, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { apiService, Category, SaveDirectorCategoriesRequest } from '@/libs/api';
import NextButton from '@/components/NextButton';

interface MomentType {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  emoji: string;
}

export default function MomentsSelectionScreen() {
  const router = useRouter();
  const [selectedMoments, setSelectedMoments] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [momentTypes, setMomentTypes] = useState<MomentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0.4)).current;

  // Mapping function to get icon and emoji for category names
  const getCategoryVisuals = (categoryName: string) => {
    const visuals: Record<string, { icon: React.ComponentType<any>; emoji: string }> = {
      'Milestones': { icon: GraduationCap, emoji: '🎓' },
      'Emotional Support': { icon: Smile, emoji: '😊' },
      'Celebrations and Encouragement': { icon: PartyPopper, emoji: '🎉' },
      'Life Advice': { icon: MessageSquare, emoji: '💬' },
      'Just Because': { icon: Heart, emoji: '❤️' },
    };
    
    return visuals[categoryName] || { icon: Heart, emoji: '💝' };
  };

  useEffect(() => {
    fetchCategories();
    
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
        toValue: 0.6, // 60% progress (third step)
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiService.getCategories();

      if (!response.success) {
        Alert.alert('Error', 'Failed to load categories. Please try again.');
        return;
      }

      setCategories(response.data || []);
      
      // Transform categories into moment types with visual elements
      const transformedMoments: MomentType[] = (response.data || []).map(category => {
        const visuals = getCategoryVisuals(category.name);
        return {
          id: category.id,
          label: category.name,
          icon: visuals.icon,
          emoji: category.emoji || visuals.emoji, // Use API emoji if available, fallback to hardcoded
        };
      });
      
      setMomentTypes(transformedMoments);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleMomentToggle = (momentId: string) => {
    setSelectedMoments(prev => {
      const newSelection = prev.includes(momentId)
        ? prev.filter(id => id !== momentId)
        : [...prev, momentId];
      
      return newSelection;
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

  const handleNext = async () => {
    if (selectedMoments.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one moment type to continue.');
      return;
    }

    setIsSaving(true);

    try {
      // Save the selected categories using the new API
      const request: SaveDirectorCategoriesRequest = {
        category_ids: selectedMoments
      };

      const response = await apiService.saveDirectorCategories(request);

      if (!response.success) {
        Alert.alert(
          'Error',
          response.message || 'Failed to save your selections. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Navigate to invite child screen
      router.push('/link-account');
      
    } catch (error) {
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading moments...</Text>
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
          bounces={true}
          alwaysBounceVertical={false}
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
                      disabled={isSaving}
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
            
            {/* Footer moved inside ScrollView */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  (selectedMoments.length === 0 || isSaving) && styles.nextButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={selectedMoments.length === 0 || isSaving}
                activeOpacity={0.9}
              >
                <Text style={styles.nextButtonText}>
                  {isSaving ? 'Saving...' : 'Next'}
                </Text>
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
          </View>
        </ScrollView>

        {/* Remove the footer that was here */}
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
    paddingTop: 50,
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
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
    fontFamily: 'Poppins-SemiBold',
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
    paddingBottom: 20,
  },
  mainContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  question: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 40,
  },
  questionSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
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
   
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
   
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
    paddingTop: 32,
    paddingBottom: 20,
    gap: 24,
  },
  nextButton: {
    backgroundColor: '#2F3A56',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
   
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