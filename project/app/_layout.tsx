import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useFrameworkReady();

  useEffect(() => {
    // Simulate app initialization time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Show loading for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="create-account" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="family-setup" />
        <Stack.Screen name="moments-selection" />
        <Stack.Screen name="child-profile-setup" />
        <Stack.Screen name="invite-child" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      <LoadingOverlay visible={isLoading} />
    </>
  );
}