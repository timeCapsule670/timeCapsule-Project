import { useRouter } from "expo-router";
import React from "react";
import ProcessLoadingAnimation, { LoadingStep } from "./components/ProcessLoadingAnimation";

const loadingSteps: LoadingStep[] = [
  {
    id: "preparing",
    text: "Preparing your timecapsule",
    source: require("../assets/images/logo.png"),
    type: "pulse",
  },
  {
    id: "encrypting",
    text: "Encrypting your message",
    source: require("../assets/images/VPN Protection.json"),
    type: "lottie",
    duration: 10000,
  },
  {
    id: "delivery",
    text: "Setting delivery time",
    source: require("../assets/images/Clock.json"),
    type: "lottie",
  },
  {
    id: "analyzing",
    text: "Analyzing",
    source: require("../assets/images/Analyzing website.json"),
    type: "lottie",
  },
];

export default function ProcessingMessagePage() {
  const router = useRouter();

  const handleComplete = () => {
    console.log("Processing complete, navigating to success");
    router.replace("/success-confirmation");
  };

  return (
    <ProcessLoadingAnimation 
      steps={loadingSteps} 
      onComplete={handleComplete} 
    />
  );
}

