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
import { apiService } from '@/libs/api';

export default function FamilySetupScreen() {
  const router = useRouter();
  const { actorIds, returnTo } = useLocalSearchParams();
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

      // Use the new API endpoint for complete family setup
      console.log('🌐 Family Setup - Calling family setup API...');
      const response = await apiService.familySetup({
        selectedRole,
        actorIds: actorIdsList,
      });

      console.log('✅ Family Setup - API response:', response);

      if (response.success) {
        console.log('🎉 Family Setup - Process completed successfully');
        console.log(`📊 Family Setup - Director role updated: ${response.data.director_role_updated}`);
        console.log(`📊 Family Setup - Relationships created: ${response.data.relationships_created}`);
        
        // Navigate to the next screen based on returnTo parameter
        if (returnTo === 'create-message') {
          router.push('/create-message');
        } else {
          router.push('/invite-child');
        }
      } else {
        console.error('❌ Family Setup - API returned success: false');
        Alert.alert(
          'Error',
          response.message || 'Failed to complete family setup. Please try again.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('💥 Family Setup - Unexpected error during save:', error);
      console.error('💥 Family Setup - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Show user-friendly error message
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Error',
        errorMessage,
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
          <Text style={styles.question}>What’s your relationship to the Child?</Text>
          
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
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
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
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
    lineHeight: 27,
    marginBottom: 40,
  },
  rolesContainer: {
    gap: 16,
  },
  roleButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    
  },
  roleButtonSelected: {
    backgroundColor: '#4A5B87',
    borderColor: 'transparent',
    
  },
  roleButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
  },
  roleButtonTextSelected: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
 

  footer: {
    paddingBottom: 32,
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
    fontFamily: 'Poppins-Regular',
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