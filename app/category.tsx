import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface CategoryOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const categories: CategoryOption[] = [
  {
    id: "milestones",
    label: "Milestones",
    icon: "school-outline",
    iconColor: "#9b59b6", // Purple
  },
  {
    id: "emotional-support",
    label: "Emotional Support",
    icon: "happy-outline",
    iconColor: "#f39c12", // Yellow/Orange
  },
  {
    id: "celebrations",
    label: "Celebrations & Encouragement",
    icon: "gift-outline",
    iconColor: "#f39c12", // Yellow/Orange for party
  },
  {
    id: "life-advice",
    label: "Life Advice",
    icon: "chatbubble-outline",
    iconColor: "#3498db", // Blue
  },
  {
    id: "just-because",
    label: "Just Because",
    icon: "heart-outline",
    iconColor: "#e91e63", // Pink/Red
  },
];

export default function Category() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const handleBack = () => {
    // @ts-ignore
    const canGoBack = typeof router.canGoBack === "function" ? (router as any).canGoBack() : false;
    if (canGoBack) {
      router.back();
    } else {
      router.replace("/profile-information");
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const handleCreateCapsule = () => {
    router.push("/pricing");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white border-b border-[#f3f4f6] pt-10 pb-4 px-4">
        <View className="flex-row items-center gap-[42px] px-2">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            className="w-6 h-6 justify-center items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#777" />
          </TouchableOpacity>
          <Text
            style={{ fontFamily: "Poppins_700Bold" }}
            className="text-[#5a5a5a] text-[22px] leading-[33px]"
          >
            Let's Get To Know You
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6">
          {/* Question */}
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-black text-[16px] leading-[21px]"
          >
            What kinds of moments are most important to you? (Select all that apply)
          </Text>

          {/* Category Options */}
          <View className="gap-4">
            {categories.map((category) => {
              const isSelected = selectedCategories.has(category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => toggleCategory(category.id)}
                  activeOpacity={0.7}
                  className={`rounded-[8px] px-4 py-4 flex-row items-center gap-4 ${
                    isSelected ? "bg-white" : "bg-[#f5f5f5]"
                  }`}
                  style={{
                    borderWidth: 1,
                    borderColor: isSelected ? category.iconColor : "#e0e0e0",
                  }}
                >
                  <Ionicons
                    name={category.icon}
                    size={24}
                    color={category.iconColor}
                  />
                  <Text
                    style={{ fontFamily: "Poppins_400Regular" }}
                    className={`flex-1 text-[16px] ${
                      isSelected ? "text-black font-semibold" : "text-black"
                    }`}
                  >
                    {category.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={category.iconColor} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Create Your Capsule Button */}
          <TouchableOpacity
            onPress={handleCreateCapsule}
            activeOpacity={0.9}
            className="bg-[#2f3a56] h-[60px] rounded-[8px] items-center justify-center w-full px-4 mt-4"
          >
            <Text
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-white text-[16px]"
            >
              Create Your Capsule
            </Text>
          </TouchableOpacity>

          {/* Explanatory Text */}
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-[#5a5a5a] text-[14px] leading-[20px] text-center mt-4"
          >
            These questions will help us personalize your experience and suggest meaningful messages to create.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

