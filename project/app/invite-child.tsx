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
  Platform,
} from 'react-native';
import { ArrowLeft, Copy, Mail, MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';

export default function InviteChildScreen() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState<string>('');
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Generate unique invite code on component mount
    generateInviteCode();
    
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
        toValue: 1, // 100% progress (final step)
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const generateInviteCode = () => {
    // Generate a unique 8-character alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) {
        result += '-'; // Add dash in the middle for readability
      } else {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    }
    setInviteCode(result);
  };

  const handleBack = () => {
    router.back();
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(inviteCode);
      setIsCodeCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCodeCopied(false);
      }, 2000);
      
      // Show success feedback
      if (Platform.OS !== 'web') {
        Alert.alert('Copied!', 'Invite code copied to clipboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to copy invite code');
    }
  };

  const handleSendViaEmail = () => {
    const subject = 'Join me on TimeCapsule!';
    const body = `Hi there!

I've set up a TimeCapsule account to share special messages with you. TimeCapsule lets us stay connected through meaningful messages that you can receive at just the right moments.

To join and connect your account to mine, use this invite code when you sign up:

${inviteCode}

Download the TimeCapsule app and enter this code during sign-up to get started.

Looking forward to sharing this journey with you!

Love,
[Your Name]`;

    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(emailUrl).catch(() => {
      Alert.alert('Error', 'Unable to open email app');
    });
  };

  const handleSendViaText = () => {
    const message = `Hi! I've set up a TimeCapsule account to share special messages with you. Use invite code ${inviteCode} when you sign up to connect with me. Download the app and enter this code during sign-up!`;
    
    const smsUrl = Platform.select({
      ios: `sms:&body=${encodeURIComponent(message)}`,
      android: `sms:?body=${encodeURIComponent(message)}`,
      default: `sms:?body=${encodeURIComponent(message)}`,
    });
    
    Linking.openURL(smsUrl).catch(() => {
      Alert.alert('Error', 'Unable to open messaging app');
    });
  };

  const handleContinue = () => {
    // Navigate to welcome screen
    router.push('/welcome');
  };

  const handleSkipForNow = () => {
    // Navigate to welcome screen
    router.push('/welcome');
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
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Invite Your Child</Text>
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
          <Text style={styles.description}>
            We'll generate a unique invite code or link. You can share it with your child to connect their account.
          </Text>
          
          <Text style={styles.subDescription}>
            This will also be stored in your profile for future use.
          </Text>

          {/* Invite Code Section */}
          <View style={styles.inviteSection}>
            <Text style={styles.inviteSectionTitle}>Invite with a code</Text>
            
            <View style={styles.codeContainer}>
              <Text style={styles.inviteCode}>{inviteCode}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.copyButton]}
                onPress={handleCopyCode}
                activeOpacity={0.8}
              >
                <Copy size={20} color="#374151" strokeWidth={2} />
                <Text style={styles.copyButtonText}>
                  {isCodeCopied ? 'Copied!' : 'Copy Code'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.emailButton]}
                onPress={handleSendViaEmail}
                activeOpacity={0.8}
              >
                <Mail size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.emailButtonText}>Send Via Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.textButton]}
                onPress={handleSendViaText}
                activeOpacity={0.8}
              >
                <MessageSquare size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.textButtonText}>Send Via Text</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.codeInstructions}>
              Your child will enter this code during sign-up
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipForNow}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip For Now</Text>
          </TouchableOpacity>
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
    paddingBottom: 32,
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
    paddingTop: 8,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 12,
  },
  subDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 40,
  },
  inviteSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inviteSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  codeContainer: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 2,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  copyButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emailButton: {
    backgroundColor: '#3B4F75',
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  textButton: {
    backgroundColor: '#3B4F75',
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  textButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  codeInstructions: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },
  continueButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});