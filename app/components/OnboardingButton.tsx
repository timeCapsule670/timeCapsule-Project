import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface OnboardingButtonProps {
  text: string;
  backgroundColor?: string;
  onPress: () => void;
}

export default function OnboardingButton({
  text,
  backgroundColor = "#4a5b87",
  onPress,
}: OnboardingButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="h-[60px] rounded-[8px] items-center justify-center w-full p-4"
      style={{ backgroundColor }}
    >
      <Text
        style={{ fontFamily: "Poppins_500Medium" }}
        className="text-white text-[18px] leading-[27px] text-center"
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

