import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiService } from '@/libs/api';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IndexScreen() {
  const router = useRouter();
  const { signIn: authSignIn } = useAuth();
  const { email: prefilledEmail, newUser } = useLocalSearchParams();
  const [formData, setFormData] = useState({
    email: (prefilledEmail as string) || '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      general: '',
    };

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field as keyof typeof errors] || errors.general) {
      setErrors(prev => ({ ...prev, [field]: '', general: '' }));
    }
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Sign in using the API service
      const response = await apiService.signIn({
        email: formData.email,
        password: formData.password,
      });

      if (response.success && response.data.token) {
        // Store the token and user data using AuthContext
        await authSignIn(response.data.user, response.data.token);
        
        // Check if profile is complete (has username/first_name)
        if (!response.data.user.username || response.data.user.username === '') {
          // Profile not complete, redirect to profile setup
          router.push('/profile-setup');
          return;
        }

        // For existing users who haven't completed onboarding, redirect to moments-selection
        // The moments-selection page will handle checking if categories are already selected
        // and allow users to complete or continue their onboarding
        router.push('/profile-setup');
        return;
      } else {
        setErrors(prev => ({
          ...prev,
          general: response.message || 'Invalid email or password. Please try again.',
        }));
      }

    } catch (error) {
      console.error('Sign-in error:', error);
      
      // Check if the error is due to user not found or invalid credentials
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      
      if (errorMessage.includes('Invalid login credentials') || 
          errorMessage.includes('User not found') ||
          errorMessage.includes('Invalid email or password')) {
        
        // Navigate to create account with pre-filled data
        router.push({
          pathname: '/create-account',
          params: {
            email: formData.email,
            password: formData.password,
          }
        });
        return;
      }
      
      setErrors(prev => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/create-account');
  };

  const handleIHaveACode = () => {
    // Navigate to teen interface or code entry screen
    Alert.alert('Teen Interface', 'Teen interface feature coming soon!');
  };

  const handleForgotPassword = () => {
    if (!formData.email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address first to reset your password.');
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address to reset your password.');
      return;
    }

    // Navigate to forgot password screen with email pre-filled
    router.push({
      pathname: '/forgot-password',
      params: { email: formData.email.trim() }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.headerContent}>
                        <View style={styles.logoSection}>
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require('../assets/images/time-capsule.png')}
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </View>

                            <Text style={styles.tagline}>Crafting Memories, Connecting Generations</Text>
                        </View>
                    </View>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>
              {newUser === 'true' ? 'Welcome' : 'Welcome'}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {newUser === 'true' 
                ? 'Sign in to access your capsules and stay connected'
                : 'Sign in to access your capsules and stay connected'
              }
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* General Error Message */}
            {errors.general ? (
              <View style={styles.generalErrorContainer}>
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
                <Mail size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Email Address"
                  placeholderTextColor="#94A3B8"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                <Lock size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#64748B" />
                  ) : (
                    <Eye size={20} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.signInButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

           
            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
                <Text style={styles.signUpLink}>Sign up</Text>
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.linkText}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
            
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  welcomeSection: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 85,
  },
  welcomeTitle: {
    fontSize: 32,
    color: '#1C2333',
    lineHeight: 40,
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 21,
    fontWeight: '400',
    paddingHorizontal: 20,
    verticalAlign: 'middle',
    fontFamily: 'Poppins-Regular',
  },
  formSection: {
    width: '100%',
    paddingBottom: 20,
  },
  generalErrorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  generalErrorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: 4,
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
    color: '#334155',
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
  signInButton: {
    backgroundColor: '#2F3A56',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 32,
  },
  signInButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0.1,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  codeButton: {
    backgroundColor: '#FCB32B',
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 32,
  },
  codeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signUpText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  signUpLink: {
    fontSize: 16,
    color: '#6099EA',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 16,
    color: '#6099EA',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
    gap: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
  },
  linkText: {
    color: '#334155',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  headerContent: {
    flex: 1,
},
headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    letterSpacing: -0.5,
},
headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
},
logoSection: {
  alignItems: 'center',
  paddingTop: 10,
  flex: 1,
  justifyContent: 'center',
},
logoContainer: {
  marginBottom: 4,
  alignItems: 'center',
  justifyContent: 'center',
},
logoImage: {
  width: 257,
  height: 57,
},
tagline: {
  fontSize: 10,
  color: '#777777',
  textAlign: 'center',
  lineHeight: 13,
  paddingHorizontal: 10,
  fontFamily: 'Poppins-Regular',
},

});