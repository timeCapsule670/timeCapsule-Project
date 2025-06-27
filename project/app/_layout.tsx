import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
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
import type { Session } from '@supabase/supabase-js';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
 const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

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

        console.log('🔍 App - Checking for existing session...');
        
        // Get the current Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ App - Session error:', sessionError);
          // Navigate to landing page on session error
          router.replace('/');
          return;
        }

        setSession(session);

        if (session?.user) {
          console.log('✅ App - Session found, user authenticated:', session.user.id);
          
          // Check if user has completed onboarding by looking for director profile
          try {
            const { data: directorData, error: directorError } = await supabase
              .from('directors')
              .select('id, first_name')
              .eq('auth_user_id', session.user.id)
              .single();

            if (directorError || !directorData) {
              console.log('⚠️ App - No director profile found, redirecting to onboarding');
              router.replace('/onboarding');
              return;
            }

            console.log('✅ App - Director profile found, redirecting to main app');
            // Navigate to main app with user's first name
            router.replace({
              pathname: '/(tabs)',
              params: { firstName: directorData.first_name || 'there' }
            });
          } catch (error) {
            console.error('❌ App - Error checking director profile:', error);
            // If there's an error checking the profile, still go to main app
            router.replace('/(tabs)');
          }
        } else {
          console.log('ℹ️ App - No session found, redirecting to landing page');
          // No session found, navigate to landing page
          router.replace('/');
        }
        
      } catch (error) {
        console.error('💥 App - Unexpected error during initialization:', error);
        // On any unexpected error, navigate to landing page
        router.replace('/');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [fontsLoaded, fontError, router]);

  // Set up auth state listener for real-time session changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 App - Auth state changed:', event, session?.user?.id);
        setSession(session);

        if (event === 'SIGNED_OUT') {
          console.log('👋 App - User signed out, redirecting to landing page');
          router.replace('/');
        } else if (event === 'SIGNED_IN' && session) {
          console.log('👋 App - User signed in, redirecting to main app');
          
          // Get user's first name for personalization
          try {
            const { data: directorData } = await supabase
              .from('directors')
              .select('first_name')
              .eq('auth_user_id', session.user.id)
              .single();

            router.replace({
              pathname: '/(tabs)',
              params: { firstName: directorData?.first_name || 'there' }
            });
          } catch (error) {
            // If there's an error, still navigate to main app
            router.replace('/(tabs)');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

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
        <Stack.Screen name="record-video-message" />
        <Stack.Screen name="record-text-message" />
        <Stack.Screen name="create-message" />
        <Stack.Screen name="upload-profile-picture" />
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