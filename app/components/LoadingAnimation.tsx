import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Image,
    Text,
    View,
} from "react-native";

interface LoadingAnimationProps {
  onComplete?: () => void;
  duration?: number;
  showSuccess?: boolean;
  messages?: string[];
  successMessage?: string;
}

const defaultMessages = [
  "Creating Your Account",
  "Saving your first memory space",
  "Preparing your timeline",
  "Making space for future messages",
  "Your TimeCapsule is almost ready",
];

export default function LoadingAnimation({
  onComplete,
  duration = 8000,
  showSuccess = true,
  messages = defaultMessages,
  successMessage = "Welcome to TimeCapsule!",
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
    const messageInterval = duration / (messages.length + (showSuccess ? 1 : 0));

    const messageTimer = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => {
        if (prevIndex < messages.length - 1) {
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
              // Use a slightly longer delay to ensure the component is mounted and visible
              setTimeout(() => {
                if (lottieRef.current) {
                  lottieRef.current.reset();
                  lottieRef.current.play();
                }
              }, 200);
            });
          } else {
             // If no success animation, complete now
             onComplete?.();
          }
          return prevIndex;
        }
      });
    }, messageInterval);

    return () => {
      clearInterval(messageTimer);
      pulseAnimation.stop();
    };
  }, [duration, showSuccess, messages.length]);

  const handleSuccessAnimationFinish = () => {
    // Allow Lottie animation to play for a bit before calling onComplete
    setTimeout(() => {
      if (!hasNavigated) {
        setHasNavigated(true);
        onComplete?.();
      }
    }, 2000);
  };

  return (
    <View style={{ flex: 1 }} className="bg-white items-center justify-center">
      <Animated.View
        className="items-center justify-center"
        style={{ opacity: fadeAnim }}
      >
        {/* Logo and Loading Messages Container */}
        <View className="items-center justify-center">
          {/* Logo with pulse animation */}
          <Animated.View
            className="mb-5"
            style={{
              transform: [{ scale: pulseAnim }],
              opacity: logoFadeAnim,
            }}
          >
            <Image
              source={require("../../assets/images/logo.png")}
              className="w-[120px] h-[120px]"
              resizeMode="contain"
            />
          </Animated.View>

          {/* Loading messages */}
          <Animated.View
            className="items-center justify-center min-h-[80px]"
            style={{ opacity: messageFadeAnim }}
          >
            <Text
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-[18px] text-black text-center mb-5 px-10 leading-6"
            >
              {messages[currentMessageIndex]}
            </Text>
          </Animated.View>
        </View>

        {/* Success animation - positioned in same location */}
        {showSuccessAnimation && (
          <Animated.View
            className="items-center justify-center absolute inset-0"
            style={{ opacity: successFadeAnim }}
          >
            <Animated.View
              className="mb-5"
              style={{ transform: [{ scale: successScaleAnim }] }}
            >
              <LottieView
                ref={lottieRef}
                source={require("../../assets/images/success.json")}
                style={{ width: 200, height: 200 }}
                autoPlay={false}
                loop={false}
                onAnimationFinish={handleSuccessAnimationFinish}
              />
            </Animated.View>
            <Text
              style={{ fontFamily: "Poppins_700Bold" }}
              className="text-[20px] text-black text-center"
            >
              {successMessage}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

