import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileTab() {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <View className="flex-1 items-center justify-center px-4">
        <Text
          style={{ fontFamily: "Poppins_700Bold" }}
          className="text-[#2f3a56] text-[22px] leading-[33px] text-center mb-2"
        >
          Profile
        </Text>
        <Text
          style={{ fontFamily: "Poppins_400Regular" }}
          className="text-[#5a5a5a] text-[16px] leading-[21px] text-center"
        >
          Your profile settings
        </Text>
      </View>
    </SafeAreaView>
  );
}

