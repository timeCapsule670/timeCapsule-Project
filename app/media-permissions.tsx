import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MessageType = "video" | "audio" | "image" | "text";

const messageTypeConfig = {
  video: {
    title: "Record Video Message",
    heading: "Let's Get Your Camera Ready",
    description: "To record a video message, we'll need access to your camera and microphone.",
    buttonText: "Enable Camera & Microphone",
    needsCamera: true,
    needsMicrophone: true,
    needsMediaLibrary: false,
  },
  audio: {
    title: "Record Audio Message",
    heading: "Let's Get Your Microphone Ready",
    description: "To record an audio message, we'll need access to your microphone.",
    buttonText: "Enable Microphone",
    needsCamera: false,
    needsMicrophone: true,
    needsMediaLibrary: false,
  },
  image: {
    title: "Upload Image",
    heading: "Let's Get Your Camera Ready",
    description: "To upload an image, we'll need access to your camera and photo library.",
    buttonText: "Enable Camera & Photo Library",
    needsCamera: true,
    needsMicrophone: false,
    needsMediaLibrary: true,
  },
  text: {
    title: "Write Text Message",
    heading: "",
    description: "",
    buttonText: "",
    needsCamera: false,
    needsMicrophone: false,
    needsMediaLibrary: false,
  },
};

export default function MediaPermissions() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: MessageType }>();
  const config = messageTypeConfig[type || "video"];
  const [showExplanation, setShowExplanation] = useState(false);

  const handleBack = () => {
    // @ts-ignore
    const canGoBack = typeof router.canGoBack === "function" ? (router as any).canGoBack() : false;
    if (canGoBack) {
      router.back();
    } else {
      router.replace("/recipient");
    }
  };

  const handleEnablePermissions = async () => {
    try {
      if (config.needsCamera) {
        const { status: cameraCheck } = await ImagePicker.getCameraPermissionsAsync();
        if (cameraCheck !== "granted") {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission Denied", "Camera access is required for this message type. Please enable it in settings.");
            return;
          }
        }
      }

      if (config.needsMicrophone) {
        const { status: micCheck } = await Audio.getPermissionsAsync();
        if (micCheck !== "granted") {
          const { status } = await Audio.requestPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission Denied", "Microphone access is required for this message type. Please enable it in settings.");
            return;
          }
        }
      }

      if (config.needsMediaLibrary) {
        const { status: libraryCheck } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (libraryCheck !== "granted") {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission Denied", "Photo library access is required to upload images. Please enable it in settings.");
            return;
          }
        }
      }

      // All necessary permissions granted, navigate to creation page
      if (type === "audio") {
        router.push("/create-audio");
      } else {
        router.push(`/create-${type || "video"}` as any);
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert("Error", "Something went wrong while requesting permissions.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      {/* Header */}
      <View className="px-4 pt-10 pb-4 border-b border-[#f3f4f6]">
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
            className="text-[#5a5a5a] text-[22px] leading-[33px] text-center flex-1 pr-6"
          >
            {config.title}
          </Text>
        </View>
        {/* Progress Bar (50%) */}
        <View className="bg-[#2f3a561a] h-[2px] rounded-full overflow-hidden w-full">
          <View className="bg-[#2f3a56] h-full w-[50%]" />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-10 items-center">
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-[#606060] text-[16px] leading-[21px] text-center px-4"
          >
            Even the simplest words can mean everything one day.
          </Text>

          <View className="w-full gap-10 mt-[80px]">
            <View className="gap-2">
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-black text-[18px] leading-[27px]"
              >
                {config.heading}
              </Text>
              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-[#5a5a5a] text-[16px] leading-[21px]"
              >
                {config.description}
              </Text>
            </View>

            <View className="gap-4">
              <TouchableOpacity
                onPress={handleEnablePermissions}
                activeOpacity={0.9}
                className="bg-[#2f3a56] h-[60px] rounded-[8px] items-center justify-center w-full"
              >
                <Text
                  style={{ fontFamily: "Poppins_500Medium" }}
                  className="text-white text-[16px]"
                >
                  {config.buttonText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setShowExplanation(true)}
                activeOpacity={0.7} 
                className="items-center"
              >
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="text-[#6099ea] text-[12px] underline"
                >
                  Why do we need this?
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Explanation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showExplanation}
        onRequestClose={() => setShowExplanation(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={() => setShowExplanation(false)}
        >
          <Pressable className="bg-white w-full rounded-[16px] p-6 gap-6">
            <View className="flex-row justify-between items-center">
              <Text style={{ fontFamily: "Poppins_700Bold" }} className="text-[#2f3a56] text-[18px]">
                Why Permissions?
              </Text>
              <TouchableOpacity onPress={() => setShowExplanation(false)}>
                <Ionicons name="close" size={24} color="#777" />
              </TouchableOpacity>
            </View>
            
            <View className="gap-4">
              {config.needsCamera && (
                <View className="flex-row gap-3">
                  <Ionicons name="camera-outline" size={20} color="#2f3a56" />
                  <Text style={{ fontFamily: "Poppins_400Regular" }} className="flex-1 text-[#4a4a4a]">
                    Camera: Needed to record video messages and take photos directly within the app.
                  </Text>
                </View>
              )}
              {config.needsMicrophone && (
                <View className="flex-row gap-3">
                  <Ionicons name="mic-outline" size={20} color="#2f3a56" />
                  <Text style={{ fontFamily: "Poppins_400Regular" }} className="flex-1 text-[#4a4a4a]">
                    Microphone: Needed to record your voice for audio and video messages.
                  </Text>
                </View>
              )}
              {config.needsMediaLibrary && (
                <View className="flex-row gap-3">
                  <Ionicons name="images-outline" size={20} color="#2f3a56" />
                  <Text style={{ fontFamily: "Poppins_400Regular" }} className="flex-1 text-[#4a4a4a]">
                    Photo Library: Needed to select and upload your favorite memories from your device.
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setShowExplanation(false)}
              activeOpacity={0.8}
              className="bg-[#2f3a56] h-[50px] rounded-[8px] items-center justify-center"
            >
              <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-white text-[16px]">
                Got it
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

