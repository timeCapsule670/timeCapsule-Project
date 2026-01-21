import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LinkAccount() {
  const router = useRouter();

  const handleLink = () => {
    // Navigate to next screen or linking flow
    router.push("/child-profile");
    console.log("Link account pressed");
  };

  const handleSkip = () => {
    // Navigate to next screen (home/dashboard)
    router.replace("/push-notifications");

  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-10">
          {/* Header Icon */}
          <View className="items-center justify-center">
            <LinearGradient
              colors={["#c28fef", "#1d6ee1"]}
              start={{ x: 0, y: 0.19 }}
              end={{ x: 0, y: 1.74 }}
              className="w-[80px] h-[80px] p-4 items-center justify-center"
              style={{
                borderRadius: 30,
                transform: [{ rotate: "45deg" }],
              }}
            >
              <Ionicons name="link" size={32} color="#ffffff" />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text
            style={{ fontFamily: "Poppins_700Bold" }}
            className="text-black text-[22px] leading-[33px] text-center px-4"
          >
            Would you like to link your account to a loved one now?
          </Text>

          {/* Features Card */}
          <View
            className="p-6 w-full gap-6"

          >
            <Text
              style={{ fontFamily: "Poppins_700Bold" }}
              className="text-black text-[18px] leading-[27px]"
            >
              What linking allows:
            </Text>

            <View className="gap-4">
              {/* Feature 1 */}
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-[#6099EA] items-center justify-center">
                  <Ionicons name="calendar" size={20} color="white" />
                </View>
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="flex-1 text-black text-[16px] leading-[21px]"
                >
                  Schedule messages for special moments.
                </Text>
              </View>

              {/* Feature 2 */}
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-[#FF2828] items-center justify-center">
                  <Ionicons name="mic-outline" size={20} color="white" />
                </View>
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="flex-1 text-black text-[16px] leading-[21px]"
                >
                  Send voice, video, and text messages
                </Text>
              </View>

              {/* Feature 3 */}
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-[#8A5FCC] items-center justify-center">
                  <Ionicons name="chatbox-ellipses-outline" size={20} color="white" />
                </View>
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="flex-1 text-black text-[16px] leading-[21px]"
                >
                  Receive reactions and replies
                </Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View className="w-full gap-4">
            <TouchableOpacity
              onPress={handleLink}
              activeOpacity={0.9}
              className="bg-[#2f3a56] h-[60px] rounded-[8px] items-center justify-center w-full"
            >
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-white text-[16px]"
              >
                Yes, Let’s Link
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkip}
              activeOpacity={0.9}
              className="bg-[#fcb32b] h-[60px] rounded-[8px] items-center justify-center w-full"
            >
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-black text-[16px]"
              >
                No, I’ll Do This Later
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Text */}
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-[#4a4a4a] text-[14px] leading-[21px] text-center px-4"
          >
            You can always add a recipient later from your account settings or vault.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

