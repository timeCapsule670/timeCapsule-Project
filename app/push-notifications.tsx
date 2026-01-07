import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const notificationFeatures = [
  {
    id: "delivery",
    label: "Delivery confirmations",
    icon: "checkmark-circle",
    color: "#6099EA",
  },
  {
    id: "reminders",
    label: "Message reminders",
    icon: "time",
    color: "#fcb32b",
  },
  {
    id: "nudges",
    label: "Custom nudges from your child",
    icon: "heart",
    color: "#FF2828",
  },
  {
    id: "moments",
    label: "Never miss a moment",
    icon: "star",
    color: "#8A5FCC",
  },
];

export default function PushNotificationsSetup() {
  const router = useRouter();

  const handleBack = () => {
    // @ts-ignore
    const canGoBack = typeof router.canGoBack === "function" ? (router as any).canGoBack() : false;
    if (canGoBack) {
      router.back();
    } else {
      router.replace("/child-invitation");
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Notifications Disabled",
          "You can enable notifications later in your device settings to stay updated.",
          [{ text: "OK", onPress: () => router.replace("/summary") }] // Navigate to summary
        );
        return;
      }

      // Permission granted
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      router.replace("/summary"); // Navigate to summary
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      router.replace("/summary");
    }
  };

  const handleSkip = () => {
    router.replace("/summary"); // Navigate to summary
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      {/* Header */}
      <View className="px-4 pt-10 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            className="w-6 h-6 justify-center items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#777" />
          </TouchableOpacity>
          <Text
            style={{ fontFamily: "Poppins_700Bold" }}
            className="text-[#1c2333] text-[22px] leading-[33px] text-center flex-1 pr-6"
          >
            Push Notifications
          </Text>
        </View>
        {/* Progress Bar (Final step, maybe no bar or 100%) */}
        <View className="bg-[#2f3a561a] h-[5px] rounded-full overflow-hidden w-full">
          <View className="bg-[#2f3a56] h-full w-full" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-10">
          {/* Main Icon and Title Section */}
          <View className="items-center gap-6">
            <View className="items-center justify-center">
              <LinearGradient
                colors={["#c28fef", "#1d6ee1"]}
                start={{ x: 0, y: 0.19 }}
                end={{ x: 0, y: 1.74 }}
                className="w-[60px] h-[60px] items-center justify-center"
                style={{
                  borderRadius: 30,
                  transform: [{ rotate: "45deg" }],
                }}
              >
                <View style={{ transform: [{ rotate: "-45deg" }] }}>
                  <Ionicons name="notifications" size={32} color="#ffffff" />
                </View>
              </LinearGradient>
            </View>

            <View className="gap-2">
              <Text
                style={{ fontFamily: "Poppins_700Bold" }}
                className="text-black text-[22px] leading-[33px] text-center px-4"
              >
                Stay in the loop with gentle reminders
              </Text>
              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-[#4a4a4a] text-[14px] leading-[21px] text-center px-4"
              >
                Get notified when your messages are delivered, when you receive a response or when it’s time to schedule a new capsule.
              </Text>
            </View>
          </View>

          {/* Features Card */}
          <View
            className="bg-white rounded-[16px] p-6 gap-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="gap-4">
              {notificationFeatures.map((feature) => (
                <View key={feature.id} className="flex-row items-center gap-4">
                  <View 
                    className="w-[32px] h-[32px] rounded-full items-center justify-center"
                    style={{ backgroundColor: feature.color }}
                  >
                    <Ionicons name={feature.icon as any} size={20} color="white" />
                  </View>
                  <Text
                    style={{ fontFamily: "Poppins_400Regular" }}
                    className="flex-1 text-black text-[16px] leading-[21px]"
                  >
                    {feature.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Buttons Section */}
          <View className="gap-4 mt-4">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleEnableNotifications}
              className="bg-[#2f3a56] h-[60px] rounded-[8px] items-center justify-center w-full"
            >
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-white text-[16px]"
              >
                Turn On Notifications
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSkip}
              className="bg-[#fcb32b] h-[60px] rounded-[8px] items-center justify-center w-full"
            >
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-black text-[16px]"
              >
                No, I’ll Do This Later
              </Text>
            </TouchableOpacity>

            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[#4a4a4a] text-[14px] leading-[21px] text-center mt-2 px-6"
            >
              You control what we send. Change preferences anytime in Settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

