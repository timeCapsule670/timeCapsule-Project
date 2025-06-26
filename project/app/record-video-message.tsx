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
import { ArrowLeft, Edit3, Video as VideoIcon, ArrowRight, RotateCcw, Play, Pause, X } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Video } from 'expo-av';
import { supabase } from '@/libs/superbase';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  username: string;
}

export default function RecordVideoMessageScreen() {
  const router = useRouter();
  const { childId, promptText, promptTags, promptId } = useLocalSearchParams();

  const [showOverlayText, setShowOverlayText] = useState(true);

  const [child, setChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isPlayingPlayback, setIsPlayingPlayback] = useState(false);
  const [showReRecordModal, setShowReRecordModal] = useState(false);

  // Refs
  const cameraRef = useRef<CameraView>(null);
  const videoPlayerRef = useRef<Video>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchChildData();

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
    ]).start();

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
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
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      setShowOverlayText(false);
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

      // Start recording
      const video = await cameraRef.current.recordAsync();
      if (video) {
        setRecordedUri(video.uri);
      }

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(false);
      setShowOverlayText(true);

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      // Reset record button animation
      Animated.spring(recordButtonScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      // Stop recording
      cameraRef.current.stopRecording();

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

  const playRecordedVideo = async () => {
    if (!videoPlayerRef.current || !recordedUri) return;

    try {
      setIsPlayingPlayback(true);
      await videoPlayerRef.current.playAsync();
    } catch (error) {
      console.error('Failed to play video:', error);
      Alert.alert('Error', 'Failed to play video. Please try again.');
    }
  };

  const stopPlayback = async () => {
    if (!videoPlayerRef.current) return;

    try {
      await videoPlayerRef.current.pauseAsync();
      setIsPlayingPlayback(false);
    } catch (error) {
      console.error('Failed to stop video:', error);
    }
  };

  const handleReRecord = () => {
    setShowReRecordModal(true);
  };

  const confirmReRecord = async () => {
    try {
      if (videoPlayerRef.current) {
        await videoPlayerRef.current.unloadAsync();
      }

      setRecordedUri(null);
      setIsRecording(false);
      setIsPlayingPlayback(false);
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

  const handleMessageSettings = () => {
    if (!recordedUri) {
      Alert.alert('No Recording', 'Please record a video message before proceeding to settings.');
      return;
    }

    // Navigate to message settings with all necessary parameters
    router.push({
      pathname: '/message-settings',
      params: {
        childId: childId,
        messageType: 'video',
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

  const handleEditRecipient = () => {
    Alert.alert('Edit Recipient', 'Navigate back to recipient selection');
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

            <Text style={styles.headerTitle}>Record Video Message</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.webNotSupportedContainer}>
            <Animated.View
              style={[
                styles.webNotSupportedIcon,
                {
                  transform: [{ scale: scaleAnim }],
                }
              ]}
            >
              <VideoIcon size={48} color="#EF4444" strokeWidth={2} />
            </Animated.View>

            <Text style={styles.webNotSupportedTitle}>Video Recording Not Available</Text>
            <Text style={styles.webNotSupportedText}>
              Video recording with camera access is only available on mobile devices. Please use the mobile app to record video messages for the best experience.
            </Text>

            <TouchableOpacity style={styles.backToHomeButton} onPress={handleBack}>
              <Text style={styles.backToHomeButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading camera permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
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

            <Text style={styles.headerTitle}>Record Video Message</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Permission Request */}
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionDescription}>
              To record video messages, we need access to your camera and microphone.
            </Text>

            <TouchableOpacity
              style={styles.enablePermissionsButton}
              onPress={requestPermission}
              activeOpacity={0.8}
            >
              <VideoIcon size={24} color="#ffffff" strokeWidth={2} />
              <Text style={styles.enablePermissionsButtonText}>
                Enable Camera & Microphone
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        {/* Camera View or Video Playback */}
        <View style={styles.cameraContainer}>
          {recordedUri ? (
            // Video Playback View
            <Video
              ref={videoPlayerRef}
              style={styles.videoPlayer}
              source={{ uri: recordedUri }}
              useNativeControls={false}
              resizeMode="cover"
              isLooping={false}
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded && status.didJustFinish) {
                  setIsPlayingPlayback(false);
                }
              }}
            />
          ) : (
            // Live Camera View
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
              mode="video"
            />
          )}

          {/* Overlay Controls */}
          <View style={styles.overlayContainer}>
            {/* Header Overlay */}
            {showOverlayText && !isRecording && (
              <>
                {/* Header Overlay */}
                <View style={styles.headerOverlay}>
                  <TouchableOpacity
                    style={styles.overlayBackButton}
                    onPress={handleBack}
                    activeOpacity={0.7}
                  >
                    <ArrowLeft size={24} color="#ffffff" strokeWidth={2} />
                  </TouchableOpacity>

                  <Text style={styles.overlayTitle}>Record Video Message</Text>
                  <View style={styles.headerSpacer} />
                </View>

                {/* Description */}
                <View style={styles.descriptionOverlay}>
                  <Text style={styles.overlayDescription}>
                    It doesn't have to be perfect — just real. Your child will treasure hearing from you.
                  </Text>
                </View>

                {/* Sending To Section */}
                <View style={styles.sendingToOverlay}>
                  <View style={styles.sendingToHeader}>
                    <Text style={styles.sendingToTitle}>Sending To</Text>
                    <TouchableOpacity
                      style={styles.editOverlayButton}
                      onPress={handleEditRecipient}
                      activeOpacity={0.7}
                    >
                      <Edit3 size={16} color="#ffffff" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.childOverlayCard}>
                    <Image
                      source={{ uri: 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg' }}
                      style={styles.childOverlayAvatar}
                      resizeMode="cover"
                    />
                    <View style={styles.childOverlayInfo}>
                      <Text style={styles.childOverlayName}>{child?.first_name}</Text>
                      <Text style={styles.childOverlayAge}>Age {child ? calculateAge(child.date_of_birth) : 0}</Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              {/* Timer */}
              <Text style={styles.timer}>{formatTime(recordDuration)}</Text>

              {/* Recording Controls */}
              <View style={styles.recordingControls}>
                {recordedUri ? (
                  // Post-recording controls
                  <View style={styles.postRecordingControls}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={handleReRecord}
                      activeOpacity={0.7}
                    >
                      <RotateCcw size={24} color="#ffffff" strokeWidth={2} />
                      <Text style={styles.controlButtonText}>Re-record</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={isPlayingPlayback ? stopPlayback : playRecordedVideo}
                      activeOpacity={0.7}
                    >
                      {isPlayingPlayback ? (
                        <Pause size={24} color="#ffffff" strokeWidth={2} />
                      ) : (
                        <Play size={24} color="#ffffff" strokeWidth={2} />
                      )}
                      <Text style={styles.controlButtonText}>
                        {isPlayingPlayback ? 'Pause' : 'Preview'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Recording button
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
                      <VideoIcon
                        size={32}
                        color="#ffffff"
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>

              <Text style={styles.recordButtonLabel}>
                {recordedUri ? 'Video recorded successfully' :
                  isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
              </Text>
            </View>
          </View>
        </View>

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
            <Text style={styles.modalTitle}>Re-record Video?</Text>
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
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  permissionDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'Poppins-Regular',
  },
  enablePermissionsButton: {
    backgroundColor: '#3B4F75',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
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
  enablePermissionsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  videoPlayer: {
    flex: 1,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  overlayBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  descriptionOverlay: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  overlayDescription: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  sendingToOverlay: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sendingToHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sendingToTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  editOverlayButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  childOverlayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  childOverlayAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  childOverlayInfo: {
    flex: 1,
  },
  childOverlayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
    fontFamily: 'Poppins-SemiBold',
  },
  childOverlayAge: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Poppins-Regular',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  timer: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 30,
    fontFamily: 'Poppins-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  recordingControls: {
    alignItems: 'center',
    marginBottom: 16,
  },
  recordButtonContainer: {
    marginBottom: 16,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: '#DC2626',
  },
  postRecordingControls: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 16,
  },
  controlButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 80,
  },
  controlButtonText: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 8,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  recordButtonLabel: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: '#ffffff',
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
  webNotSupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  webNotSupportedIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#FECACA',
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
  backToHomeButton: {
    backgroundColor: '#3B4F75',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#3B4F75',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  backToHomeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
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