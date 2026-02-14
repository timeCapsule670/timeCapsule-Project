import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTabBarHeight } from "../hooks/useTabBarHeight";

export default function ChildInvitation() {
  const router = useRouter();
  const { scrollContentPadding } = useTabBarHeight();
  const [inviteCode, setInviteCode] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  const generateCode = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const prefix = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
    const suffix = Math.floor(100 + Math.random() * 900);
    const code = `${prefix}-${suffix}`;
    setInviteCode(code);

    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "2-digit", year: "numeric" };
    setExpirationDate(date.toLocaleDateString("en-US", options));
  };

  useEffect(() => {
    generateCode();
  }, []);

  const handleBack = () => {
    // @ts-ignore
    const canGoBack = typeof router.canGoBack === "function" ? (router as any).canGoBack() : false;
    if (canGoBack) {
      router.back();
    } else {
      router.replace("/family-space");
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert("Success", "Invite code copied to clipboard!");
  };

  const sendEmail = () => {
    const subject = "TimeCapsule Invite Code";
    const body = `Hi! Use this code to connect your account on TimeCapsule: ${inviteCode}`;
    Linking.openURL(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const sendText = () => {
    const body = `Hi! Use this code to connect your account on TimeCapsule: ${inviteCode}`;
    Linking.openURL(`sms:?body=${encodeURIComponent(body)}`);
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
            Invite Your Child
          </Text>
        </View>
        {/* Progress Bar (100%) */}
        <View className="bg-[#2f3a561a] h-[5px] rounded-full overflow-hidden w-full">
          <View className="bg-[#2f3a56] h-full w-full" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: scrollContentPadding(40) }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-10">
          {/* Instructions */}
          <View className="gap-4">
            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[#4a4a4a] text-[16px] leading-[21px] text-center"
            >
              We’ll generate a unique invite code or link. You can share it with your child to connect their account.
            </Text>
            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[#4a4a4a] text-[16px] leading-[21px] text-center"
            >
              This will also be stored in your profile for future-use.
            </Text>
          </View>

          {/* Code Card */}
          <View
            className="bg-white rounded-[16px] p-6 items-center gap-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-black text-[16px]"
            >
              Your Link Code
            </Text>
            <View className="bg-[#f5f5f5] rounded-[16px] w-full py-4 items-center">
              <Text
                style={{ fontFamily: "Poppins_700Bold" }}
                className="text-black text-[22px] leading-[33px]"
              >
                {inviteCode}
              </Text>
              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-[#4a4a4a] text-[16px] mt-1"
              >
                Expires: {expirationDate}
              </Text>
            </View>
          </View>

          {/* Generate New Code */}
          <TouchableOpacity
            onPress={generateCode}
            activeOpacity={0.7}
            className="flex-row items-center justify-center gap-3"
          >
            <Ionicons name="refresh" size={24} color="#1d6ee1" />
            <Text
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-[#1d6ee1] text-[18px]"
            >
              Generate New Code
            </Text>
          </TouchableOpacity>

          {/* Share Section */}
          <View className="gap-4">
            <Text
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-black text-[16px]"
            >
              Share Your Code
            </Text>
            
            <View className="gap-2">
              <TouchableOpacity
                onPress={copyToClipboard}
                activeOpacity={0.8}
                className="bg-[#9daaca] h-[56px] rounded-[8px] flex-row items-center justify-center gap-3 px-4"
              >
                <Ionicons name="copy-outline" size={24} color="black" />
                <Text
                  style={{ fontFamily: "Poppins_500Medium" }}
                  className="text-black text-[18px]"
                >
                  Copy Code
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={sendEmail}
                activeOpacity={0.8}
                className="bg-[#fee5b6] h-[56px] rounded-[8px] flex-row items-center justify-center gap-3 px-4"
              >
                <Ionicons name="mail-outline" size={24} color="black" />
                <Text
                  style={{ fontFamily: "Poppins_500Medium" }}
                  className="text-black text-[18px]"
                >
                  Send Via Email
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={sendText}
                activeOpacity={0.8}
                className="bg-[#d6c7ed] h-[56px] rounded-[8px] flex-row items-center justify-center gap-3 px-4"
              >
                <Ionicons name="chatbubble-outline" size={24} color="black" />
                <Text
                  style={{ fontFamily: "Poppins_500Medium" }}
                  className="text-black text-[18px]"
                >
                  Send Via Text
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer and Next Button */}
          <View className="gap-6 mt-4">
            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[#777] text-[16px] text-center"
            >
              You can always find this code in your account settings.
            </Text>
            
             <TouchableOpacity
               activeOpacity={0.9}
               className="bg-[#2f3a56] h-[60px] rounded-[8px] flex-row items-center justify-center gap-4 px-4 w-full"
               onPress={() => {
                 // Navigate to next screen
                 router.push("/push-notifications");
                 console.log("Next pressed");
               }}
             >
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-white text-[16px]"
              >
                Next
              </Text>
              <Ionicons name="arrow-forward" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

