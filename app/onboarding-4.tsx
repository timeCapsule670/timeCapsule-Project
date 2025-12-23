import React from "react";
import { useRouter } from "expo-router";
import { onboarding4Bg } from "./_constants/assets";
import OnboardingLayout from "./components/OnboardingLayout";

export default function Onboarding4() {
  const router = useRouter();

  return (
    <OnboardingLayout
      backgroundImage={onboarding4Bg}
      title="Prompts To Inspire"
      description='Get questions and affirmations to spark stories. Share traditions, encouragement, or special "Open When" moments.'
      buttonText="Next"
      onButtonPress={() => {
        router.replace("/onboarding-5");
      }}
      onBackPress={() => {
        // @ts-ignore
        const canGoBack = typeof router.canGoBack === "function" ? (router as any).canGoBack() : false;
        if (canGoBack) {
          router.back();
        } else {
          router.replace("/onboarding-3");
        }
      }}
    />
  );
}
