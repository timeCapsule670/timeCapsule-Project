import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Link, Heart, CalendarDays, Mic, MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import NextButton from '@/components/NextButton';

export default function LinkAccountScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0.2)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 0.4, // 40% progress
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const handleBack = () => {
    router.push('/personalize-profile');
  };

  const handleYesLink = () => {
    router.push('/child-profile-setup');
  };

  const handleNoLater = () => {
    router.push('/push-notification');
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
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={true}
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
            
            <Text style={styles.headerTitle}>Link An Account</Text>
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
            {/* Link Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: scaleAnim }],
                }
              ]}
            >
              <LinearGradient
                colors={['#C28FEF', '#1D6EE1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.linkIcon}
              >
                <Link size={32} color="#ffffff" strokeWidth={2} />
              </LinearGradient>
            </Animated.View>

            {/* Main Question */}
            <Text style={styles.mainQuestion}>
              Would you like to link your account to a loved one now?
            </Text>

            {/* What Linking Allows Section */}
            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>What linking allows:</Text>
              
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: '#6099EA' }]}>
                    <CalendarDays size={20} color="#ffffff" strokeWidth={2} />
                  </View>
                  <Text style={styles.benefitText}>
                    Schedule messages for special moments.
                  </Text>
                </View>

                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: '#FF2828' }]}>
                    <Mic size={20} color="#ffffff" strokeWidth={2} />
                  </View>
                  <Text style={styles.benefitText}>
                    Send voice, video, and text messages
                  </Text>
                </View>

                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: '#8A5FCC' }]}>
                    <MessageSquare size={20} color="#ffffff" strokeWidth={2} />
                  </View>
                  <Text style={styles.benefitText}>
                    Receive reactions and replies
                  </Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <NextButton
                text="Yes, Let's Link"
                onPress={handleYesLink}
                variant="primary"
                style={styles.yesButton}
              />

              <NextButton
                text="No, I'll Do This Later"
                onPress={handleNoLater}
                variant="secondary"
                style={styles.noButton}
              />

              <Text style={styles.footerNote}>
                You can always add a recipient later from your account settings or vault.
              </Text>
            </View>
          </View>
        </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 58,
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#334155',
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40, // Add bottom padding for better scrolling
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  linkIcon: {
    width: 60,
    height: 60,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  mainQuestion: {
    fontSize: 22,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 33,
    marginBottom: 40,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Bold',
  },
  benefitsSection: {
    width: '100%',
    marginBottom: 40,
  },
  benefitsTitle: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 27
  },
  benefitsList: {
    gap: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  yesButton: {
    marginBottom: 16,
    minWidth: 370,
    borderRadius: 10,
  },
  noButton: {
    marginBottom: 16,
    minWidth: 370,
    borderRadius: 10,
  },
  footerNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
});