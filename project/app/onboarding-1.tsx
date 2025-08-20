import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import HeaderButtons from '@/components/HeaderButtons';
import NextButton from '@/components/NextButton';

const { width, height } = Dimensions.get('window');

export default function OnboardingOneScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const imageSlideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entrance animation with sliding effects
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(imageSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBack = () => {
    router.push('/create-account');
  };

  const handleSkip = () => {
    router.push('/');
  };

  const handleNext = () => {
    router.push('/onboarding-2');
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
                transform: [{ translateY: imageSlideAnim }],
              }
            ]}
          >
            <View style={styles.imageWrapper}>
              <Image
                source={require('../assets/images/crown.png')}
                style={styles.phoneScreen}
                resizeMode="contain"
              />

              {/* Floating elements overlay */}
              
            </View>
          </Animated.View>

          {/* Text Content */}
          <Animated.View
            style={[
              styles.textContent,
              {
                transform: [{ translateX: slideAnim }],
              }
            ]}
          >
            <Text style={styles.title}>Messages That Grow{'\n'}With Them</Text>
            <Text style={styles.description}>
              Capture your love, wisdom, and support for your child—delivered when they need it most.
            </Text>
          </Animated.View>

          {/* Pagination Dots */}
          <Animated.View
            style={[
              styles.pagination,
              {
                transform: [{ translateX: slideAnim }],
              }
            ]}
          >
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </Animated.View>
        </View>

        {/* Next Button */}
        <NextButton
          onPress={handleNext}
          text="Next"
        />
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
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  nextButton: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    color: '#1C2333',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
    fontFamily: 'Poppins-Bold',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
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

    phoneScreen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    alignSelf: 'center',

    marginTop: 30,
    marginLeft: 20
  },
});