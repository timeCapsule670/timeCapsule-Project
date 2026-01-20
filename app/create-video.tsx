import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateVideoMessage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <View className="px-4 pt-10 pb-4 border-b border-[#f3f4f6]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={handleBack} className="w-6 h-6 items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="#777" />
          </TouchableOpacity>
          <Text style={{ fontFamily: "Poppins_700Bold" }} className="text-[#5a5a5a] text-[22px] text-center flex-1 pr-6">
            Record Video
          </Text>
        </View>
      </View>

      <View className="flex-1 items-center justify-center p-6 bg-black">
        <Ionicons name="videocam-off" size={64} color="white" />
        <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-white text-[18px] text-center mt-6">
          Video recording is coming soon!
        </Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/final-touches", params: { type: "video", uri: "mock-video-uri" } })}
          className="mt-10 bg-[#2f3a56] px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-bold">Simulate Upload Success</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
