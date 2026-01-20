import { useRouter } from "expo-router";
import React from "react";
import OnboardingLayout from "./components/OnboardingLayout";
import { onboarding2Bg } from "./constants/assets";

export default function Onboarding2() {
  const router = useRouter();

  return (
    <OnboardingLayout
      backgroundImage={onboarding2Bg}
      title="Start Simple: Record or Upload a Memory"
      description="Save audio, video, text, or photos with Timecapsule-each memory a treasure for the future."
      buttonText="Next"
      onButtonPress={() => {
        router.push("/onboarding-3");
      }}
    />
  );
}

