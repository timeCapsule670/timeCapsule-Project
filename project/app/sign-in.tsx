import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Image,
} from 'react-native';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { apiService } from '@/libs/api';
import { useAuth } from '@/contexts/AuthContext';
import Toast from 'react-native-toast-message';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      // Sign in with the API
      const apiResponse = await apiService.signIn({
        email: formData.email,
        password: formData.password,
      });

      if (apiResponse.success) {
        // Store the token and user data using auth context
        await signIn(apiResponse.data.user, apiResponse.data.token);
        
        console.log('Sign in successful:', apiResponse.data.user);
        
        // Show success toast
        Toast.show({
          type: 'success',
          text1: 'Welcome Back!',
          text2: `Hello ${apiResponse.data.user.username || 'there'}! Redirecting to home...`,
          position: 'top',
          visibilityTime: 3000,
        });
        
        // Wait for toast to be visible before navigating
        setTimeout(() => {
          router.push({
            // pathname: '/(tabs)',
            pathname: '/onboarding',
            params: { firstName: apiResponse.data.user.username || 'there' }
          });
        }, 1500);
      } else {
        setErrors(prev => ({
          ...prev,
          general: 'Login failed. Please try again.',
        }));
      }

    } catch (error) {
      console.error('Error during sign-in:', error);
      
      // Show appropriate error message
      if (error instanceof Error) {
        setErrors(prev => ({
          ...prev,
          general: error.message || 'Network error. Please check your connection and try again.',
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          general: 'Network error. Please check your connection and try again.',
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

    const handleForgotPassword = () => {
        // TODO: Implement forgot password functionality
        console.log('Forgot password pressed');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <View style={styles.content}>
                {/* Header with Back Button */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleGoBack}
                        activeOpacity={0.7}
                    >
                        <ArrowLeft size={24} color="#334155" strokeWidth={2} />
                    </TouchableOpacity>
                </View>

                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/images/time-capsule.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.tagline}>Messages that grow with your child</Text>
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

                    {/* Forgot Password Link */}
                    <TouchableOpacity
                        style={styles.forgotPasswordContainer}
                        onPress={handleForgotPassword}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

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
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.linkText}>Terms of Service</Text>
                        {' '}and{' '}
                        <Text style={styles.linkText}>Privacy Policy</Text>
                    </Text>

                    <View style={styles.signUpContainer}>
                        <Text style={styles.signUpText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/create-account')}>
                            <Text style={styles.signUpLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
            </View>
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
        paddingTop: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    logoSection: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 60,
    },
    logoContainer: {
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: -5
    },
    logoImage: {
        width: 300,
        height: 100,
    },
    appName: {
        fontSize: 36,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
        letterSpacing: -0.5,
        fontFamily: 'Poppins-Bold',
    },
    tagline: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
        fontFamily: 'Poppins-Regular',
    },
    formSection: {
        flex: 1,
        paddingTop: 20,
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
        marginBottom: 24,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
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
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 32,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    signInButton: {
        backgroundColor: '#334155',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#334155',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
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
        fontFamily: 'Poppins-SemiBold',
    },
    footer: {
        paddingBottom: 32,
        alignItems: 'center',
        gap: 20,
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
    signUpContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    signUpText: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: 'Poppins-Regular',
    },
    signUpLink: {
        fontSize: 14,
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
});