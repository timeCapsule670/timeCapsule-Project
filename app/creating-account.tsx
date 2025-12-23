import { useRouter } from "expo-router";
import React from "react";
import LoadingAnimation from "./components/LoadingAnimation";

export default function CreatingAccountPage() {
  const router = useRouter();

  const handleComplete = () => {
    // Navigate to the next screen (e.g., home or dashboard)
    router.replace("/link-account"); 
    console.log("Account creation animation complete");
  };

  return (
    <LoadingAnimation 
      onComplete={handleComplete}
      successMessage="Welcome to TimeCapsule!"
    />
  );
}
