import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MessageSuccessScreen() {
  const router = useRouter();
  const { childName, messageType } = useLocalSearchParams();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleViewInVault = () => {
    router.replace('/(tabs)/vault');
  };

  const handleCreateAnother = () => {
    router.replace('/create-message');
  };

  const handleGoHome = () => {
    router.replace('/(tabs)');
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
          },
        ]}
      >
        <Animated.View
          style={[
            styles.illustrationContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
         
        </Animated.View>

        <View style={styles.messageContainer}>
          <Text style={styles.title}>That was a powerful thing you just did.</Text>
          <Text style={styles.subtitle}>One day, this may mean everything to them.</Text>
        </View>

        <View style={styles.confirmationCard}>
          <View style={styles.confirmationHeader}>
            <View style={styles.iconCircle}>
              <Lock size={24} color="#22C55E" strokeWidth={2} />
            </View>
            <Text style={styles.confirmationTitle}>Your message is saved!</Text>
          </View>
          <Text style={styles.confirmationText}>
            It's now stored securely in your Vault, ready to unlock at just the right moment.
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.vaultButton]}
            onPress={handleViewInVault}
            activeOpacity={0.8}
          >
            <Text style={styles.vaultButtonText}>View in Vault</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.createButton]}
            onPress={handleCreateAnother}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>Create Another Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.homeButton]}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Home</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  illustrationImage: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
  },
  heartContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  heart: {
    fontSize: 24,
    position: 'absolute',
  },
  heart1: {
    top: 20,
    left: 40,
  },
  heart2: {
    top: 40,
    right: 30,
  },
  heart3: {
    bottom: 60,
    left: 50,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  confirmationCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#22C55E',
    borderStyle: 'dashed',
    marginBottom: 32,
  },
  confirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Poppins-Bold',
  },
  confirmationText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    
  },
  vaultButton: {
    backgroundColor: '#D1E2F9',
    borderRadius: 8 
    
  },
  vaultButtonText: {
    color: '#1C2333',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  createButton: {
    backgroundColor: '#FEE5B6',
    borderRadius: 8
    
  },
  createButtonText: {
    color: '#1C2333',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  homeButton: {
    backgroundColor: '#3B4F75',
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});
