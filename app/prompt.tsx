import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTabBarHeight } from "../hooks/useTabBarHeight";

type MessageType = "video" | "audio" | "text" | "image";

interface MessageTypeOption {
  id: MessageType;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
}

const messageTypes: MessageTypeOption[] = [
  {
    id: "video",
    title: "Record a Video",
    subtitle: "Send a video",
    icon: "videocam",
    iconBg: "#fff4e1",
    iconColor: "#e6a23c",
  },
  {
    id: "audio",
    title: "Record an Audio",
    subtitle: "Share your voice",
    icon: "mic",
    iconBg: "#e8f0ff",
    iconColor: "#4a5b87",
  },
  {
    id: "text",
    title: "Write a Text",
    subtitle: "Express yourself",
    icon: "create",
    iconBg: "#e8f4fd",
    iconColor: "#4a90d9",
  },
  {
    id: "image",
    title: "Upload an Image",
    subtitle: "Upload your favorite memory",
    icon: "image",
    iconBg: "#f0f0f0",
    iconColor: "#666666",
  },
];

export default function PromptPage() {
  const router = useRouter();
  const { scrollContentPadding } = useTabBarHeight();
  const params = useLocalSearchParams<{ promptId?: string; question?: string; title?: string }>();
  const [selectedType, setSelectedType] = useState<MessageType | null>(null);

  const question = params.question || "What makes you who you are today?";
  const title = params.title || "Prompt";

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (!selectedType) return;
    router.push({
      pathname: "/recipient",
      params: {
        messageType: selectedType,
        prompt: question,
        promptId: params.promptId,
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      {/* Header */}
      <View className="px-4 pt-4 pb-4 border-b border-[#f3f4f6]">
        <View className="flex-row items-center gap-2 mb-4">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            className="w-8 h-8 justify-center items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#4a5b87" />
          </TouchableOpacity>
          <Text
            style={{ fontFamily: "Poppins_500Medium" }}
            className="text-[#4a5b87] text-[16px]"
          >
            Back
          </Text>
        </View>

        <Text
          style={{ fontFamily: "Poppins_700Bold" }}
          className="text-[#1a1f36] text-[22px] leading-[33px]"
        >
          {title}
        </Text>
        <Text
          style={{ fontFamily: "Poppins_400Regular" }}
          className="text-[#6b7280] text-[16px] leading-[24px] mt-2"
        >
          {question}
        </Text>
      </View>

      {/* Select Message Type */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: scrollContentPadding(120) }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{ fontFamily: "Poppins_600SemiBold" }}
          className="text-[#1a1f36] text-[18px] mb-4"
        >
          Select Message Type
        </Text>

        <View className="gap-3">
          {messageTypes.map((option) => {
            const isSelected = selectedType === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                className={`flex-row items-center rounded-[14px] p-4 gap-3.5 ${
                  isSelected ? "bg-[#4a5b87]" : "bg-[#f8f8f8]"
                }`}
                onPress={() => setSelectedType(option.id)}
                activeOpacity={0.7}
              >
                <View
                  className="w-11 h-11 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : option.iconBg,
                  }}
                >
                  <Ionicons
                    name={option.icon}
                    size={22}
                    color={isSelected ? "#ffffff" : option.iconColor}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ fontFamily: "Poppins_500Medium" }}
                    className={`text-[15px] mb-0.5 ${
                      isSelected ? "text-white" : "text-[#1a1f36]"
                    }`}
                  >
                    {option.title}
                  </Text>
                  <Text
                    style={{ fontFamily: "Poppins_400Regular" }}
                    className={`text-[13px] ${
                      isSelected ? "text-white/80" : "text-[#6b7280]"
                    }`}
                  >
                    {option.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Next Button - Fixed at bottom */}
      {selectedType && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f3f4f6] px-4 py-6">
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.9}
            className="bg-[#4a5b87] h-14 rounded-[14px] flex-row items-center justify-center gap-2"
          >
            <Text
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-white text-base"
            >
              Next, Recipient
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
