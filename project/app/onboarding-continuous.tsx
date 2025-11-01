import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
  Image,
  ImageBackground,
} from 'react-native';
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  image: any;
  title: string;
  description: string;
  floatingElements?: Array<{
    emoji: string;
    position: { top?: string; bottom?: string; left?: string; right?: string };
    delay: number;
  }>;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    image: require('../assets/images/mother.png'),
    title: "Start Simple: Record or Upload a Memory",
    description: "Save audio, video, text, or photos with TimeCapsule—each memory a treasure for the future."
  },
  {
    id: 2,
    image: require('../assets/images/smiling.png'),
    title: 'Every Memory Tells a Story',
    description: 'Add meaning with words, voice, or video. Share thoughts and stories so loved ones feel your presence, even years from now.',
  },
  {
    id: 3,
    image: require('../assets/images/prompt.png'),
    title: 'Prompts to Inspire',
    description: 'Get questions and affirmations to spark stories. Share traditions, encouragement, or special “Open When” moments.',
  },
  {
    id: 4,
    image: require('../assets/images/father-son.png'),
    title: 'Messages That Grow With Your Child',
    description: 'Create lasting moments by scheduling messages for birthdays, milestones, or ‘just because’ days—delivered exactly when they matter most.',
  },
];

export default function OnboardingFlowScreen() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const currentStep = onboardingSteps[currentStepIndex];
  const isLastStep = currentStepIndex === onboardingSteps.length - 1;

  // Preload all images
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imageAssets = onboardingSteps.map(step => step.image);
        await Asset.loadAsync(imageAssets);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        setImagesLoaded(true); // Continue even if preloading fails
      }
    };
    
    preloadImages();
  }, []);


  const animateToNextStep = (direction: 'next' | 'back') => {
    // Update step index directly without animation
    const newIndex = direction === 'next' 
      ? Math.min(currentStepIndex + 1, onboardingSteps.length - 1)
      : Math.max(currentStepIndex - 1, 0);
    
    setCurrentStepIndex(newIndex);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      animateToNextStep('back');
    } else {
      router.push('/get-started');
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  const handleNext = () => {
    if (isLastStep) {
      router.push('/create-account');
    } else {
      animateToNextStep('next');
    }
  };

  const renderFloatingElement = (element: any, index: number) => {
    const floatAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleFloatAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const startFloatingAnimation = () => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(floatAnim, {
                toValue: 1,
                duration: 2000 + Math.random() * 1000,
                useNativeDriver: true,
              }),
              Animated.timing(floatAnim, {
                toValue: 0,
                duration: 2000 + Math.random() * 1000,
                useNativeDriver: true,
              }),
            ]),
            Animated.loop(
              Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000 + Math.random() * 2000,
                useNativeDriver: true,
              })
            ),
            Animated.loop(
              Animated.sequence([
                Animated.timing(scaleFloatAnim, {
                  toValue: 1.1,
                  duration: 1500 + Math.random() * 1000,
                  useNativeDriver: true,
                }),
                Animated.timing(scaleFloatAnim, {
                  toValue: 0.9,
                  duration: 1500 + Math.random() * 1000,
                  useNativeDriver: true,
                }),
              ])
            ),
          ])
        ).start();
      };

      const timeout = setTimeout(startFloatingAnimation, element.delay);
      return () => clearTimeout(timeout);
    }, [currentStepIndex]);

    return (
      <Animated.View
        key={`${currentStepIndex}-${index}`}
        style={[
          
          element.position,
          {
           
            transform: [
              {
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
              {
                translateX: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.random() * 10 - 5],
                }),
              },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
              { scale: scaleFloatAnim },
            ],
          },
        ]}
      >
   
      </Animated.View>
    );
  };

  if (!imagesLoaded) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      </View>
    );
  }

  return (
    <View style={styles.container}>
     <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.content}>
        {/* Main Content - All steps use full background styling */}
        <View style={styles.fullScreenContent}>
          <ImageBackground
            source={currentStep.image}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.fullScreenBackButton} 
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color="#ffffff" strokeWidth={2} />
            </TouchableOpacity>

            {/* Skip Button */}
            <TouchableOpacity 
              style={styles.fullScreenSkipButton} 
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.fullScreenSkipText,
                currentStep.id === 2 && styles.fullScreenSkipTextBlack
              ]}>Skip</Text>
            </TouchableOpacity>

            {/* Black gradient overlay at the bottom */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,1)']}
              locations={[0.5, 0.939]}
              style={styles.gradientOverlay}
            />
            
            {/* Floating elements overlay */}
            {currentStep.floatingElements && (
              <View style={styles.floatingElementsContainer}>
                {currentStep.floatingElements.map((element, index) => 
                  renderFloatingElement(element, index)
                )}
              </View>
            )}

            {/* Text Content */}
            <View style={styles.fullScreenTextContent}>
              <Text style={styles.fullScreenTitle}>{currentStep.title}</Text>
              <Text style={styles.fullScreenDescription}>{currentStep.description}</Text>
              
              {/* Next Button */}
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.9}
              >
                <Text style={styles.nextText}>
                  {isLastStep ? 'Get Started' : 'Next'}
                </Text>
                
              </TouchableOpacity>
            </View>

          </ImageBackground>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    height: 60,
  },

  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: width * 0.85,
    height: width * 0.85,
    marginBottom: 10,
    position: 'relative',
  },
  imageWrapper: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  illustrationImage: {
    width: 300,
    height: 300,
    marginLeft: 20,
    borderRadius: 24,
  },
  phoneScreen: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginLeft: 20,
  },
  logoImage: {
    width: 256,
    height: 232.663,
  },
 
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: -30,
    gap: 24,
  },
  title: {
    fontSize: 32,
    color: '#1C2333',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 24,
    letterSpacing: -0.5,
    fontFamily: 'Poppins-Bold',
  },
  description: {
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 10,
    fontFamily: 'Poppins-Regular',
  },
  nextButton: {
    backgroundColor: '#4A5B87',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  nextText: {
    color: '#ffffff',
    fontSize: 18,
    letterSpacing: 0.5,
    fontFamily: 'Poppins-Regular',
  },
  nextArrow: {
    transform: [{ rotate: '180deg' }],
  },
  // Full screen background styles for step 1
  fullScreenContent: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '105%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -40,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -40,
  },
  floatingElementsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullScreenTextContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 100,
    justifyContent: 'flex-end',
    gap: 15,
  },
  fullScreenTitle: {
    fontSize: 32,
    color: '#ffffff',
    lineHeight: 48,
    marginBottom: 0,
    fontFamily: 'Poppins-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  fullScreenDescription: {
    fontSize: 18,
    color: '#ffffff',
    lineHeight: 27,
    opacity: 0.95,
    fontFamily: 'Poppins-Light',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  fullScreenBackButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
   
    borderRadius: 20,
    zIndex: 10,
  },
  fullScreenBackText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  fullScreenSkipButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
   
    borderRadius: 20,
    zIndex: 10,
  },
  fullScreenSkipText: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Poppins-Medium',
  },
  fullScreenSkipTextBlack: {
    color: '#000000',
  },
});