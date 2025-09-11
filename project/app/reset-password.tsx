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
} from 'react-native';
import { ArrowLeft, Lock, Eye, EyeOff, Check } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiService } from '@/libs/api';
import Toast from 'react-native-toast-message';

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, otp } = useLocalSearchParams();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRequirements, setShowRequirements] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const requirementsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Password requirements with validation functions
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    {
      id: 'length',
      label: 'At least 8 characters',
      test: (password: string) => password.length >= 8,
      met: false,
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter',
      test: (password: string) => /[A-Z]/.test(password),
      met: false,
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter',
      test: (password: string) => /[a-z]/.test(password),
      met: false,
    },
    {
      id: 'number',
      label: 'One Number',
      test: (password: string) => /\d/.test(password),
      met: false,
    },
  ]);

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
    ]).start();
  }, []);

  // Update password requirements as user types
  useEffect(() => {
    const updatedRequirements = requirements.map(req => ({
      ...req,
      met: req.test(newPassword),
    }));
    setRequirements(updatedRequirements);
  }, [newPassword]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (requirementsTimeoutRef.current) {
        clearTimeout(requirementsTimeoutRef.current);
      }
    };
  }, []);

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    
    // Show requirements when user starts typing
    if (value.length > 0) {
      setShowRequirements(true);
      
      // Clear existing timeout
      if (requirementsTimeoutRef.current) {
        clearTimeout(requirementsTimeoutRef.current);
      }
      
      // Set timeout to hide requirements after 3 seconds of no typing
      requirementsTimeoutRef.current = setTimeout(() => {
        setShowRequirements(false);
      }, 3000);
    } else {
      // Hide requirements if password field is empty
      setShowRequirements(false);
      if (requirementsTimeoutRef.current) {
        clearTimeout(requirementsTimeoutRef.current);
      }
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validatePasswords = () => {
    // Check if all requirements are met
    const allRequirementsMet = requirements.every(req => req.met);
    
    if (!allRequirementsMet) {
      setError('Password does not meet all requirements');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) {
      return;
    }

    if (!email || !otp) {
      setError('Missing email or OTP. Please go back and try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.resetPasswordWithOtp({
        email: email as string,
        otp: otp as string,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      });

      if (response.success) {
        // Show success toast
        Toast.show({
          type: 'success',
          text1: 'Password Reset Successful!',
          text2: 'Your password has been updated successfully. You can now sign in with your new password.',
          position: 'top',
          visibilityTime: 3000,
        });
        
        // Wait for toast to be visible before navigating
        setTimeout(() => {
          router.push('/reset-password-success');
        }, 1500);
      } else {
        setError(response.message || 'Failed to reset password. Please try again.');
      }

    } catch (error) {
      console.error('Error resetting password:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to reset password. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const allRequirementsMet = requirements.every(req => req.met);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const isFormValid = allRequirementsMet && passwordsMatch;

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
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content */}
        <ScrollView 
          style={styles.mainContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.description}>
            Create a new password below. Make sure it's strong and secure.
          </Text>

          {/* New Password Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={[styles.inputWrapper, error && styles.inputError]}>
              <Lock size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter New Password"
                placeholderTextColor="#94A3B8"
                value={newPassword}
                onChangeText={handleNewPasswordChange}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
                activeOpacity={0.7}
              >
                {showNewPassword ? (
                  <EyeOff size={20} color="#64748B" />
                ) : (
                  <Eye size={20} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
            
            {/* Password Requirements - Show only when showRequirements is true */}
            {showRequirements && (
              <View style={styles.requirementsSection}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                
                <View style={styles.requirementsList}>
                  {requirements.map((requirement) => (
                    <Animated.View
                      key={requirement.id}
                      style={[
                        styles.requirementItem,
                        {
                          opacity: fadeAnim,
                        }
                      ]}
                    >
                      <View style={[
                        styles.requirementIndicator,
                        requirement.met && styles.requirementIndicatorMet,
                      ]}>
                        {requirement.met ? (
                          <Check size={12} color="#ffffff" strokeWidth={3} />
                        ) : (
                          <View style={styles.requirementDot} />
                        )}
                      </View>
                      <Text style={[
                        styles.requirementText,
                        requirement.met && styles.requirementTextMet,
                      ]}>
                        {requirement.label}
                      </Text>
                    </Animated.View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Confirm Password Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={[
              styles.inputWrapper, 
              (error || (confirmPassword && newPassword !== confirmPassword)) && styles.inputError
            ]}>
              <Lock size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm New Password"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#64748B" />
                ) : (
                  <Eye size={20} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
            {confirmPassword && newPassword !== confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>

          {/* Error Message */}
          {error ? (
            <Text style={styles.generalErrorText}>{error}</Text>
          ) : null}

          {/* Reset Password Button */}
          <TouchableOpacity
            style={[
              styles.resetButton,
              (!isFormValid || isLoading) && styles.resetButtonDisabled,
            ]}
            onPress={handleResetPassword}
            disabled={!isFormValid || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.resetButtonText}>
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>

          {/* Back to Sign In Link */}
          {/* <View style={styles.signInContainer}>
            <Text style={styles.signInText}>
              Back to{' '}
              <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </Text>
          </View> */}
        </ScrollView>
      </Animated.View>
      <Toast />
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
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
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
  mainContent: {
    flex: 1,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 56,
   
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
    fontFamily: 'Poppins-Regular',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  requirementsSection: {
    marginBottom: 40,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  requirementsList: {
    gap: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  requirementIndicatorMet: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  requirementText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  requirementTextMet: {
    color: '#10B981',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  generalErrorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  resetButton: {
    backgroundColor: '#2F3A56',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  resetButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  signInContainer: {
    alignItems: 'center',
  },
  signInText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  signInLink: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});