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
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ArrowLeft, User, Calendar, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/libs/superbase';

interface Child {
  id: string;
  name: string;
  birthday: string;
  birthdayDate?: Date;
  username?: string;
}

export default function ChildProfileSetupScreen() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([
    { id: '1', name: '', birthday: '' }
  ]);
  const [errors, setErrors] = useState<Record<string, { name?: string; birthday?: string }>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentChildIdForDatePicker, setCurrentChildIdForDatePicker] = useState<string | null>(null);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    console.log('🔍 Child Profile Setup - Component mounted');
    
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
        toValue: 0.2, // 20% progress (first step)
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const formatDate = (date: Date): string => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const parseDate = (dateString: string): Date | null => {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return null;
  };

  const generateUsername = (firstName: string): string => {
    const cleanName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const timestamp = Date.now().toString().slice(-6);
    return `${cleanName}${timestamp}`;
  };

  const handleInputChange = (childId: string, field: 'name' | 'birthday', value: string) => {
    setChildren(prev => 
      prev.map(child => {
        if (child.id === childId) {
          if (field === 'birthday') {
            const parsedDate = parseDate(value);
            return { 
              ...child, 
              [field]: value,
              birthdayDate: parsedDate || undefined
            };
          }
          return { ...child, [field]: value };
        }
        return child;
      })
    );
    
    // Clear error when user starts typing
    if (errors[childId]?.[field]) {
      setErrors(prev => ({
        ...prev,
        [childId]: {
          ...prev[childId],
          [field]: undefined,
        }
      }));
    }
  };

  const showDatePickerModal = (childId: string) => {
    const child = children.find(c => c.id === childId);
    const initialDate = child?.birthdayDate || new Date();
    
    setCurrentChildIdForDatePicker(childId);
    setTempSelectedDate(initialDate);
    setShowDatePicker(true);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate && currentChildIdForDatePicker) {
      const formattedDate = formatDate(selectedDate);
      setChildren(prev => 
        prev.map(child => 
          child.id === currentChildIdForDatePicker 
            ? { ...child, birthday: formattedDate, birthdayDate: selectedDate }
            : child
        )
      );
      
      // Clear error
      if (errors[currentChildIdForDatePicker]?.birthday) {
        setErrors(prev => ({
          ...prev,
          [currentChildIdForDatePicker]: {
            ...prev[currentChildIdForDatePicker],
            birthday: undefined,
          }
        }));
      }
      
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
      setCurrentChildIdForDatePicker(null);
    } else if (Platform.OS === 'ios') {
      setShowDatePicker(false);
      setCurrentChildIdForDatePicker(null);
    }
  };

  const addAnotherChild = () => {
    const newChild: Child = {
      id: Date.now().toString(),
      name: '',
      birthday: '',
    };
    setChildren(prev => [...prev, newChild]);
    
    // Animate addition
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

  const removeChild = (childId: string) => {
    if (children.length > 1) {
      setChildren(prev => prev.filter(child => child.id !== childId));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[childId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, { name?: string; birthday?: string }> = {};
    let isValid = true;

    children.forEach(child => {
      const childErrors: { name?: string; birthday?: string } = {};
      
      if (!child.name.trim()) {
        childErrors.name = 'Name is required';
        isValid = false;
      } else if (child.name.trim().length < 2) {
        childErrors.name = 'Name must be at least 2 characters';
        isValid = false;
      }

      if (!child.birthday.trim()) {
        childErrors.birthday = 'Birthday is required';
        isValid = false;
      }

      if (Object.keys(childErrors).length > 0) {
        newErrors[child.id] = childErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      console.log('❌ Child Profile Setup - Form validation failed');
      return;
    }

    console.log('🚀 Child Profile Setup - Starting handleNext process');
    console.log('👥 Child Profile Setup - Children to save:', children);

    setIsSaving(true);

    try {
      // Check authentication first
      console.log('🔐 Child Profile Setup - Checking authentication...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Child Profile Setup - Session error:', sessionError);
        Alert.alert(
          'Authentication Error', 
          'Please sign in again to continue.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!session?.user) {
        console.error('❌ Child Profile Setup - No authenticated user');
        Alert.alert(
          'Authentication Error', 
          'Please sign in again to continue.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('✅ Child Profile Setup - User authenticated:', session.user.id);

      // Step 1: Insert actors (children) first
      const actorsToInsert = children.map(child => {
        const firstName = child.name.trim();
        const dateOfBirth = child.birthdayDate ? child.birthdayDate.toISOString().split('T')[0] : null;
        const generatedUsername = generateUsername(firstName);

        return {
          first_name: firstName,
          last_name: '', // Empty string as it's not collected in the UI
          date_of_birth: dateOfBirth,
          gender: null, // Not collected in current UI
          notes: null, // Not collected in current UI
          username: generatedUsername,
        };
      });

      console.log('📝 Child Profile Setup - Actors to insert:', actorsToInsert);

      const { data: insertedActors, error: actorsError } = await supabase
        .from('actors')
        .insert(actorsToInsert)
        .select();

      if (actorsError) {
        console.error('❌ Child Profile Setup - Error inserting actors:', actorsError);
        console.error('❌ Child Profile Setup - Error details:', {
          message: actorsError.message,
          details: actorsError.details,
          hint: actorsError.hint,
          code: actorsError.code
        });
        console.error('❌ Child Profile Setup - Failed actors data:', actorsToInsert);
        
        // Provide more specific error messages based on the error code
        let errorMessage = 'Failed to save child profiles. Please try again.';
        
        if (actorsError.code === '42501') {
          errorMessage = 'Permission denied. Please check your account permissions and try again.';
        } else if (actorsError.code === '23505') {
          errorMessage = 'A child with this information already exists. Please check the details and try again.';
        } else if (actorsError.message.includes('row-level security')) {
          errorMessage = 'Security policy violation. Please contact support if this issue persists.';
        }
        
        Alert.alert(
          'Error', 
          errorMessage,
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('✅ Child Profile Setup - Successfully saved actors:', insertedActors);

      // Step 2: Get the director profile for the current user
      console.log('👤 Child Profile Setup - Fetching director profile...');
      const { data: directorData, error: directorError } = await supabase
        .from('directors')
        .select('id, director_type')
        .eq('auth_user_id', session.user.id)
        .single();

      if (directorError) {
        console.error('❌ Child Profile Setup - Director fetch error:', directorError);
        // Continue without creating relationships - they can be created later
        console.log('⚠️ Child Profile Setup - Continuing without director relationships');
        
        // Navigate to family setup with actor IDs
        const actorIds = insertedActors.map(actor => actor.id);
        router.push({
          pathname: '/family-setup',
          params: { actorIds: actorIds.join(',') }
        });
        return;
      }

      if (!directorData) {
        console.log('⚠️ Child Profile Setup - No director profile found, will create relationships later');
        
        // Navigate to family setup with actor IDs
        const actorIds = insertedActors.map(actor => actor.id);
        router.push({
          pathname: '/family-setup',
          params: { actorIds: actorIds.join(',') }
        });
        return;
      }

      console.log('✅ Child Profile Setup - Director found:', directorData);

      // Step 3: Create director-actor relationships immediately
      const directorId = directorData.id;
      const actorIds = insertedActors.map(actor => actor.id);
      
      console.log('🔗 Child Profile Setup - Creating director-actor relationships...');
      const relationshipsToInsert = actorIds.map(actorId => ({
        director_id: directorId,
        actor_id: actorId,
        relationship: directorData.director_type || 'Parent', // Use existing director type or default
      }));

      console.log('📝 Child Profile Setup - Relationships to insert:', relationshipsToInsert);

      const { data: insertedRelationships, error: relationshipError } = await supabase
        .from('director_actor')
        .insert(relationshipsToInsert)
        .select();

      if (relationshipError) {
        console.error('❌ Child Profile Setup - Relationship insertion error:', relationshipError);
        console.error('❌ Child Profile Setup - Relationship error details:', {
          message: relationshipError.message,
          details: relationshipError.details,
          hint: relationshipError.hint,
          code: relationshipError.code
        });
        
        // Continue to family setup even if relationships failed - they can be created there
        console.log('⚠️ Child Profile Setup - Continuing to family setup despite relationship error');
      } else {
        console.log('✅ Child Profile Setup - Successfully created director-actor relationships');
        console.log('📊 Child Profile Setup - Inserted relationships:', insertedRelationships);
      }
      
      // Navigate to family setup screen with actor IDs
      router.push({
        pathname: '/family-setup',
        params: { actorIds: actorIds.join(',') }
      });
      
    } catch (error) {
      console.error('💥 Child Profile Setup - Unexpected error during save:', error);
      console.error('💥 Child Profile Setup - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      Alert.alert(
        'Error', 
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
      console.log('🏁 Child Profile Setup - handleNext process finished');
    }
  };

  const isFormValid = children.every(child => 
    child.name.trim().length >= 2 && child.birthday.trim().length > 0
  );

  const renderBirthdayInput = (child: Child) => {
    if (Platform.OS === 'web') {
      // Web fallback - use regular text input
      return (
        <View style={[
          styles.inputWrapper, 
          styles.birthdayInput,
          errors[child.id]?.birthday ? styles.inputError : null
        ]}>
          <Calendar size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#94A3B8"
            value={child.birthday}
            onChangeText={(value) => handleInputChange(child.id, 'birthday', value)}
            keyboardType="numeric"
          />
        </View>
      );
    } else {
      // Native platforms - use touchable that opens date picker
      return (
        <TouchableOpacity
          style={[
            styles.inputWrapper, 
            styles.birthdayInput,
            errors[child.id]?.birthday ? styles.inputError : null
          ]}
          onPress={() => showDatePickerModal(child.id)}
          activeOpacity={0.7}
        >
          <Calendar size={20} color="#64748B" style={styles.inputIcon} />
          <Text style={[
            styles.textInput,
            styles.datePickerText,
            !child.birthday && styles.placeholderText
          ]}>
            {child.birthday || 'Select Birthday'}
          </Text>
        </TouchableOpacity>
      );
    }
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Set Up Your Child's Profile</Text>
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
            {children.map((child, index) => (
              <Animated.View
                key={child.id}
                style={[
                  styles.childContainer,
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
                {children.length > 1 && (
                  <View style={styles.childHeader}>
                    <Text style={styles.childNumber}>Child {index + 1}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeChild(child.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Child's Name */}
                <View style={styles.inputSection}>
                  <Text style={styles.questionText}>What's Your Child's Name?</Text>
                  
                  <View style={styles.inputContainer}>
                    <View style={[
                      styles.inputWrapper, 
                      errors[child.id]?.name ? styles.inputError : null
                    ]}>
                      <User size={20} color="#64748B" style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Child's Name"
                        placeholderTextColor="#94A3B8"
                        value={child.name}
                        onChangeText={(value) => handleInputChange(child.id, 'name', value)}
                        autoCapitalize="words"
                        autoCorrect={false}
                      />
                    </View>
                    {errors[child.id]?.name && (
                      <Text style={styles.errorText}>{errors[child.id]?.name}</Text>
                    )}
                  </View>
                </View>

                {/* Child's Birthday */}
                <View style={styles.inputSection}>
                  <Text style={styles.questionText}>What's Your Child's Birthday?</Text>
                  
                  <View style={styles.inputContainer}>
                    <View style={styles.birthdayInputContainer}>
                      {renderBirthdayInput(child)}
                    </View>
                    {errors[child.id]?.birthday && (
                      <Text style={styles.errorText}>{errors[child.id]?.birthday}</Text>
                    )}
                  </View>
                </View>
              </Animated.View>
            ))}

            {/* Add Another Child Button */}
            <TouchableOpacity
              style={styles.addChildButton}
              onPress={addAnotherChild}
              activeOpacity={0.8}
            >
              <Plus size={20} color="#3B4F75" strokeWidth={2} />
              <Text style={styles.addChildText}>Add another child</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!isFormValid || isSaving) && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!isFormValid || isSaving}
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

      {/* Date Picker Modal - Only for native platforms */}
      {showDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={tempSelectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
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
  childContainer: {
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  childNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
  },
  inputSection: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 16,
  },
  birthdayInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  birthdayInput: {
    flex: 1,
  },
  datePickerText: {
    paddingVertical: 16,
  },
  placeholderText: {
    color: '#94A3B8',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
  },
  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  addChildText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B4F75',
    marginLeft: 8,
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