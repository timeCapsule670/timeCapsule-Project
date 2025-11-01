import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

interface LoadingAnimationProps {
  onComplete?: () => void;
  duration?: number; // Total duration in milliseconds
  showSuccess?: boolean;
}

const loadingMessages = [
  "Creating Your Account",
  "Saving your first memory space", 
  "Preparing your timeline",
  "Making space for future messages",
  "Your TimeCapsule is almost ready"
];

export default function LoadingAnimation({ 
  onComplete, 
  duration = 8000, 
  showSuccess = true 
}: LoadingAnimationProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const lottieRef = useRef<LottieView>(null);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoFadeAnim = useRef(new Animated.Value(1)).current;
  const messageFadeAnim = useRef(new Animated.Value(1)).current;
  const successFadeAnim = useRef(new Animated.Value(0)).current;
  const successScaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Start fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Message rotation logic
    const messageInterval = duration / (loadingMessages.length + (showSuccess ? 1 : 0));
    
    const messageTimer = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => {
        if (prevIndex < loadingMessages.length - 1) {
          return prevIndex + 1;
        } else {
          // All messages shown, show success animation
          if (showSuccess) {
            setShowSuccessAnimation(true);
            Animated.parallel([
              // Fade out logo and messages
              Animated.timing(logoFadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(messageFadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
              // Show success animation
              Animated.timing(successFadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.spring(successScaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
              }),
            ]).start(() => {
              // Trigger Lottie animation after fade-in completes
              setTimeout(() => {
                lottieRef.current?.play();
              }, 100);
            });
          }
          return prevIndex;
        }
      });
    }, messageInterval);

    // Don't auto-complete if showing success animation
    let completeTimer: NodeJS.Timeout | null = null;
    if (!showSuccess) {
      completeTimer = setTimeout(() => {
        onComplete?.();
      }, duration);
    }

    return () => {
      clearInterval(messageTimer);
      if (completeTimer) {
        clearTimeout(completeTimer);
      }
      pulseAnimation.stop();
    };
  }, [duration, showSuccess, onComplete, hasNavigated]);

  const handleSuccessAnimationFinish = () => {
    // Allow Lottie animation to play for 5 seconds before navigating
    setTimeout(() => {
      if (!hasNavigated) {
        setHasNavigated(true);
        onComplete?.();
      }
    }, 5000);
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        {/* Logo and Loading Messages Container */}
        <View style={styles.logoAndMessageContainer}>
          {/* Logo with pulse animation */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: pulseAnim }],
                opacity: logoFadeAnim,
              },
            ]}
          >
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Loading messages */}
          <Animated.View
            style={[
              styles.messageContainer,
              {
                opacity: messageFadeAnim,
              },
            ]}
          >
            <Text style={styles.loadingMessage}>
              {loadingMessages[currentMessageIndex]}
            </Text>
          </Animated.View>
        </View>

        {/* Success animation - positioned in same location */}
        {showSuccessAnimation && (
          <Animated.View
            style={[
              styles.logoAndMessageContainer,
              {
                opacity: successFadeAnim,
                position: 'absolute',
              },
            ]}
          >
            <Animated.View 
              style={[
                styles.successIconContainer,
                {
                  transform: [{ scale: successScaleAnim }],
                },
              ]}
            >
              <LottieView
                ref={lottieRef}
                source={require('../assets/images/success.json')}
                style={styles.lottieAnimation}
                autoPlay={false}
                loop={false}
                onAnimationFinish={handleSuccessAnimationFinish}
              />
            </Animated.View>
            <Text style={styles.successText}>Welcome to TimeCapsule!</Text>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoAndMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  messageContainer: {
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  loadingMessage: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  successIconContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  successText: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#000000',
    textAlign: 'center',
  },
});
