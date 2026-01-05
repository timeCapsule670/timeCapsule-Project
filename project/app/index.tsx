import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
// import { supabase } from '@/libs/superbase';
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { authConfig } from '@/config/auth-config';

WebBrowser.maybeCompleteAuthSession();

export default function IndexScreen() {
  
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
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

  useEffect(() => {
    // Start slide-up animation when component mounts
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      // if (!validateForm()) {
      //   return;
      // }
  
      console.log('Attempting to sign in with email:', formData.email);
  
      try {
        const { accessToken } = await signIn();
        console.log("Access token acquired");
        setIsLoading(false);
        // Proceed with authenticated requests using the access token
        Alert.alert('Login Successful', 'You have been signed in successfully.'); 
      } catch (err) {
        console.error("Login failed", err);
        setErrors(prev => ({ ...prev, general: 'Sign-in failed. Please check your credentials and try again.' }));
        setIsLoading(false);
      }
    };
  
    async function signIn(): Promise<{
    accessToken: string;
    idToken?: string;
    expiresIn: number;
  }> {
    console.info("🔐 Starting sign-in flow");
  
    const request = new AuthSession.AuthRequest({
      clientId: authConfig.clientId,
      scopes: authConfig.scopes,
      redirectUri: authConfig.redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    });
  
    console.debug("📡 Building auth request");
    await request.makeAuthUrlAsync(authConfig.discovery);
  
    console.info("🌐 Opening system browser for authentication");
    const result = await request.promptAsync(authConfig.discovery);
  
    if (result.type !== "success") {
      const message = `Authentication cancelled or failed: ${result.type}`;
      console.warn(message);
      throw new Error(message);
    }
  
    console.info("✅ Authorization code received");
  
    if (!request.codeVerifier) {
      throw new Error("Missing PKCE code verifier");
    }
  
    console.info("🔁 Exchanging code for tokens");
  
    const tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        clientId: authConfig.clientId,
        code: result.params.code,
        redirectUri: authConfig.redirectUri,
        extraParams: {
          code_verifier: request.codeVerifier,
        },
      },
      authConfig.discovery
    );
  
    console.info("🎉 Sign-in successful");
  
    if (!tokenResponse.accessToken) {
      throw new Error("Access token missing from token response");
    }
  
    return {
      accessToken: tokenResponse.accessToken,
      idToken: tokenResponse.idToken,
      expiresIn: tokenResponse.expiresIn ?? 0,
    };
  }

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
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to access your capsules and stay connected
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

            {/* OR Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* I Have a Code Button */}
            <TouchableOpacity
              style={styles.codeButton}
              onPress={handleIHaveACode}
              activeOpacity={0.8}
            >
              <Text style={styles.codeButtonText}>I Have a Code</Text>
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
        </Animated.View>
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    color: '#1C2333',
    lineHeight: 40,
    verticalAlign: 'middle',
    marginBottom: 16,
    fontFamily: 'Poppins-Bold',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
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
});