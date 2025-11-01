import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
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
      ]),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStartForFree = () => {
          router.push('/onboarding-continuous');
        // router.push('/profile-setup');
              // router.push('/message-settings'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
      source={require('../assets/images/mom-and-child.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
      >
        {/* Black gradient overlay at the bottom */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,100)']}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.gradientOverlay}
        />
        
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Main Content */}
          <View style={styles.textContent}>
            <Text style={styles.title}>
              Capture Memories{'\n'}That Last Forever
            </Text>
            
            <Text style={styles.description}>
              Send messages, stories, and affirmations to your loved ones—delivered when they need them most.
            </Text>
          </View>

          {/* CTA Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: buttonAnim,
                transform: [
                  {
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartForFree}
              activeOpacity={0.9}
            >
              <Text style={styles.startButtonText}>Start For Free</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '105%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  textContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 50,
    paddingBottom: 10,
    gap: 24,
  },
  title: {
    fontSize: 32,
    color: '#ffffff',
    lineHeight: 48,
    marginBottom: 10,
    fontFamily: 'Poppins-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    color: '#ffffff',
    lineHeight: 27,
    opacity: 0.95,
    fontFamily: 'Poppins-Light',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    paddingBottom: 20,
    paddingTop: 20,
  },
  startButton: {
    backgroundColor: '#4A5B87',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    letterSpacing: 0.5,
    fontFamily: 'Poppins-Regular',
  },
});