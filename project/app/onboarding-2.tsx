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

export default function OnboardingTwoScreen() {
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
    router.push('/onboarding-1');
  };

  const handleSkip = () => {
    router.push('/');
  };

  const handleNext = () => {
    // Trigger swipe left animation
    Animated.timing(swipeAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.push('/onboarding');
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
          handleNext();
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
              <View style={styles.imageWrapper}>


                {/* Phone mockup overlay */}
                <View style={styles.phoneOverlay}>
                  <Image
                    source={require('../assets/images/Frame 20.png')}
                    style={styles.phoneScreen}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </Animated.View>

            {/* Text Content */}
            <View style={styles.textContent}>
              <Text style={styles.title}>Delivered When It{'\n'}Matters Most</Text>
              <Text style={styles.description}>
                Schedule or trigger messages for life's big moments—or quiet ones that call for comfort.
              </Text>
            </View>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
              <View style={styles.dot} />
              <View style={[styles.dot, styles.activeDot]} />
              <View style={styles.dot} />
            </View>
          </View>

          {/* Next Button */}
          <NextButton
            onPress={handleNext}
            text="Next"
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
  imageWrapper: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  phoneOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -120 }, { translateY: -150 }],
    pointerEvents: 'none',
  },
  phoneContainer: {
    width: 240,
    height: 300,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    alignSelf: 'center',

    marginTop: 30,
    marginLeft: 45
  },
  messageContainer: {
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    padding: 12,
    flex: 1,
  },
  messageHeader: {
    marginBottom: 8,
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3730A3',
  },
  messageBody: {
    gap: 4,
  },
  messageText: {
    fontSize: 11,
    color: '#1E1B4B',
    lineHeight: 14,
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
    marginTop: -75
  },
  title: {
    fontSize: 32,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
    marginTop: 5,
    letterSpacing: -0.5,
    fontFamily: 'Poppins-Bold'
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 40,
    marginTop: 190
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    backgroundColor: '#8B5CF6',
    width: 24,
  },
  nextButton: {
    backgroundColor: '#334155',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#334155',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    gap: 8,
  },
  nextText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  nextArrow: {
    transform: [{ rotate: '180deg' }],
  },
});