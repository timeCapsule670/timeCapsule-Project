import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance animation
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

  const handleBack = () => {
    router.push('/onboarding-2');
  };

  const handleSkip = () => {
    router.push('/');
  };

  const handleGetStarted = () => {
    router.push('/child-profile-setup');
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
        {/* Header with Back and Skip buttons */}
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

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Illustration Container */}
          <Animated.View 
            style={[
              styles.illustrationContainer,
              {
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/3990349/pexels-photo-3990349.jpeg' }}
                style={styles.illustrationImage}
                resizeMode="cover"
              />
              
              {/* Floating hearts overlay */}
              <View style={styles.heartsOverlay}>
                <Animated.View 
                  style={[
                    styles.floatingHeart, 
                    styles.heart1,
                    {
                      opacity: fadeAnim,
                      transform: [
                        { scale: scaleAnim },
                        { translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, 10],
                        })}
                      ]
                    }
                  ]}
                >
                  <Text style={styles.heartEmoji}>💝</Text>
                </Animated.View>
                
                <Animated.View 
                  style={[
                    styles.floatingHeart, 
                    styles.heart2,
                    {
                      opacity: fadeAnim,
                      transform: [
                        { scale: scaleAnim },
                        { translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, -5],
                        })}
                      ]
                    }
                  ]}
                >
                  <Text style={styles.heartEmoji}>💕</Text>
                </Animated.View>
                
                <Animated.View 
                  style={[
                    styles.floatingHeart, 
                    styles.heart3,
                    {
                      opacity: fadeAnim,
                      transform: [
                        { scale: scaleAnim },
                        { translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, 8],
                        })}
                      ]
                    }
                  ]}
                >
                  <Text style={styles.heartEmoji}>✨</Text>
                </Animated.View>
              </View>
            </View>
          </Animated.View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <Text style={styles.title}>Stay Connected,{'\n'}Always</Text>
            <Text style={styles.description}>
              Whether it's a pep talk, advice, or just a reminder that they're loved—your voice will be right there.
            </Text>
          </View>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.activeDot]} />
          </View>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          activeOpacity={0.9}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
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
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: width * 0.85,
    height: width * 0.85,
    marginBottom: 40,
    position: 'relative',
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    position: 'relative',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  heartsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  floatingHeart: {
    position: 'absolute',
  },
  heart1: {
    top: '15%',
    right: '10%',
  },
  heart2: {
    top: '25%',
    left: '8%',
  },
  heart3: {
    bottom: '20%',
    right: '15%',
  },
  heartEmoji: {
    fontSize: 24,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    backgroundColor: '#F59E0B',
    width: 24,
  },
  getStartedButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});