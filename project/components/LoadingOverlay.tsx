import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface LoadingOverlayProps {
  visible: boolean;
}

export default function LoadingOverlay({ visible }: LoadingOverlayProps) {
  const pulseAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Reset fade animation when showing
      fadeAnim.setValue(1);
      
      // Start pulsing animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // Fade out animation when hiding
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, pulseAnim, fadeAnim]);

  // Prevent rendering when overlay is fully faded out and not visible
  const [isFadedOut, setIsFadedOut] = React.useState(false);

  useEffect(() => {
    if (!visible) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsFadedOut(true));
    } else {
      setIsFadedOut(false);
      fadeAnim.setValue(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible && isFadedOut) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.overlay,
        {
          opacity: visible ? 1 : fadeAnim,
        }
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim,
            }
          ]}
        >
          <Image
            source={require('../assets/images/time-capsule.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(51, 65, 85, 0.95)', // Semi-transparent dark background
    zIndex: 9999,
    elevation: 9999,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoImage: {
    width: 120,
    height: 80,
  },
});