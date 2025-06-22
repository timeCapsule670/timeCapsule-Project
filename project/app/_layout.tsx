import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import LoadingOverlay from '@/components/LoadingOverlay';
import { supabase } from '@/libs/superbase';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Wait for fonts to load
        if (!fontsLoaded && !fontError) {
          return;
        }

        // Initialize Supabase session
        await supabase.auth.getSession();
        
        // Simulate app initialization time for smooth UX
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        // Still proceed to avoid infinite loading
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="create-account" />
        <Stack.Screen name="onboarding-1" />
        <Stack.Screen name="onboarding-2" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="family-setup" />
        <Stack.Screen name="moments-selection" />
        <Stack.Screen name="child-profile-setup" />
        <Stack.Screen name="final-review" />
        <Stack.Screen name="invite-child" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="message-settings" />
        <Stack.Screen name="create-message" />
        <Stack.Screen name="preview-message" />
        <Stack.Screen name="schedule-delivery" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      <LoadingOverlay visible={isLoading} />
    </>
  );
}