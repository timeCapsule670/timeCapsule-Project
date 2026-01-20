import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Hero from "./components/Hero";

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <Hero />
    </SafeAreaView>
  );
}
