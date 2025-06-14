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
  Modal,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Bell, CreditCard as Edit3, Lightbulb, Chrome as Home, Play, Check, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Poppins_600SemiBold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';

export default function WelcomeScreen() {
  const router = useRouter();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showMessageTypeModal, setShowMessageTypeModal] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const checklistAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(checklistAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSetupNotifications = () => {
    setShowNotificationModal(true);
  };

  const handleCreateFirstMessage = () => {
    setShowMessageTypeModal(true);
  };

  const handleExplorePrompts = () => {
    // Navigate to prompts page (placeholder)
    Alert.alert('Coming Soon', 'Message prompts feature is coming soon!');
  };

  const handleTakeTour = () => {
    // Open tutorial (placeholder)
    Alert.alert('Tutorial', 'Interactive tutorial coming soon!');
  };

  const handleGoHome = () => {
    router.push('/(tabs)');
  };

  const requestNotificationPermission = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Notifications', 'Push notifications are not available on web platform');
        setShowNotificationModal(false);
        return;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationPermission(status);

      if (status === 'granted') {
        Alert.alert('Success!', 'Notification reminders have been enabled. You\'ll receive gentle reminders to create and send messages.');
      } else {
        Alert.alert('Permissions Needed', 'To receive reminders, please enable notifications in your device settings.');
      }

      setShowNotificationModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to setup notifications. Please try again.');
      setShowNotificationModal(false);
    }
  };

  const handleMessageTypeSelection = (type: 'video' | 'audio' | 'text') => {
    setShowMessageTypeModal(false);
    // Navigate to appropriate message creation flow
    Alert.alert('Message Creation', `${type.charAt(0).toUpperCase() + type.slice(1)} message creation flow coming soon!`);
  };

  const handleContinue = () => {
    // Navigate to home tabs
    router.push('/(tabs)');
  };

  const handleSkipForNow = () => {
    // Navigate to home tabs
    router.push('/(tabs)');
  };

  const ChecklistItem = ({ text, delay = 0 }: { text: string; delay?: number }) => (
    <Animated.View
      style={[
        styles.checklistItem,
        {
          opacity: checklistAnim,
          transform: [
            {
              translateX: checklistAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.checkIcon}>
        <Check size={16} color="#ffffff" strokeWidth={3} />
      </View>
      <Text style={styles.checklistText}>{text}</Text>
    </Animated.View>
  );

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
        >
          {/* Header with Family Icon */}
          <Animated.View
            style={[
              styles.header,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.familyIcon}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.welcomeText}>Welcome To</Text>
            <Text style={styles.appName}>TimeCapsule</Text>
          </Animated.View>

          {/* Description */}
          <Text style={styles.description}>
            You're all set to start capturing meaningful moments and supporting your child in ways that truly matter.
          </Text>

          {/* Ready to Go Section */}
          <View style={styles.readySection}>
            <Text style={styles.readyTitle}>Here's what's ready to go:</Text>

            <View style={styles.checklist}>
              <ChecklistItem text="Parent account created" delay={0} />
              <ChecklistItem text="Invites sent successfully" delay={200} />
              <ChecklistItem text="First message prompt ready" delay={400} />
            </View>
          </View>

          {/* Action Question */}
          <Text style={styles.actionQuestion}>What would you like to do first?</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.notificationButton]}
              onPress={handleSetupNotifications}
              activeOpacity={0.8}
            >
              <Image
                source={require('../assets/images/twemoji_bell.png')}
                style={styles.notificationLogo}
                resizeMode="contain"
              />
              <Text style={styles.notificationButtonText}>Set Up Notification Reminders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.messageButton]}
              onPress={handleCreateFirstMessage}
              activeOpacity={0.8}
            >
              <Image
                source={require('../assets/images/emojione_pencil.png')}
                style={styles.notificationLogo}
                resizeMode='contain' />
              <Text style={styles.messageButtonText}>Create Your First Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.promptsButton]}
              onPress={handleExplorePrompts}
              activeOpacity={0.8}
            >
              <Image
                source={require('../assets/images/fxemoji_lightbulb.png')}
                style={styles.notificationLogo}
                resizeMode='contain' />
              <Text style={styles.promptsButtonText}>Explore Message Prompts</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Note */}
          <Text style={styles.footerNote}>
            You can change or update any settings later in the menu.
          </Text>

          {/* Home Button - Now inside ScrollView */}
          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleGoHome}
            activeOpacity={0.9}
          >
            <Text style={styles.homeButtonText}>Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Notification Permission Modal */}
      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enable Notifications</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowNotificationModal(false)}
              >
                <X size={24} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Get gentle reminders to create and send meaningful messages to your child. You can customize these reminders anytime.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowNotificationModal(false)}
              >
                <Text style={styles.modalCancelText}>Maybe Later</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={requestNotificationPermission}
              >
                <Text style={styles.modalConfirmText}>Enable Notifications</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Message Type Selection Modal */}
      <Modal
        visible={showMessageTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMessageTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.messageTypeModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Message Type</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowMessageTypeModal(false)}
              >
                <X size={24} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              What type of message would you like to create?
            </Text>

            <View style={styles.messageTypeOptions}>
              <TouchableOpacity
                style={styles.messageTypeButton}
                onPress={() => handleMessageTypeSelection('video')}
              >
                <Text style={styles.messageTypeEmoji}>🎥</Text>
                <Text style={styles.messageTypeText}>Video Message</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.messageTypeButton}
                onPress={() => handleMessageTypeSelection('audio')}
              >
                <Text style={styles.messageTypeEmoji}>🎙️</Text>
                <Text style={styles.messageTypeText}>Audio Message</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.messageTypeButton}
                onPress={() => handleMessageTypeSelection('text')}
              >
                <Text style={styles.messageTypeEmoji}>✍️</Text>
                <Text style={styles.messageTypeText}>Text Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40, // Increased padding at bottom to accommodate home button
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  familyIcon: {
    width: 80,
    height: 80,
  },
  notificationLogo: {
    width: 25,
    height: 30,
  },
  welcomeText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 2,
    fontFamily: 'Poppins-Medium',
  },
  appName: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
    marginBottom: 30,
    paddingHorizontal: 8,
  },
  readySection: {
    marginBottom: 40,
  },
  readyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  checklist: {
    gap: 16,
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    paddingVertical: 30
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  checklistText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  actionQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    marginBottom: 32,
  },
  actionButtons: {
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationButton: {
    backgroundColor: '#E8E8E8',
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  notificationButtonText: {
    fontSize: 13,
    color: '#000000',
    fontFamily: 'Poppins-Regular'
  },
  messageButton: {
    backgroundColor: '#9DAACA',
    shadowColor: '#9DAACA',
  },
  messageButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins-Regular'
  },
  promptsButton: {
    backgroundColor: '#D6C7ED',
    shadowColor: '#D6C7ED',
  },
  promptsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0000000',
    fontFamily: 'Poppins-Regular'
  },
  footerNote: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 24, // Added margin to separate from home button
  },
  homeButton: {
    backgroundColor: '#FCB32B',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FCB32B',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    marginTop: 16, // Added margin to separate from other content
  },
  homeButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  messageTypeModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#3B4F75',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  messageTypeOptions: {
    gap: 12,
  },
  messageTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  messageTypeEmoji: {
    fontSize: 24,
  },
  messageTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});