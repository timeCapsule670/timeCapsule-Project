import React from "react";
import { useRouter } from "expo-router";
import { onboarding5Bg } from "./_constants/assets";
import OnboardingLayout from "./components/OnboardingLayout";

export default function Onboarding5() {
  const router = useRouter();

  return (
    <OnboardingLayout
      backgroundImage={onboarding5Bg}
      title="Messages that grow with your child"
      description="Create lasting moments by scheduling messages for birthdays, milestones, or 'just because' days—delivered exactly when they matter most."
      buttonText="Get Started"
      onButtonPress={() => {
        router.replace("/sign-up");
      }}
      showSkip={false}
      onBackPress={() => {
        // @ts-ignore
        const canGoBack = typeof router.canGoBack === "function" ? (router as any).canGoBack() : false;
        if (canGoBack) {
          router.back();
        } else {
          router.replace("/onboarding-4");
        }
      }}
    />
  );
}
