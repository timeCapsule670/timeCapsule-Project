import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const relationshipOptions = [
  { id: "mom", label: "Mom", icon: require("../assets/images/hug.png") },
  { id: "dad", label: "Dad", icon: require("../assets/images/father-and-daughter.png") },
  { id: "guardian", label: "Guardian", icon: require("../assets/images/parent.png") },
  { id: "other", label: "Other", icon: require("../assets/images/other.png") },
];

export default function FamilySpaceSetup() {
  const router = useRouter();
  const [selectedRelationship, setSelectedRelationship] = useState<string | null>(null);

  const handleBack = () => {
    // @ts-ignore
    const canGoBack = typeof router.canGoBack === "function" ? (router as any).canGoBack() : false;
    if (canGoBack) {
      router.back();
    } else {
      router.replace("/child-profile");
    }
  };

  const handleNext = () => {
    if (selectedRelationship) {
      // Navigate to child invitation page
      router.push("/child-invitation");
      console.log("Relationship selected:", selectedRelationship);
    }
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
            Set Up Your Family Space
          </Text>
        </View>
        {/* Progress Bar (50%) */}
        <View className="bg-[#2f3a561a] h-[5px] rounded-full overflow-hidden w-full">
          <View className="bg-[#2f3a56] h-full w-[50%]" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-10">
          {/* Question */}
          <View className="gap-6">
            <Text
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-black text-[18px] leading-[27px]"
            >
              What’s your relationship to the Child?
            </Text>

            {/* Selection Options */}
            <View className="gap-4">
              {relationshipOptions.map((option) => {
                const isSelected = selectedRelationship === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => setSelectedRelationship(option.id)}
                    activeOpacity={0.7}
                    className={`h-[56px] rounded-[8px] px-6 justify-center items-center flex-row gap-4 ${
                      isSelected ? "bg-white border-[#2f3a56]" : "bg-[#f5f5f5] border-transparent"
                    }`}
                    style={{
                      borderWidth: isSelected ? 1.5 : 0,
                    }}
                  >
                    <Image
                      source={option.icon}
                      className="w-8 h-8"
                      resizeMode="contain"
                    />
                    <Text
                      style={{ fontFamily: "Poppins_500Medium" }}
                      className={`text-[16px] flex-1 text-left ${
                        isSelected ? "text-black" : "text-black"
                      }`}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color="#2f3a56" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Next Button and Footer */}
          <View className="gap-6 mt-10">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleNext}
              className={`h-[60px] rounded-[8px] flex-row items-center justify-center gap-4 px-4 w-full ${
                selectedRelationship ? "bg-[#2f3a56]" : "bg-[#2f3a5680]"
              }`}
              disabled={!selectedRelationship}
            >
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-white text-[16px]"
              >
                Next
              </Text>
              <Ionicons name="arrow-forward" size={24} color="white" />
            </TouchableOpacity>

            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[#4a4a4a] text-[14px] leading-[21px] text-center px-2"
            >
              These questions will help us personalize your experience and suggest meaningful messages to create.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

