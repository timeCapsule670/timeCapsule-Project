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
    // Log the actorIds parameter to debug
    console.log('🔍 Family Setup - actorIds received:', actorIds);
    console.log('🔍 Family Setup - actorIds type:', typeof actorIds);
    console.log('🔍 Family Setup - actorIds is array:', Array.isArray(actorIds));
    
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
    console.log('👤 Family Setup - Role selected:', role);
    
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
      console.log('❌ Family Setup - No role selected');
      return;
    }

    console.log('🚀 Family Setup - Starting handleNext process');
    console.log('📝 Family Setup - Selected role:', selectedRole);
    console.log('👥 Family Setup - Actor IDs to process:', actorIds);

    setIsSaving(true);

    try {
      // Get the current authenticated user
      console.log('🔐 Family Setup - Getting authenticated user session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Family Setup - Session error:', sessionError);
        Alert.alert(
          'Authentication Error',
          'Please sign in again to continue.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!session?.user) {
        console.error('❌ Family Setup - No authenticated user found');
        Alert.alert(
          'Authentication Error',
          'Please sign in again to continue.',
          [{ text: 'OK' }]
        );
        return;
      }

      const authUserId = session.user.id;
      console.log('✅ Family Setup - Authenticated user ID:', authUserId);

      // Get the director record for the current user
      console.log('👤 Family Setup - Fetching director profile...');
      const { data: directorData, error: directorError } = await supabase
        .from('directors')
        .select('id')
        .eq('auth_user_id', authUserId)
        .single();

      if (directorError) {
        console.error('❌ Family Setup - Director fetch error:', directorError);
        console.error('❌ Family Setup - Director error details:', {
          message: directorError.message,
          details: directorError.details,
          hint: directorError.hint,
          code: directorError.code
        });
        Alert.alert(
          'Error',
          'Could not find your profile. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!directorData) {
        console.error('❌ Family Setup - No director data returned');
        Alert.alert(
          'Error',
          'Could not find your profile. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      const directorId = directorData.id;
      console.log('✅ Family Setup - Director ID found:', directorId);

      // Update the director's role/type
      console.log('📝 Family Setup - Updating director role to:', selectedRole);
      const { error: updateError } = await supabase
        .from('directors')
        .update({ director_type: selectedRole })
        .eq('id', directorId);

      if (updateError) {
        console.error('❌ Family Setup - Director update error:', updateError);
        console.error('❌ Family Setup - Update error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        Alert.alert(
          'Error',
          'Failed to update your profile. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('✅ Family Setup - Director role updated successfully');

      // Parse actor IDs from the route parameters
      let actorIdsList: string[] = [];
      console.log('🔄 Family Setup - Processing actor IDs...');
      
      if (actorIds) {
        try {
          // Handle both string and array formats
          if (typeof actorIds === 'string') {
            actorIdsList = actorIds.split(',').filter(id => id.trim());
            console.log('📋 Family Setup - Parsed actor IDs from string:', actorIdsList);
          } else if (Array.isArray(actorIds)) {
            actorIdsList = actorIds.filter(id => typeof id === 'string' && id.trim());
            console.log('📋 Family Setup - Parsed actor IDs from array:', actorIdsList);
          } else {
            console.log('⚠️ Family Setup - Unexpected actorIds format:', typeof actorIds, actorIds);
          }
        } catch (parseError) {
          console.error('❌ Family Setup - Error parsing actor IDs:', parseError);
        }
      } else {
        console.log('⚠️ Family Setup - No actorIds parameter received');
      }

      console.log('📊 Family Setup - Final actor IDs list:', actorIdsList);
      console.log('📊 Family Setup - Actor IDs count:', actorIdsList.length);

      // Create director-actor relationships if we have actor IDs
      if (actorIdsList.length > 0) {
        console.log('🔗 Family Setup - Creating director-actor relationships...');
        
        // First check if any relationships already exist
        const { data: existingRelationships, error: checkError } = await supabase
          .from('director_actor')
          .select('actor_id')
          .eq('director_id', directorId)
          .in('actor_id', actorIdsList);

        if (checkError) {
          console.error('❌ Family Setup - Error checking existing relationships:', checkError);
          // Continue anyway, we'll handle duplicates in the insert
        }

        const existingActorIds = existingRelationships?.map(rel => rel.actor_id) || [];
        console.log('📊 Family Setup - Existing relationships:', existingActorIds);

        // Filter out actors that already have relationships
        const newActorIds = actorIdsList.filter(actorId => !existingActorIds.includes(actorId));
        console.log('📊 Family Setup - New relationships to create:', newActorIds);

        if (newActorIds.length > 0) {
          const relationshipsToInsert = newActorIds.map(actorId => ({
            director_id: directorId,
            actor_id: actorId.trim(),
            relationship: selectedRole,
          }));

          console.log('📝 Family Setup - Relationships to insert:', relationshipsToInsert);

          const { data: insertedData, error: relationshipError } = await supabase
            .from('director_actor')
            .insert(relationshipsToInsert)
            .select();

          if (relationshipError) {
            console.error('❌ Family Setup - Relationship insertion error:', relationshipError);
            console.error('❌ Family Setup - Relationship error details:', {
              message: relationshipError.message,
              details: relationshipError.details,
              hint: relationshipError.hint,
              code: relationshipError.code
            });
            console.error('❌ Family Setup - Failed relationships data:', relationshipsToInsert);
            
            Alert.alert(
              'Warning',
              'Your profile was updated, but there was an issue linking to child profiles. You can set this up later.',
              [{ text: 'Continue', onPress: () => router.push('/upload-profile-picture') }]
            );
            return;
          }

          console.log('✅ Family Setup - Successfully created director-actor relationships');
          console.log('📊 Family Setup - Inserted relationships data:', insertedData);
        } else {
          console.log('ℹ️ Family Setup - All relationships already exist, skipping insert');
        }
      } else {
        console.log('⚠️ Family Setup - No actor IDs to process, skipping relationship creation');
      }

      console.log('🎉 Family Setup - Process completed successfully, navigating to profile picture upload');
      // Navigate to profile picture upload screen
      router.push('/upload-profile-picture');
      
    } catch (error) {
      console.error('💥 Family Setup - Unexpected error during save:', error);
      console.error('💥 Family Setup - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
      console.log('🏁 Family Setup - handleNext process finished');
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