import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function ResetPasswordSuccessScreen() {
  const router = useRouter();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  
  // Ribbon animation refs
  const ribbon1 = useRef(new Animated.Value(0)).current;
  const ribbon2 = useRef(new Animated.Value(0)).current;
  const ribbon3 = useRef(new Animated.Value(0)).current;
  const ribbon4 = useRef(new Animated.Value(0)).current;
  const ribbon5 = useRef(new Animated.Value(0)).current;
  const ribbon6 = useRef(new Animated.Value(0)).current;
  const ribbon7 = useRef(new Animated.Value(0)).current;
  const ribbon8 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.sequence([
      // Fade in and slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Scale in the circle
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      // Draw the checkmark
      Animated.timing(checkmarkAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start();

    // Start ribbon animations with delays
    const startRibbonAnimation = (animValue: Animated.Value, delay: number) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    };

    // Start each ribbon with different delays
    startRibbonAnimation(ribbon1, 800);
    startRibbonAnimation(ribbon2, 1000);
    startRibbonAnimation(ribbon3, 1200);
    startRibbonAnimation(ribbon4, 1400);
    startRibbonAnimation(ribbon5, 1600);
    startRibbonAnimation(ribbon6, 1800);
    startRibbonAnimation(ribbon7, 2000);
    startRibbonAnimation(ribbon8, 2200);
  }, []);

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const AnimatedCheckmark = () => {
    const AnimatedPath = Animated.createAnimatedComponent(Path);
    
    return (
      <Svg width="60" height="60" viewBox="0 0 60 60">
        <AnimatedPath
          d="M15 30 L25 40 L45 20"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray="50"
          strokeDashoffset={checkmarkAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          })}
        />
      </Svg>
    );
  };

  const renderRibbon = (animValue: Animated.Value, style: any, color: string, shape: 'rect' | 'circle' | 'star') => {
    const translateX = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, Math.random() * 20 - 10, Math.random() * 30 - 15],
    });

    const translateY = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, Math.random() * 15 - 7.5, Math.random() * 20 - 10],
    });

    const rotate = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', `${Math.random() * 360}deg`],
    });

    const scale = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.2, 0.8],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.7, 1, 0.6],
    });

    if (shape === 'circle') {
      return (
        <Animated.View
          key={`ribbon-${Math.random()}`}
          style={[
            styles.ribbon,
            style,
            {
              backgroundColor: color,
              borderRadius: 15,
              transform: [
                { translateX },
                { translateY },
                { rotate },
                { scale },
              ],
              opacity,
            },
          ]}
        />
      );
    } else if (shape === 'star') {
      return (
        <Animated.View
          key={`ribbon-${Math.random()}`}
          style={[
            styles.ribbon,
            styles.starRibbon,
            style,
            {
              backgroundColor: color,
              transform: [
                { translateX },
                { translateY },
                { rotate },
                { scale },
              ],
              opacity,
            },
          ]}
        />
      );
    } else {
      return (
        <Animated.View
          key={`ribbon-${Math.random()}`}
          style={[
            styles.ribbon,
            style,
            {
              backgroundColor: color,
              borderRadius: 4,
              transform: [
                { translateX },
                { translateY },
                { rotate },
                { scale },
              ],
              opacity,
            },
          ]}
        />
      );
    }
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
        {/* Success Animation Container */}
        <View style={styles.animationContainer}>
          {/* Floating Ribbons */}
          <View style={styles.ribbonsContainer}>
            {/* Top ribbons */}
            {renderRibbon(ribbon1, { top: 50, left: 80 }, '#3B82F6', 'rect')}
            {renderRibbon(ribbon2, { top: 80, right: 100 }, '#10B981', 'circle')}
            {renderRibbon(ribbon3, { top: 120, right: 60 }, '#EC4899', 'rect')}
            
            {/* Side ribbons */}
            {renderRibbon(ribbon4, { top: 180, left: 40 }, '#6366F1', 'star')}
            {renderRibbon(ribbon5, { top: 200, right: 40 }, '#F59E0B', 'star')}
            {renderRibbon(ribbon6, { top: 240, left: 60 }, '#EF4444', 'circle')}
            
            {/* Bottom ribbons */}
            {renderRibbon(ribbon7, { bottom: 100, left: 90 }, '#F59E0B', 'star')}
            {renderRibbon(ribbon8, { bottom: 80, right: 80 }, '#10B981', 'rect')}
          </View>

          {/* Success Circle with Checkmark */}
          <Animated.View
            style={[
              styles.successCircle,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <AnimatedCheckmark />
          </Animated.View>
        </View>

        {/* Success Message */}
        <Text style={styles.successMessage}>
          Your password has been reset successfully.
        </Text>

        {/* Sign In Button */}
        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleSignIn}
          activeOpacity={0.9}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    position: 'relative',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  ribbonsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  ribbon: {
    position: 'absolute',
    width: 20,
    height: 8,
  },
  starRibbon: {
    width: 16,
    height: 16,
    transform: [{ rotate: '45deg' }],
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 80,
    paddingHorizontal: 32,
    fontFamily: 'Poppins-Regular',
  },
  signInButton: {
    backgroundColor: '#2F3A56',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '100%',
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});