import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import ToastManager from "toastify-react-native";
import { TimeCapsuleProvider } from "../context/TimeCapsuleContext";
import { PromptProvider } from "../context/PromptContext";
import "../global.css";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "white" }} />;
  }

  return (
    <TimeCapsuleProvider>
      <PromptProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <ToastManager />
      </PromptProvider>
    </TimeCapsuleProvider>
  );
}
