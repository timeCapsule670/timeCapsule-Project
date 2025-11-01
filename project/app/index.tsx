import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Lock, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function SocialSignInScreen() {
  const router = useRouter();

  const handleSkip = () => {
    router.push('/onboarding-flow');
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Coming Soon', 'Google sign-in will be available soon!');
  };

  const handleAppleSignIn = () => {
    Alert.alert('Coming Soon', 'Apple sign-in will be available soon!');
  };

  const handleEmailSignIn = () => {
    router.push('/sign-in');
  };

  const handleEnterCode = () => {
    router.push('/enter-code');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
        {/* Skip Button */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            {/* <Text style={styles.skipText}>Skip</Text> */}
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Lock Icon */}
          <View style={styles.iconContainer}>
            <Image source={require('../assets/images/Icon Container (1).png')} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Ready To Unlock Your Timecapsule?</Text>

          {/* Description */}
          <Text style={styles.description}>
            Sign in to start saving memories or enter your unique code to join your family's capsule
          </Text>

          {/* Social Sign-In Buttons */}
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
            >
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}><Image source={require('../assets/images/google.png')} /></Text>
              </View>
              <Text style={styles.socialButtonText}>Sign In With Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleAppleSignIn}
              activeOpacity={0.8}
            >
              <View style={styles.appleIcon}>
                <Text style={styles.appleIconText}><Image source={require('../assets/images/apple.png')} /></Text>
              </View>
              <Text style={styles.socialButtonText}>Sign In With Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleEmailSignIn}
              activeOpacity={0.8}
            >
              <View style={styles.emailIcon}><Image source={require('../assets/images/email.png')} /></View>
              <Text style={styles.socialButtonText}>Sign In With Email</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Enter Code Button */}
          <TouchableOpacity
            style={styles.codeButton}
            onPress={handleEnterCode}
            activeOpacity={0.8}
          >
            <Text style={styles.codeButtonText}>Have a code? Enter it here</Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerSpacer: {
    width: 40,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  iconContainer: {
    marginBottom: 40,
  },
  lockIcon: {
    width: 100,
    height: 100,
    
  },
  title: {
    fontSize: 32,
    color: '#4A5B87',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 16,
    paddingHorizontal: 20,
    fontFamily: 'Poppins-Bold',
  },
  description: {
    fontSize: 16,
    color: '#5A5A5A',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 48,
    paddingHorizontal: 20,
    fontFamily: 'Poppins-Light',
  },
  socialButtonsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIcon: {
    width: 30,
    height: 30,
   
  },
  googleIconText: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Poppins-Medium',
  },
  appleIcon: {
    width: 30,
    height: 30,
   
  },
  emailIcon: {
    width: 30,
    height: 30,
   
  },
  appleIconText: {
    fontSize: 16,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Poppins-Medium',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  codeButton: {
    backgroundColor: '#FCB32B',
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
   
  },
  codeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
    gap: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
    paddingTop: 10,
  },
  linkText: {
    color: '#3B4F75',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
});