import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { ArrowLeft, Link, Calendar, MessageSquare, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

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
    router.push('/moments-selection');
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

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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
              <View style={styles.linkIcon}>
                <Link size={32} color="#ffffff" strokeWidth={2} />
              </View>
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
                  <View style={[styles.benefitIcon, { backgroundColor: '#DBEAFE' }]}>
                    <Calendar size={20} color="#3B82F6" strokeWidth={2} />
                  </View>
                  <Text style={styles.benefitText}>
                    Schedule messages for special moments.
                  </Text>
                </View>

                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: '#FEF2F2' }]}>
                    <MessageSquare size={20} color="#EF4444" strokeWidth={2} />
                  </View>
                  <Text style={styles.benefitText}>
                    Send voice, video, and text messages
                  </Text>
                </View>

                <View style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: '#F3E8FF' }]}>
                    <Heart size={20} color="#8B5CF6" strokeWidth={2} />
                  </View>
                  <Text style={styles.benefitText}>
                    Receive reactions and replies
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.yesButton}
            onPress={handleYesLink}
            activeOpacity={0.9}
          >
            <Text style={styles.yesButtonText}>Yes, Let's Link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.noButton}
            onPress={handleNoLater}
            activeOpacity={0.9}
          >
            <Text style={styles.noButtonText}>No, I'll Do This Later</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            You can always add a recipient later from your account settings or vault.
          </Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
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
    flexGrow: 1,
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  linkIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
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
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 40,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  benefitsSection: {
    width: '100%',
    marginBottom: 40,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
    fontFamily: 'Poppins-SemiBold',
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
    gap: 16,
  },
  yesButton: {
    backgroundColor: '#334155',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#334155',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  yesButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  noButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  noButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
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