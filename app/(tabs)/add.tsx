import React from "react";
import { View } from "react-native";

// This screen is never actually shown because the tab press is intercepted
// to show the MessageTypeModal instead
export default function AddTab() {
  return <View style={{ flex: 1, backgroundColor: "white" }} />;
}
