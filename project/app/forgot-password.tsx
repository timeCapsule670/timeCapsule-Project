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
} from 'react-native';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiService } from '@/libs/api';
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams();
  const [email, setEmail] = useState(emailParam ? emailParam as string : '');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.forgotPassword({
        email: email.trim()
      });

      if (response.success) {
        setCodeSent(true);
        // Show success toast
        Toast.show({
          type: 'success',
          text1: 'OTP Sent Successfully',
          text2: 'We\'ve sent a 6-digit OTP to your email address. Please check your inbox and enter the code.',
          position: 'top',
          visibilityTime: 3000,
        });
        
        // Wait for toast to be visible before navigating
        setTimeout(() => {
          router.push({
            pathname: '/verify-code',
            params: { email: email.trim() }
          });
        }, 1500);
      } else {
        setError(response.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to send OTP. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim() || !validateEmail(email.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address to resend the code.',
        position: 'top',
        visibilityTime: 4000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.forgotPassword({
        email: email.trim()
      });

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Resent',
          text2: 'We\'ve sent another 6-digit OTP to your email address.',
          position: 'top',
          visibilityTime: 3000,
        });
              } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: response.message || 'Failed to resend OTP. Please try again.',
            position: 'top',
            visibilityTime: 4000,
          });
        }
      } catch (error) {
        console.error('Error resending OTP:', error);
        if (error instanceof Error) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message || 'Failed to resend OTP. Please try again.',
            position: 'top',
            visibilityTime: 4000,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'An unexpected error occurred. Please try again.',
            position: 'top',
            visibilityTime: 4000,
          });
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
          
          <Text style={styles.headerTitle}>Forgot Password?</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.description}>
            Enter your email address and we'll send you a one-time code to reset your password.
          </Text>

          {/* Input Field */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
              <Mail size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Email Address"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={handleInputChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>

          {/* Send Code Button */}
          <TouchableOpacity
            style={[styles.sendCodeButton, isLoading && styles.sendCodeButtonDisabled]}
            onPress={handleSendCode}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.sendCodeButtonText}>
              {isLoading ? 'Sending...' : 'Send Code'}
            </Text>
          </TouchableOpacity>

          {/* Resend Code Link */}
          {codeSent && (
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the code?{' '}
                <TouchableOpacity onPress={handleResendCode} activeOpacity={0.7}>
                  <Text style={styles.resendLink}>Resend.</Text>
                </TouchableOpacity>
              </Text>
            </View>
          )}

                     {/* Back to Sign In Link */}
           <View style={styles.signInContainer}>
             <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
               <Text style={styles.signInLink}> Back to Sign In</Text>
             </TouchableOpacity>
           </View>
        </View>
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
    paddingTop: 40,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
    width: '100%',
  },
  inputContainer: {
    marginBottom: 40,
    width: '100%',
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
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  sendCodeButton: {
    backgroundColor: '#2F3A56',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  sendCodeButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0.1,
  },
  sendCodeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: 'Poppins-Regular',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  resendLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  signInContainer: {
    alignItems: 'center',
    width: '100%',
  },
  signInText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  signInLink: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});