import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { heroBg } from "../constants/assets";

export default function Hero() {
  const router = useRouter();

  return (
    <ImageBackground
      source={{ uri: heroBg }}
      resizeMode="cover"
      className="flex-1 w-full"
    >
      <View className="absolute inset-0 bg-black opacity-50" />

      <View className="flex-1 justify-end px-4 pb-10">
        <Text style={{ fontFamily: "Poppins_700Bold" }} className="text-white text-3xl leading-9 mb-2">
          Capture Memories That Last Forever
        </Text>

        <Text style={{ fontFamily: "Poppins_400Regular" }} className="text-white text-base leading-6 mb-6 opacity-90">
          Send messages, stories, and affirmations to your loved ones—delivered when they need them most.
        </Text>

        <TouchableOpacity
            onPress={() => router.push("/onboarding-2")}
            // onPress={() => router.push("/final-touches")}
          activeOpacity={0.9}
          className="bg-[#4a5b87] h-14 rounded-md items-center justify-center w-full"
        >
          <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-white text-lg">Start For Free</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
