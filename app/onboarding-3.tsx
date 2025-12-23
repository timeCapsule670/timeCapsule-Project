import React from "react";
import { useRouter } from "expo-router";
import { onboarding3Bg } from "./_constants/assets";
import OnboardingLayout from "./components/OnboardingLayout";

export default function Onboarding3() {
  const router = useRouter();

  return (
    <OnboardingLayout
      backgroundImage={onboarding3Bg}
      title="Every Memory Tells a Story"
      description="Share thoughts and stories so loved ones feel your presence, even years from now."
      buttonText="Next"
      onButtonPress={() => {
        router.replace("/onboarding-4");
      }}
      onBackPress={() => {
        // @ts-ignore
        const canGoBack = typeof router.canGoBack === "function" ? (router as any).canGoBack() : false;
        if (canGoBack) {
          router.back();
        } else {
          router.replace("/onboarding-2");
        }
      }}
    />
  );
}

