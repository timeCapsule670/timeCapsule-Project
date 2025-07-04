import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Image,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { ArrowLeft, Mic, RotateCcw, Play, Pause, Edit3, ArrowRight } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAudioRecorder, useAudioPlayer, AudioModule, RecordingPresets } from 'expo-audio';
import { supabase } from '@/libs/superbase';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  username: string;
}

export default function RecordAudioMessageScreen() {
   const router = useRouter();
  const { childId, promptText, promptTags, promptId } = useLocalSearchParams();
  
  const [child, setChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReRecordModal, setShowReRecordModal] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  // Use expo-audio hooks
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const audioPlayer = useAudioPlayer(recordedUri || '');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const recordButtonScale = useRef(new Animated.Value(1)).current;
  
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchChildData();
    requestAudioPermission();
    
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

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      // Start waveform animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start pulse animation for record button
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      waveAnim.stopAnimation();
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Sync isPlaying state with audioPlayer
  useEffect(() => {
    setIsPlaying(audioPlayer.playing);
  }, [audioPlayer.playing]);

  // Sync isRecording state with audioRecorder
  useEffect(() => {
    setIsRecording(audioRecorder.isRecording);
  }, [audioRecorder.isRecording]);

  // Update audioPlayer source when recordedUri changes
  useEffect(() => {
    if (recordedUri) {
      audioPlayer.replace(recordedUri);
    }
  }, [recordedUri]);

  const fetchChildData = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('actors')
        .select('id, first_name, last_name, date_of_birth, username')
        .eq('id', childId)
        .single();

      if (error) {
        console.error('Error fetching child:', error);
        Alert.alert('Error', 'Failed to load child data. Please try again.');
        return;
      }

      setChild(data);
    } catch (error) {
      console.error('Unexpected error fetching child:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const requestAudioPermission = async () => {
    if (Platform.OS === 'web') {
      setHasPermission(false);
      return;
    }

    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      setHasPermission(status.granted);
      
      if (status.granted) {
        await AudioModule.setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
      }
    } catch (error) {
      console.error('Error requesting audio permission:', error);
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Audio recording is not available on web platform');
      return;
    }

    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant microphone permission to record audio');
      return;
    }

    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setRecordDuration(0);
      
      // Start timer
      recordingTimer.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);

      // Animate record button
      Animated.spring(recordButtonScale, {
        toValue: 1.2,
        useNativeDriver: true,
      }).start();
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      await audioRecorder.stop();
      
      // Get the recorded URI
      if (audioRecorder.uri) {
        setRecordedUri(audioRecorder.uri);
      }

      // Reset record button animation
      Animated.spring(recordButtonScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const playRecordedAudio = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Audio playback is not available on web platform');
      return;
    }

    if (!recordedUri) return;

    try {
      if (isPlaying) {
        audioPlayer.pause();
      } else {
        // Seek to beginning and play
        audioPlayer.seekTo(0);
        audioPlayer.play();
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
      Alert.alert('Error', 'Failed to play audio. Please try again.');
    }
  };

  const stopPlayback = async () => {
    try {
      audioPlayer.pause();
      audioPlayer.seekTo(0);
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  };

  const handleReRecord = () => {
    setShowReRecordModal(true);
  };

  const confirmReRecord = async () => {
    try {
      if (isRecording) {
        await audioRecorder.stop();
      }
      if (isPlaying) {
        audioPlayer.pause();
      }
      
      setRecordedUri(null);
      setRecordDuration(0);
      
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      
      setShowReRecordModal(false);
    } catch (error) {
      console.error('Error during re-record:', error);
      Alert.alert('Error', 'Failed to reset recording. Please try again.');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMessageSettings = () => {
    if (!recordedUri) {
      Alert.alert('No Recording', 'Please record a message before proceeding to settings.');
      return;
    }

    // Navigate to message settings with all necessary parameters
    router.push({
      pathname: '/message-settings',
      params: {
        childId: childId,
        messageType: 'audio',
        recordedUri: recordedUri,
        promptText: promptText || '',
        promptTags: promptTags || '',
        promptId: promptId || '',
      }
    });
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.webNotSupportedContainer}>
          <Text style={styles.webNotSupportedTitle}>Audio Recording Not Available</Text>
          <Text style={styles.webNotSupportedText}>
            Audio recording is only available on mobile devices. Please use the mobile app to record audio messages.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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
        {/* Make scrollable */}
        <View style={{ flex: 1 }}>
          <Animated.ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.headerBackButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <ArrowLeft size={24} color="#374151" strokeWidth={2} />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Record Audio Message</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>
                Let your voice carry the love, guidance, or comfort they may need — today or one day.
              </Text>
            </View>

            {/* Sending To Section */}
            <View style={styles.sendingToSection}>
              <View style={styles.sendingToHeader}>
                <Text style={styles.sendingToTitle}>Sending to</Text>
                <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
                  <Edit3 size={16} color="#6B7280" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.childCard}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg' }}
                  style={styles.childAvatar}
                  resizeMode="cover"
                />
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child?.first_name}</Text>
                  <Text style={styles.childAge}>Age {child ? calculateAge(child.date_of_birth) : 0}</Text>
                </View>
              </View>
            </View>

            {/* Selected Prompt Section */}
            {promptText && (
              <View style={styles.promptSection}>
                <Text style={styles.promptSectionTitle}>Your Selected Prompt</Text>
                <View style={styles.promptCard}>
                  <Text style={styles.promptText}>{promptText}</Text>
                </View>
              </View>
            )}

            {/* Recording Section */}
            <View style={styles.recordingSection}>
              {/* Timer */}
              <Text style={styles.timer}>{formatTime(recordDuration)}</Text>

              {/* Waveform Visual */}
              <View style={styles.waveformContainer}>
                {[...Array(7)].map((_, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.waveformBar,
                      {
                        transform: [{
                          scaleY: isRecording ?
                            waveAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.13, 0.53 + Math.random() * 0.4],
                            }) : 0.13,
                        }],
                        opacity: isRecording ?
                          waveAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1],
                          }) : 0.3,
                      }
                    ]}
                  />
                ))}
              </View>

              {/* Main Record Button */}
              <Animated.View
                style={[
                  styles.recordButtonContainer,
                  {
                    transform: [
                      { scale: recordButtonScale },
                      { scale: pulseAnim },
                    ],
                  }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.recordButton,
                    isRecording && styles.recordButtonActive,
                  ]}
                  onPress={toggleRecording}
                  activeOpacity={0.8}
                >
                  <Mic
                    size={32}
                    color="#ffffff"
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </Animated.View>

              <Text style={styles.recordButtonLabel}>
                {isRecording ? 'Tap to stop recording' :
                  recordedUri ? 'Tap to record again' : 'Tap to start recording'}
              </Text>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.previewButton,
                    !recordedUri && styles.actionButtonDisabled,
                  ]}
                  onPress={isPlaying ? stopPlayback : playRecordedAudio}
                  disabled={!recordedUri}
                  activeOpacity={0.7}
                >
                  {isPlaying ? (
                    <Pause size={20} color={!recordedUri ? "#9CA3AF" : "#6B7280"} strokeWidth={2} />
                  ) : (
                    <Play size={20} color={!recordedUri ? "#9CA3AF" : "#6B7280"} strokeWidth={2} />
                  )}
                  <Text style={[
                    styles.actionButtonText,
                    !recordedUri && styles.actionButtonTextDisabled,
                  ]}>
                    {isPlaying ? 'Stop' : 'Preview'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.ScrollView>

          {/* Message Settings Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.messageSettingsButton,
                !recordedUri && styles.messageSettingsButtonDisabled,
              ]}
              onPress={handleMessageSettings}
              disabled={!recordedUri}
              activeOpacity={0.9}
            >
              <Text style={[
                styles.messageSettingsButtonText,
                !recordedUri && styles.messageSettingsButtonTextDisabled,
              ]}>
                Message Settings
              </Text>
              <ArrowRight size={20} color={!recordedUri ? "#9CA3AF" : "#ffffff"} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Re-record Confirmation Modal */}
      <Modal
        visible={showReRecordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReRecordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Re-record Message?</Text>
            <Text style={styles.modalDescription}>
              This will delete your current recording and you'll need to start over. Are you sure you want to continue?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowReRecordModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmReRecord}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmText}>Re-record</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  webNotSupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  webNotSupportedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  webNotSupportedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'Poppins-Regular',
  },
  backButton: {
    backgroundColor: '#3B4F75',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 30
  },
  headerBackButton: {
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
  descriptionContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  sendingToSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sendingToHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sendingToTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  editButton: {
    padding: 8,
  },
  childCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  childAge: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  promptSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  promptSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  promptCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  promptText: {
    fontSize: 16,
    color: '#6D28D9',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  recordingSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 40,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 2,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 60,
    marginBottom: 40,
    gap: 4,
  },
  waveformBar: {
    width: 4,
    height: 60, // Fixed height - will be scaled using scaleY
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  recordButtonContainer: {
    marginBottom: 16,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: '#DC2626',
  },
  recordButtonLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Poppins-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    minWidth: 100,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  reRecordButton: {
    // Additional styles for re-record button if needed
  },
  previewButton: {
    // Additional styles for preview button if needed
  },
  actionButtonText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  actionButtonTextDisabled: {
    color: '#9CA3AF',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  messageSettingsButton: {
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
  messageSettingsButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  messageSettingsButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  messageSettingsButtonTextDisabled: {
    color: '#ffffff',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-SemiBold',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
});