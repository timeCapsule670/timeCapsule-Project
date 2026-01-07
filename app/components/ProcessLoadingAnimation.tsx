import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Image,
    Text,
    View,
} from "react-native";

export interface LoadingStep {
  id: string;
  text: string;
  source: any;
  type: "pulse" | "lottie";
  duration?: number; // fallback duration if not using lottie finish
}

interface ProcessLoadingAnimationProps {
  steps: LoadingStep[];
  onComplete: () => void;
}

export default function ProcessLoadingAnimation({
  steps,
  onComplete,
}: ProcessLoadingAnimationProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    // Start pulse animation for logo/images
    let pulseAnimation: Animated.CompositeAnimation | null = null;
    if (currentStep.type === "pulse") {
      pulseAnimation = Animated.loop(
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
      );
      pulseAnimation.start();

      // If it's a pulse step, it needs a duration to move forward
      const timer = setTimeout(() => {
        advanceStep();
      }, currentStep.duration || 3000);

      return () => {
        pulseAnimation?.stop();
        clearTimeout(timer);
      };
    } else if (currentStep.type === "lottie") {
      // For lottie, we might wait for onAnimationFinish or a timer
      if (!currentStep.duration) {
         // If no duration is provided, we'll rely on onAnimationFinish
         // (Handled by LottieView component below)
      } else {
        const timer = setTimeout(() => {
          advanceStep();
        }, currentStep.duration);
        return () => clearTimeout(timer);
      }
    }
  }, [currentStepIndex]);

  const advanceStep = () => {
    // Fade out current step
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        // Fade in next step
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        onComplete();
      }
    });
  };

  const handleLottieFinish = () => {
    if (currentStep.type === "lottie" && !currentStep.duration) {
      // Small delay after lottie finishes before advancing
      setTimeout(advanceStep, 500);
    }
  };

  return (
    <View style={{ flex: 1 }} className="flex-1 bg-white items-center justify-center">
      <Animated.View
        className="items-center justify-center w-full px-10"
        style={{ opacity: fadeAnim }}
      >
        <View className="items-center justify-center mb-10 h-[250px] w-full">
          {currentStep.type === "pulse" ? (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Image
                source={currentStep.source}
                className="w-[150px] h-[150px]"
                resizeMode="contain"
              />
            </Animated.View>
          ) : (
            <LottieView
              ref={lottieRef}
              source={currentStep.source}
              style={{ width: 250, height: 250 }}
              autoPlay
              loop={!!currentStep.duration}
              onAnimationFinish={handleLottieFinish}
            />
          )}
        </View>

        <Text
          style={{ fontFamily: "Poppins_500Medium" }}
          className="text-[20px] text-black text-center mt-10 leading-8"
        >
          {currentStep.text}
        </Text>
      </Animated.View>
    </View>
  );
}

