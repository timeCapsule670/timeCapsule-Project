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
import { ArrowLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiService } from '@/libs/api';
import Toast from 'react-native-toast-message';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Refs for the input fields
  const inputRefs = useRef<(TextInput | null)[]>([]);

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

    // Focus on first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Clear error when user starts typing
    if (error) {
      setError('');
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const enteredCode = code.join('');

    if (enteredCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (!email) {
      setError('Email address not found. Please go back and try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.verifyOtp({
        email: email as string,
        otp: enteredCode
      });

      if (response.success) {
        // Show success toast
        Toast.show({
          type: 'success',
          text1: 'Code Verified!',
          text2: 'Your code has been verified. You can now reset your password.',
          position: 'top',
          visibilityTime: 3000,
        });
        
        // Wait for toast to be visible before navigating
        setTimeout(() => {
          router.push({
            pathname: '/reset-password',
            params: {
              email: email as string,
              otp: enteredCode
            }
          });
        }, 1500);
      } else {
        setError(response.message || 'Invalid code. Please try again.');
      }

    } catch (error) {
      console.error('Error verifying OTP:', error);
      if (error instanceof Error) {
        setError(error.message || 'Failed to verify code. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No email address found. Please go back and try again.',
        position: 'top',
        visibilityTime: 4000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.forgotPassword({
        email: email as string
      });

      if (response.success) {
        // Show success toast
        Toast.show({
          type: 'success',
          text1: 'Code Resent',
          text2: 'We\'ve sent another verification code to your email address.',
          position: 'top',
          visibilityTime: 3000,
        });

        // Clear the current code
        setCode(['', '', '', '', '', '']);
        setError('');

        // Focus on first input
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } else {
        // Show error toast
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to resend code. Please try again.',
          position: 'top',
          visibilityTime: 4000,
        });
      }

    } catch (error) {
      console.error('Error resending code:', error);
      if (error instanceof Error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to resend code. Please try again.',
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

  const isCodeComplete = code.every(digit => digit !== '');

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

          <Text style={styles.headerTitle}>Verify Code</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.description}>
            Enter the 6-digit code we sent to your email.
          </Text>

          {/* OTP Input Fields */}
          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  error && styles.otpInputError,
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Error Message */}
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!isCodeComplete || isLoading) && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerifyCode}
            disabled={!isCodeComplete || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Text>
          </TouchableOpacity>

          {/* Resend Code Link */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity onPress={handleResendCode} activeOpacity={0.7}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>


          {/* Back to Sign In Link */}
          {/* <View style={styles.signInContainer}>
            <Text style={styles.signInText}>
              Back to{' '}
              <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </Text>
          </View> */}
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
    paddingTop: 60,
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 80,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 20,
    gap: 12,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#606060',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  otpInputFilled: {
    borderColor: '#3B4F75',
    backgroundColor: '#F8FAFC',
  },
  otpInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  verifyButton: {
    backgroundColor: '#2F3A56',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  verifyButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: 'Poppins-SemiBold',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  resendLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 5, // better than paddingTop
  },

  signInContainer: {
    alignItems: 'center',
    marginTop: 20,
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