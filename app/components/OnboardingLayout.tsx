import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OnboardingButton from "./OnboardingButton";

interface OnboardingLayoutProps {
  backgroundImage: string;
  title: string;
  description: string;
  buttonText: string;
  onButtonPress: () => void;
  showSkip?: boolean;
  onBackPress?: () => void;
}

export default function OnboardingLayout({
  backgroundImage,
  title,
  description,
  buttonText,
  onButtonPress,
  showSkip = true,
  onBackPress,
}: OnboardingLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      // Default back behavior
      // @ts-ignore
      const canGoBack = typeof router.canGoBack === "function" ? (router as any).canGoBack() : false;
      if (canGoBack) {
        router.back();
      } else {
        router.replace("/");
      }
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ImageBackground
        source={{ uri: backgroundImage }}
        resizeMode="cover"
        className="flex-1 w-full"
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0)", "#000000"]}
          locations={[0, 0.5, 0.93897]}
          className="absolute inset-0"
        />

        <View className="flex-1 px-4 pt-10 pb-10 justify-between">
          {/* Header with Back Button and Skip */}
          <View className="flex-row items-center justify-between w-full">
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={0.7}
              className="w-6 h-6 justify-center items-center"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            {showSkip && (
              <TouchableOpacity
                onPress={() => {
                  router.replace("/sign-up");
                }}
                activeOpacity={0.7}
                style={{ width: 78 }}
              >
                <Text
                  style={{ fontFamily: "Poppins_500Medium" }}
                  className="text-[#ffffff] text-[18px] leading-[27px] text-center"
                >
                  Skip
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Content Section */}
          <View className="flex-1 justify-end gap-6 w-full">
            <View className="gap-6">
              <Text
                style={{ fontFamily: "Poppins_700Bold" }}
                className="text-white text-[32px] leading-[48px]"
              >
                {title}
              </Text>

              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-white text-[16px] leading-[21px]"
              >
                {description}
              </Text>
            </View>

            {/* Button */}
            <View className="gap-6 w-full">
              <OnboardingButton text={buttonText} onPress={onButtonPress} />
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

