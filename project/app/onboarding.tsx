import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import HeaderButtons from '@/components/HeaderButtons';
import NextButton from '@/components/NextButton';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
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
    ]).start();
  }, []);

  const handleBack = () => {
    router.push('/onboarding-2');
  };

  const handleSkip = () => {
    router.push('/');
  };

  const handleGetStarted = () => {
    // Trigger swipe left animation
    Animated.timing(swipeAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.push('/personalize-profile');
    });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      swipeAnim.setValue(event.translationX);
    })
    .onEnd((event) => {
      if (event.translationX < -100) {
        // Swipe left - go to next screen
        Animated.timing(swipeAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          handleGetStarted();
        });
      } else if (event.translationX > 100) {
        // Swipe right - go to previous screen
        Animated.timing(swipeAnim, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          handleBack();
        });
      } else {
        // Reset position
        Animated.spring(swipeAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { translateX: swipeAnim }
              ],
            }
          ]}
        >
          {/* Header with Back and Skip buttons */}
          <HeaderButtons
            onBack={handleBack}
            onSkip={handleSkip}
            backText="Back"
            skipText="Skip"
          />
          

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Illustration Container */}
            <Animated.View
              style={[
                styles.illustrationContainer,
                {
                  transform: [{ scale: scaleAnim }],
                }
              ]}
            >
              <View>
                <Image
                  source={require('../assets/images/onboarding-3.png')}
                  style={styles.illustrationImage}
                  resizeMode="contain"
                />

                {/* Floating hearts overlay */}

              </View>
            </Animated.View>

            {/* Text Content */}
            <View style={styles.textContent}>
              <Text style={styles.title}>Stay Connected,{'\n'}Always</Text>
              <Text style={styles.description}>
                Whether it's a pep talk, advice, or just a reminder that they're loved—your voice will be right there.
              </Text>
            </View>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={[styles.dot, styles.activeDot]} />
            </View>
          </View>

          {/* Get Started Button */}
          <NextButton
            onPress={handleGetStarted}
            text="Get Started"
            variant="secondary"
          />
        </Animated.View>
      </GestureDetector>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    color: '#64748B',
    marginLeft: 8,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: width * 0.85,
    height: width * 0.85,
    marginBottom: 40,
    position: 'relative',
  },

  illustrationImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  heartsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  floatingHeart: {
    position: 'absolute',
  },
  heart1: {
    top: '15%',
    right: '10%',
  },
  heart2: {
    top: '25%',
    left: '8%',
  },
  heart3: {
    bottom: '20%',
    right: '15%',
  },
  heartEmoji: {
    fontSize: 24,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    color: '#1C2333',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
    letterSpacing: -0.5,
    fontFamily: 'Poppins-Bold',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
    fontFamily: 'Poppins-Regular',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    backgroundColor: '#F59E0B',
    width: 24,
  },
  getStartedButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});