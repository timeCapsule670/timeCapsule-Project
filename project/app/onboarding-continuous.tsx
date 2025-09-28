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
} from 'react-native';
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
    image: require('../assets/images/crown.png'),
    title: 'Messages That Grow\nWith Them',
    description: 'Capture your love, wisdom, and support for your child—delivered when they need it most.',
  },
  {
    id: 2,
    image: require('../assets/images/Frame 20.png'),
    title: 'Delivered When It\nMatters Most',
    description: 'Schedule or trigger messages for life\'s big moments—or quiet ones that call for comfort.',
  },
  {
    id: 3,
    image: require('../assets/images/onboarding-3.png'),
    title: 'Stay Connected,\nAlways',
    description: 'Whether it\'s a pep talk, advice, or just a reminder that they\'re loved—your voice will be right there.',
  },
];

export default function OnboardingFlowScreen() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Content transition animations
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(1)).current;

  const currentStep = onboardingSteps[currentStepIndex];
  const isLastStep = currentStepIndex === onboardingSteps.length - 1;

  useEffect(() => {
    // Initial entrance animation
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

  const animateToNextStep = (direction: 'next' | 'back') => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    const exitTranslateX = direction === 'next' ? -width * 0.3 : width * 0.3;
    const enterTranslateX = direction === 'next' ? width * 0.3 : -width * 0.3;

    // Exit animation
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateX, {
        toValue: exitTranslateX,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update step index
      const newIndex = direction === 'next' 
        ? Math.min(currentStepIndex + 1, onboardingSteps.length - 1)
        : Math.max(currentStepIndex - 1, 0);
      
      setCurrentStepIndex(newIndex);
      
      // Reset position for entry animation
      contentTranslateX.setValue(enterTranslateX);
      
      // Entry animation
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(imageScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsTransitioning(false);
      });
    });
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      animateToNextStep('back');
    } else {
      router.push('/create-account');
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  const handleNext = () => {
    if (isLastStep) {
      router.push('/personalize-profile');
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
            opacity: contentOpacity,
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
        {/* Static Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#64748B" strokeWidth={2} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Animated Main Content */}
        <Animated.View 
          style={[
            styles.mainContent,
            {
              opacity: contentOpacity,
              transform: [
                { translateX: contentTranslateX },
                { scale: imageScale },
              ],
            }
          ]}
        >
          {/* Illustration Container */}
          <View style={styles.illustrationContainer}>
            <View style={styles.imageWrapper}>
              {currentStep.id === 1 ? (
                <View style={styles.phoneScreen}>
                  <Image
                    source={currentStep.image}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              ) : currentStep.id === 2 ? (
                <View >
                  <Image
                    source={currentStep.image}
                    style={styles.illustrationImage}
                    resizeMode="contain"
                  />
                  
                </View>
              ) : (
                <Image
                  source={currentStep.image}
                  style={styles.illustrationImage}
                  resizeMode="contain"
                />
              )}
              
              {/* Floating elements overlay */}
              {currentStep.floatingElements && (
                <View >
                  {currentStep.floatingElements.map((element, index) => 
                    renderFloatingElement(element, index)
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <Text style={styles.title}>{currentStep.title}</Text>
            <Text style={styles.description}>{currentStep.description}</Text>
          </View>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {Array.from({ length: onboardingSteps.length }, (_, index) => (
              <View 
                style={[
                  styles.dot,
                  index === currentStepIndex && styles.activeDot,
                ]} 
              />
            ))}
          </View>
        </Animated.View>

        {/* Static Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              isTransitioning && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={isTransitioning}
            activeOpacity={0.9}
          >
            <Text style={styles.nextText}>
              {isLastStep ? 'Get Started' : 'Next'}
            </Text>
            {!isLastStep && (
              <ArrowLeft 
                size={20} 
                color="#ffffff" 
                strokeWidth={2}
                style={styles.nextArrow}
              />
            )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    height: 60,
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
    fontFamily: 'Poppins-Medium',
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
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginTop: 100,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    backgroundColor: '#48277B',
    width: 10,
  },
  footer: {
    paddingBottom: 10,
    height: 80,
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: '#2F3A56',
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
   
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: 'Poppins-SemiBold',
  },
  nextArrow: {
    transform: [{ rotate: '180deg' }],
  },
});