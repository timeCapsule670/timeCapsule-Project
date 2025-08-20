import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

interface OnboardingAnimationProps {
  children: React.ReactNode;
  delay?: number;
}

export default function OnboardingAnimation({ 
  children, 
  delay = 0 
}: OnboardingAnimationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const imageSlideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Staggered entrance animation with sliding effects
    const timer = setTimeout(() => {
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
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}

// Export individual animation values for custom usage
export const useOnboardingAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const imageSlideAnim = useRef(new Animated.Value(50)).current;

  const startAnimations = (delay = 0) => {
    const timer = setTimeout(() => {
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
    }, delay);

    return () => clearTimeout(timer);
  };

  return {
    fadeAnim,
    slideAnim,
    imageSlideAnim,
    startAnimations,
  };
};
