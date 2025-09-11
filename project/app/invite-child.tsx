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
  ScrollView,
} from 'react-native';
import { ArrowLeft, Copy, Mail, MessageSquare, RotateCcw, ArrowRight, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { supabase } from '@/libs/superbase';
import { apiService, InviteCode } from '@/libs/api';

export default function InviteChildScreen() {
  const router = useRouter();
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Load existing invite codes on component mount
    loadInviteCodes();
    
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
        toValue: 1.0, // 100% progress (final step)
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const loadInviteCodes = async () => {
    try {
      const result = await apiService.getMyInviteCodes();
      if (result.success) {
        setInviteCodes(result.data);
        // Set the most recent valid code as current
        const validCodes = result.data.filter((code: InviteCode) => !code.is_used && new Date(code.expires_at) > new Date());
        if (validCodes.length > 0) {
          const latestCode = validCodes[0];
          setCurrentCode(latestCode.code);
          setExpirationDate(new Date(latestCode.expires_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }));
        }
      }
    } catch (error) {
      console.error('Error loading invite codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInviteCode = async () => {
    setIsGenerating(true);
    
    try {
      const result = await apiService.generateInviteCode();
      if (result.success) {
        setCurrentCode(result.data.code);
        setExpirationDate(result.data.formattedExpiration);
        
        // Reload the list of invite codes
        await loadInviteCodes();
        
        Alert.alert('Success', 'New invite code generated successfully!');
      } else {
        Alert.alert('Error', 'Failed to generate invite code');
      }
    } catch (error) {
      console.error('Error generating invite code:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeInviteCode = async (codeId: string) => {
    try {
      const result = await apiService.revokeInviteCode(codeId);
      if (result.success) {
        Alert.alert('Success', 'Invite code revoked successfully');
        // Reload the list of invite codes
        await loadInviteCodes();
      } else {
        Alert.alert('Error', result.message || 'Failed to revoke invite code');
      }
    } catch (error) {
      console.error('Error revoking invite code:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleGenerateNewCode = () => {
    generateInviteCode();
    
    // Reset copied state
    setIsCodeCopied(false);
  };

  const handleCopyCode = async () => {
    if (!currentCode) {
      Alert.alert('No Code', 'Please generate an invite code first');
      return;
    }

    try {
      await Clipboard.setStringAsync(currentCode);
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
    if (!currentCode) {
      Alert.alert('No Code', 'Please generate an invite code first');
      return;
    }

    const subject = 'Join me on TimeCapsule!';
    const body = `Hi there!

I've set up a TimeCapsule account to share special messages with you. TimeCapsule lets us stay connected through meaningful messages that you can receive at just the right moments.

To join and connect your account to mine, use this invite code when you sign up:

${currentCode}

This code expires on ${expirationDate}.

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
    if (!currentCode) {
      Alert.alert('No Code', 'Please generate an invite code first');
      return;
    }

    const message = `Hi! I've set up a TimeCapsule account to share special messages with you. Use invite code ${currentCode} when you sign up to connect with me. Code expires ${expirationDate}. Download the app and enter this code during sign-up!`;
    
    const smsUrl = Platform.select({
      ios: `sms:&body=${encodeURIComponent(message)}`,
      android: `sms:?body=${encodeURIComponent(message)}`,
      default: `sms:?body=${encodeURIComponent(message)}`,
    });
    
    Linking.openURL(smsUrl).catch(() => {
      Alert.alert('Error', 'Unable to open messaging app');
    });
  };

  const handleNext = () => {
    // Navigate to welcome screen
    router.push('/welcome');
  };

  const confirmRevokeCode = (codeId: string, code: string) => {
    Alert.alert(
      'Revoke Invite Code',
      `Are you sure you want to revoke the invite code "${code}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Revoke', style: 'destructive', onPress: () => revokeInviteCode(codeId) },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading invite codes...</Text>
        </View>
      </SafeAreaView>
    );
  }

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

        {/* Scrollable Main Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.description}>
            We'll generate a unique invite code or link. You can share it with your child to connect their account.
          </Text>
          
          <Text style={styles.subDescription}>
            This will also be stored in your profile for future use.
          </Text>

          {/* Current Invite Code Section */}
          <View style={styles.linkCodeSection}>
            <Text style={styles.linkCodeTitle}>Current Invite Code</Text>
            
            {currentCode ? (
              <View style={styles.codeCard}>
                <Text style={styles.inviteCode}>{currentCode}</Text>
                <Text style={styles.expirationText}>Expires: {expirationDate}</Text>
              </View>
            ) : (
              <View style={styles.noCodeCard}>
                <Text style={styles.noCodeText}>No active invite code</Text>
                <Text style={styles.noCodeSubtext}>Generate one to get started</Text>
              </View>
            )}

            {/* Generate New Code Button */}
            <TouchableOpacity
              style={styles.generateNewCodeButton}
              onPress={handleGenerateNewCode}
              disabled={isGenerating}
              activeOpacity={0.7}
            >
              <RotateCcw size={20} color="#3B82F6" strokeWidth={2} />
              <Text style={styles.generateNewCodeText}>
                {isGenerating ? 'Generating...' : 'Generate New Code'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Share Your Code Section */}
          {currentCode && (
            <View style={styles.shareSection}>
              <Text style={styles.shareSectionTitle}>Share Your Code</Text>
              
              <View style={styles.shareButtons}>
                <TouchableOpacity
                  style={[styles.shareButton, styles.copyButton]}
                  onPress={handleCopyCode}
                  activeOpacity={0.8}
                >
                  <Copy size={20} color="#374151" strokeWidth={2} />
                  <Text style={styles.copyButtonText}>
                    {isCodeCopied ? 'Copied!' : 'Copy Code'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.shareButton, styles.emailButton]}
                  onPress={handleSendViaEmail}
                  activeOpacity={0.8}
                >
                  <Mail size={20} color="#ffffff" strokeWidth={2} />
                  <Text style={styles.emailButtonText}>Send Via Email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.shareButton, styles.textButton]}
                  onPress={handleSendViaText}
                  activeOpacity={0.8}
                >
                  <MessageSquare size={20} color="#ffffff" strokeWidth={2} />
                  <Text style={styles.textButtonText}>Send Via Text</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Invite Code History Section */}
          {inviteCodes.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historySectionTitle}>Invite Code History</Text>
              
              {inviteCodes.map((code) => (
                <View key={code.id} style={styles.historyCard}>
                  <View style={styles.historyCardContent}>
                    <Text style={styles.historyCode}>{code.code}</Text>
                    <View style={styles.historyDetails}>
                      <Text style={styles.historyDate}>
                        Created: {new Date(code.created_at).toLocaleDateString()}
                      </Text>
                      <Text style={styles.historyExpiry}>
                        Expires: {new Date(code.expires_at).toLocaleDateString()}
                      </Text>
                      <View style={[
                        styles.statusBadge,
                        code.is_used ? styles.statusUsed : styles.statusActive
                      ]}>
                        <Text style={styles.statusText}>
                          {code.is_used ? 'Used' : 'Active'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {!code.is_used && (
                    <TouchableOpacity
                      style={styles.revokeButton}
                      onPress={() => confirmRevokeCode(code.id, code.code)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          <Text style={styles.footerNote}>
            You can always find your invite codes in your account settings.
          </Text>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <ArrowRight size={20} color="#ffffff" strokeWidth={2} />
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
    fontFamily: 'Poppins-SemiBold',
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 8,
    paddingBottom: 32, // Add padding at the bottom for the footer
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  subDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 40,
    fontFamily: 'Poppins-Regular',
  },
  linkCodeSection: {
    marginBottom: 40,
  },
  linkCodeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 16,
    fontFamily: 'Poppins-Medium',
  },
  codeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noCodeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inviteCode: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 1,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  noCodeText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  noCodeSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
  expirationText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  generateNewCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  generateNewCodeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B82F6',
    fontFamily: 'Poppins-Medium',
  },
  shareSection: {
    marginBottom: 40,
  },
  shareSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Poppins-Medium',
  },
  shareButtons: {
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  copyButton: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Poppins-SemiBold',
  },
  emailButton: {
    backgroundColor: '#F59E0B',
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  textButton: {
    backgroundColor: '#A855F7',
  },
  textButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  historySection: {
    marginTop: 20,
    marginBottom: 40,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Poppins-Medium',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyCardContent: {
    flex: 1,
  },
  historyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
  historyExpiry: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: '#E0F2F7',
    borderWidth: 1,
    borderColor: '#A7DBE9',
  },
  statusUsed: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Poppins-SemiBold',
  },
  revokeButton: {
    padding: 8,
  },
  footerNote: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  footer: {
    paddingTop: 24,
    paddingBottom: 32,
  },
  nextButton: {
    backgroundColor: '#3B4F75',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    fontFamily: 'Poppins-Medium',
  },
});
