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
  Alert,
} from 'react-native';
import { ArrowLeft, GraduationCap, Smile, PartyPopper, MessageSquare, Heart, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/libs/superbase';

interface Category {
  id: string;
  name: string;
}

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
    console.log('🔍 Moments Selection - Component mounted');
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
      console.log('📋 Moments Selection - Fetching categories...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('❌ Moments Selection - Error fetching categories:', error);
        Alert.alert('Error', 'Failed to load categories. Please try again.');
        return;
      }

      console.log('✅ Moments Selection - Categories fetched:', data);
      setCategories(data || []);
      
      // Transform categories into moment types with visual elements
      const transformedMoments: MomentType[] = (data || []).map(category => {
        const visuals = getCategoryVisuals(category.name);
        return {
          id: category.id,
          label: category.name,
          icon: visuals.icon,
          emoji: visuals.emoji,
        };
      });
      
      setMomentTypes(transformedMoments);
      console.log('📊 Moments Selection - Transformed moment types:', transformedMoments);
    } catch (error) {
      console.error('💥 Moments Selection - Unexpected error fetching categories:', error);
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
      
      console.log('🔄 Moments Selection - Moment toggled:', momentId);
      console.log('📊 Moments Selection - New selection:', newSelection);
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
      console.log('❌ Moments Selection - No moments selected');
      Alert.alert('Selection Required', 'Please select at least one moment type to continue.');
      return;
    }

    console.log('🚀 Moments Selection - Starting handleNext process');
    console.log('📝 Moments Selection - Selected moments:', selectedMoments);

    setIsSaving(true);

    try {
      // Get the current authenticated user
      console.log('🔐 Moments Selection - Getting authenticated user session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Moments Selection - Session error:', sessionError);
        Alert.alert(
          'Authentication Error',
          'Please sign in again to continue.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!session?.user) {
        console.error('❌ Moments Selection - No authenticated user found');
        Alert.alert(
          'Authentication Error',
          'Please sign in again to continue.',
          [{ text: 'OK' }]
        );
        return;
      }

      const authUserId = session.user.id;
      console.log('✅ Moments Selection - Authenticated user ID:', authUserId);

      // Get the director record for the current user
      console.log('👤 Moments Selection - Fetching director profile...');
      const { data: directorData, error: directorError } = await supabase
        .from('directors')
        .select('id')
        .eq('auth_user_id', authUserId)
        .single();

      if (directorError) {
        console.error('❌ Moments Selection - Director fetch error:', directorError);
        Alert.alert(
          'Error',
          'Could not find your profile. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!directorData) {
        console.error('❌ Moments Selection - No director data returned');
        Alert.alert(
          'Error',
          'Could not find your profile. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      const directorId = directorData.id;
      console.log('✅ Moments Selection - Director ID found:', directorId);

      // First, check if any of these relationships already exist
      console.log('🔍 Moments Selection - Checking for existing relationships...');
      const { data: existingRelationships, error: checkError } = await supabase
        .from('director_categories')
        .select('category_id')
        .eq('director_id', directorId)
        .in('category_id', selectedMoments);

      if (checkError) {
        console.error('❌ Moments Selection - Error checking existing relationships:', checkError);
        // Continue anyway, we'll handle duplicates in the insert
      }

      const existingCategoryIds = existingRelationships?.map(rel => rel.category_id) || [];
      console.log('📊 Moments Selection - Existing category relationships:', existingCategoryIds);

      // Filter out categories that already exist
      const newCategoryIds = selectedMoments.filter(categoryId => !existingCategoryIds.includes(categoryId));
      console.log('📊 Moments Selection - New categories to insert:', newCategoryIds);

      if (newCategoryIds.length === 0) {
        console.log('ℹ️ Moments Selection - All selected categories already exist, skipping insert');
        // All categories already exist, just proceed to next screen
        router.push('/invite-child');
        return;
      }

      // Create director-category relationships for new categories only
      console.log('🔗 Moments Selection - Creating director-category relationships...');
      const directorCategoriesToInsert = newCategoryIds.map(categoryId => ({
        director_id: directorId,
        category_id: categoryId,
      }));

      console.log('📝 Moments Selection - Relationships to insert:', directorCategoriesToInsert);

      const { data: insertedData, error: insertError } = await supabase
        .from('director_categories')
        .insert(directorCategoriesToInsert)
        .select();

      if (insertError) {
        console.error('❌ Moments Selection - Error saving moment selections:', insertError);
        console.error('❌ Moments Selection - Insert error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        console.error('❌ Moments Selection - Failed insert data:', directorCategoriesToInsert);

        // Provide more specific error messages
        let errorMessage = 'Failed to save your selections. Please try again.';
        
        if (insertError.code === '23505') {
          // Duplicate key error - this shouldn't happen now, but just in case
          errorMessage = 'Some of your selections already exist. Please refresh and try again.';
        } else if (insertError.code === '42501') {
          errorMessage = 'Permission denied. Please check your account permissions.';
        }

        Alert.alert(
          'Error',
          errorMessage,
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('✅ Moments Selection - Successfully saved moment selections');
      console.log('📊 Moments Selection - Inserted data:', insertedData);
      
      // Navigate to invite child screen
      console.log('🎉 Moments Selection - Process completed successfully, navigating to invite child');
      router.push('/invite-child');
      
    } catch (error) {
      console.error('💥 Moments Selection - Unexpected error during save:', error);
      console.error('💥 Moments Selection - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
      console.log('🏁 Moments Selection - handleNext process finished');
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
          </View>
        </ScrollView>

        {/* Footer */}
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
    paddingTop: 20,
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
    marginHorizontal: 16,
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
    fontSize: 24,
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