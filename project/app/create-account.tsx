import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Alert,
    Image,
    ToastAndroid
} from 'react-native';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from "@/libs/superbase"

export default function CreateAccountScreen() {
    const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    fullName: '',
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

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      general: '',
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
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

  const handleCreateAccount = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Parse the full name into first and last name
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // Generate a username from the first name
      const generateUsername = (name: string): string => {
        const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const timestamp = Date.now().toString().slice(-6);
        return `${cleanName}${timestamp}`;
      };

      const username = generateUsername(firstName);

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username: username,
            email: formData.email,
          }
        }
      });

      if (error) {
        console.error('Supabase sign-up error:', error);
        setErrors(prev => ({
          ...prev,
          general: error.message || 'Failed to create account. Please try again.',
        }));
        return;
      }

      if (data.user) {
        // Account created successfully
        console.log('Account created successfully:', data.user);
        
        // Navigate to onboarding
        router.push('/onboarding');
      } else {
        setErrors(prev => ({
          ...prev,
          general: 'Account creation failed. Please try again.',
        }));
      }

    } catch (error) {
      console.error('Unexpected error during account creation:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Network error. Please check your connection and try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
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

                    <View style={styles.headerContent}>
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
                    </View>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                    {/* Full Name Input */}
                    <View style={styles.inputContainer}>
                        <View style={[styles.inputWrapper, errors.fullName ? styles.inputError : null]}>
                            <User size={20} color="#64748B" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Full Name"
                                placeholderTextColor="#94A3B8"
                                value={formData.fullName}
                                onChangeText={(value) => handleInputChange('fullName', value)}
                                autoCapitalize="words"
                                autoCorrect={false}
                            />
                        </View>
                        {errors.fullName ? (
                            <Text style={styles.errorText}>{errors.fullName}</Text>
                        ) : null}
                    </View>

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

                    {/* Create Account Button */}
                    <TouchableOpacity
                        style={[styles.createButton, isLoading && styles.createButtonDisabled]}
                        onPress={handleCreateAccount}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.createButtonText}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
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
                </View>
            </View>
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
        paddingTop: 50,
        paddingBottom: 40,
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
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
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
    formSection: {
        flex: 1,
        paddingTop: 130,
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
    },
    createButton: {
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
    createButtonDisabled: {
        backgroundColor: '#94A3B8',
        shadowOpacity: 0.1,
    },
    createButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    footer: {
        paddingBottom: 62,
        alignItems: 'center',
        gap: 20,
    },
    footerText: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 16,
    },
    linkText: {
        color: '#334155',
        fontWeight: '600',
    },
    signInContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    signInText: {
        fontSize: 14,
        color: '#64748B',
    },
    signInLink: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '600',
    },
    logoSection: {
        alignItems: 'center',
        paddingTop: 10,
        flex: 1,
        justifyContent: 'center',
    },
    logoContainer: {
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 200
    },
    logoImage: {
        width: 300,
        height: 100,
    },
    tagline: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
        marginTop: -30
    },
});