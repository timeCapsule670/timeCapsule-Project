import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SuccessConfirmation() {
  const router = useRouter();
  const [showWIPModal, setShowWIPModal] = useState(false);

  const handleAction = () => {
    setShowWIPModal(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 40, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-10">
          {/* Lottie Animation */}
          <View className="items-center justify-center">
            <LottieView
              source={require("../assets/images/success.json")}
              style={{ width: 204, height: 204 }}
              autoPlay
              loop={false}
            />
          </View>

          {/* Text Content */}
          <View className="items-center gap-2">
            <Text
              style={{ fontFamily: "Poppins_700Bold" }}
              className="text-[20px] leading-[33px] text-[#2f3a56] text-center"
            >
              That was a powerful thing you just did.
            </Text>
            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[13px] leading-[21px] text-[#9b9b9b] text-center px-4"
            >
              One day, this may mean everything to them.
            </Text>
          </View>

          {/* Success Notification Box */}
          <View 
            className="bg-[#1fc16b1a] border-2 border-[#1fc16b] border-dashed rounded-[8px] p-2 flex-row items-center gap-4 w-full"
          >
            <View className="bg-[#1fc16b] w-12 h-12 rounded-full items-center justify-center">
              <Ionicons name="shield-checkmark-outline" size={24} color="white" />
            </View>
            <View className="flex-1 gap-1">
              <Text
                style={{ fontFamily: "Poppins_700Bold" }}
                className="text-black text-[16px] leading-[21px]"
              >
                Your message is saved!
              </Text>
              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-[#9b9b9b] text-[12px] leading-[18px]"
              >
                It's now stored securely in your Vault, ready to unlock at just the right moment.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="w-full gap-4 pt-4">
            <TouchableOpacity
              onPress={handleAction}
              activeOpacity={0.9}
              className="bg-[#d1e2f9] h-[60px] rounded-[8px] items-center justify-center w-full"
            >
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-black text-[16px]"
              >
                View in Vault
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAction}
              activeOpacity={0.9}
              className="bg-[#fee5b6] h-[60px] rounded-[8px] items-center justify-center w-full"
            >
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-[#1c2333] text-[16px]"
              >
                Create Another Message
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // Navigate to tabs home
                // In Expo Router, route groups use parentheses in the path
                router.replace("/(tabs)" as any);
              }}
              activeOpacity={0.9}
              className="bg-[#4a5b87] h-[60px] rounded-[8px] items-center justify-center w-full"
            >
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-white text-[16px]"
              >
                Go to Home
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* WIP Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showWIPModal}
        onRequestClose={() => setShowWIPModal(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={() => setShowWIPModal(false)}
        >
          <Pressable className="bg-white w-full rounded-[16px] p-8 gap-6 items-center">
            <View className="bg-[#fee5b6] w-20 h-20 rounded-full items-center justify-center">
              <Ionicons name="construct-outline" size={40} color="#1c2333" />
            </View>
            
            <View className="items-center gap-2">
              <Text style={{ fontFamily: "Poppins_700Bold" }} className="text-[#2f3a56] text-[20px] text-center">
                Work in Progress
              </Text>
              <Text style={{ fontFamily: "Poppins_400Regular" }} className="text-[#606060] text-[16px] text-center px-4">
                We're still building this feature. Please come back soon!
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowWIPModal(false)}
              activeOpacity={0.8}
              className="bg-[#2f3a56] h-[50px] rounded-[8px] items-center justify-center w-full mt-2"
            >
              <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-white text-[16px]">
                Got it
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
