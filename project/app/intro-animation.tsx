import React, { useEffect, useRef } from "react";
import { StyleSheet, Dimensions, View, Animated } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

export default function IntroAnimationScreen() {
  const router = useRouter();
  const blurAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Start fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Handle animation completion
  const handleAnimationFinish = () => {
    // Start blur transition when animation finishes
    Animated.timing(blurAnim, {
      toValue: 1,
      duration: 800, // 800ms blur transition
      useNativeDriver: true,
    }).start(() => {
      // Navigate after blur completes
      router.replace("/get-started");
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animationContainer,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <LottieView
          ref={lottieRef}
          source={require("../assets/images/animation (1) (1).json")}
          style={styles.lottieAnimation}
          autoPlay={true}
          loop={false}
          onAnimationFinish={handleAnimationFinish}
        />
      </Animated.View>
      
      {/* Blur overlay that animates in */}
      <Animated.View 
        style={[
          styles.blurOverlay,
          {
            opacity: blurAnim,
          }
        ]}
      >
        <BlurView
          intensity={50}
          style={styles.blurView}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",  
        alignItems: "center",
        backgroundColor:"#ffffff"      
      },
      animationContainer: {
        width: width,
        height: height,
        justifyContent: "center",
        alignItems: "center",
      },
      lottieAnimation: {
        width: width,
        height: height,
      },
      blurOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      blurView: {
        flex: 1,
      },
});
