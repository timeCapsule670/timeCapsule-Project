import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/libs/superbase';

export default function FamilySetupScreen() {
  const router = useRouter();
  const { actorIds } = useLocalSearchParams();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    
    // Animate selection
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.8,
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

  const handleNext = async () => {
    if (!selectedRole) {
      return;
    }

    setIsSaving(true);

    try {
      // Get the current authenticated user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        Alert.alert(
          'Authentication Error',
          'Please sign in again to continue.',
          [{ text: 'OK' }]
        );
        return;
      }

      const authUserId = session.user.id;

      // Get the director record for the current user
      const { data: directorData, error: directorError } = await supabase
        .from('directors')
        .select('id')
        .eq('auth_user_id', authUserId)
        .single();

      if (directorError || !directorData) {
        console.error('Error fetching director:', directorError);
        Alert.alert(
          'Error',
          'Could not find your profile. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      const directorId = directorData.id;

      // Update the director's role/type
      const { error: updateError } = await supabase
        .from('directors')
        .update({ director_type: selectedRole })
        .eq('id', directorId);

      if (updateError) {
        console.error('Error updating director:', updateError);
        Alert.alert(
          'Error',
          'Failed to update your profile. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Parse actor IDs from the route parameters
      let actorIdsList: string[] = [];
      if (actorIds) {
        try {
          // Handle both string and array formats
          if (typeof actorIds === 'string') {
            actorIdsList = actorIds.split(',').filter(id => id.trim());
          } else if (Array.isArray(actorIds)) {
            actorIdsList = actorIds.filter(id => typeof id === 'string' && id.trim());
          }
        } catch (parseError) {
          console.error('Error parsing actor IDs:', parseError);
        }
      }

      // Create director-actor relationships if we have actor IDs
      if (actorIdsList.length > 0) {
        const relationshipsToInsert = actorIdsList.map(actorId => ({
          director_id: directorId,
          actor_id: actorId.trim(),
          relationship: selectedRole,
        }));

        const { error: relationshipError } = await supabase
          .from('director_actor')
          .insert(relationshipsToInsert);

        if (relationshipError) {
          console.error('Error creating relationships:', relationshipError);
          Alert.alert(
            'Warning',
            'Your profile was updated, but there was an issue linking to child profiles. You can set this up later.',
            [{ text: 'Continue', onPress: () => router.push('/moments-selection') }]
          );
          return;
        }

        console.log('Successfully created director-actor relationships');
      }

      // Navigate to moments selection screen on success
      router.push('/moments-selection');
      
    } catch (error) {
      console.error('Unexpected error during save:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const roles = [
    { id: 'Mom', label: 'Mom' },
    { id: 'Dad', label: 'Dad' },
    { id: 'Guardian', label: 'Guardian' },
    { id: 'Other', label: 'Other' },
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
          
          <Text style={styles.headerTitle}>Set Up Your Family Space</Text>
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
        <View style={styles.mainContent}>
          <Text style={styles.question}>Who's setting up the account today?</Text>
          
          <View style={styles.rolesContainer}>
            {roles.map((role, index) => (
              <Animated.View
                key={role.id}
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
                    styles.roleButton,
                    selectedRole === role.id && styles.roleButtonSelected,
                  ]}
                  onPress={() => handleRoleSelect(role.id)}
                  activeOpacity={0.8}
                  disabled={isSaving}
                >
                  <Text 
                    style={[
                      styles.roleButtonText,
                      selectedRole === role.id && styles.roleButtonTextSelected,
                    ]}
                  >
                    {role.label}
                  </Text>
                  
                  {selectedRole === role.id && (
                    <View style={styles.selectedIndicator}>
                      <View style={styles.selectedDot} />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!selectedRole || isSaving) && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!selectedRole || isSaving}
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
    paddingBottom: 40,
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
  mainContent: {
    flex: 1,
    paddingTop: 20,
  },
  question: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 40,
  },
  rolesContainer: {
    gap: 16,
  },
  roleButton: {
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
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  roleButtonSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#3B4F75',
    shadowColor: '#3B4F75',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
  },
  roleButtonTextSelected: {
    color: '#3B4F75',
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B4F75',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  footer: {
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