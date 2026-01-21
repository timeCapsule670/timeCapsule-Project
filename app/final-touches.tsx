import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { backArrowIcon, profileIllustration } from "../constants/assets";

export default function FinalTouches() {
  const router = useRouter();
  const { type, uri } = useLocalSearchParams<{ type: string; uri: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(uri || null);

  const player = useVideoPlayer(uri || "", (player) => {
    player.loop = false;
  });

  const MAX_CHARS = 500;

  useEffect(() => {
    if (uri && (type === "image" || !type)) {
      setPhotoUri(uri);
    }
  }, [uri, type]);

  const handleBack = () => {
    router.back();
  };

  const handleReplay = () => {
    player.seekBy(-player.currentTime);
    player.play();
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera permissions to take a photo for your message."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need gallery permissions to choose a photo for your message."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      mediaTypes: ['images'],
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUri(null);
  };

  const handleNext = () => {
    if (!title.trim()) {
      Alert.alert("Title Required", "Please give your message a title before proceeding.");
      return;
    }

    // Navigate to scheduling page
    router.push({
      pathname: "/schedule-message",
      params: {
        type: type || "",
        uri: uri || "",
        title,
        photoUri: photoUri || "",
        description
      },
    });
  };

  const handleSaveForLater = () => {
    console.log("Saving draft...");
    router.replace("/");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            className="w-10 h-10 justify-center items-start"
          >
            <Image
              source={{ uri: backArrowIcon }}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text
            style={{ fontFamily: "Poppins_700Bold" }}
            className="text-[#5a5a5a] text-[20px] text-center flex-1 pr-10"
          >
            Final Touches
          </Text>
        </View>

        {/* Progress Bar (80%) */}
        <View className="bg-[#2f3a561a] h-[2px] rounded-full overflow-hidden w-full">
          <View className="bg-[#2f3a56] h-full w-[80%]" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-8">
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-[#606060] text-[16px] leading-[24px] text-center"
          >
            You just did something great! Now let’s add some finishing touches.
          </Text>

          {/* Title Section */}
          <View className="gap-3">
            <Text
              style={{ fontFamily: "Poppins_600SemiBold" }}
              className="text-black text-[18px]"
            >
              Let’s give this message a title.
            </Text>
            <View className="border border-[#79747e] rounded-[10px] h-[58px] px-4 justify-center">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Message Title"
                placeholderTextColor="#49454f"
                style={{ fontFamily: "Poppins_400Regular", fontSize: 16, color: "#1a1f36" }}
                className="w-full"
              />
            </View>
          </View>

          {/* Photo Section (Conditional) */}
          {type === "image" && (
            <View className="gap-4">
              <Text
                style={{ fontFamily: "Poppins_600SemiBold" }}
                className="text-black text-[18px]"
              >
                Make it unforgettable with a photo
              </Text>

              <View className="items-center">
                {/* Image Preview */}
                <View className="w-full aspect-[4/3] rounded-[24px] overflow-hidden bg-[#f5f5f5]">
                  <Image
                    source={{ uri: photoUri || profileIllustration }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-4 mt-6">
                  <TouchableOpacity
                    onPress={handleChoosePhoto}
                    activeOpacity={0.7}
                    className="bg-[#ffe8c3] px-10 py-3 rounded-[10px]"
                  >
                    <Text
                      style={{ fontFamily: "Poppins_600SemiBold" }}
                      className="text-[#2f3a56] text-[16px]"
                    >
                      Replace
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleRemovePhoto}
                    activeOpacity={0.7}
                    className="bg-[#ffc1c1] px-10 py-3 rounded-[10px]"
                  >
                    <Text
                      style={{ fontFamily: "Poppins_600SemiBold" }}
                      className="text-[#2f3a56] text-[16px]"
                    >
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Video Section (Conditional) */}
          {type === "video" && uri && (
            <View className="gap-4">
              <Text
                style={{ fontFamily: "Poppins_600SemiBold" }}
                className="text-black text-[18px]"
              >
                Review your video message
              </Text>

              <View className="items-center">
                <View className="w-full aspect-[3/4] rounded-[24px] overflow-hidden bg-[#f5f5f5] shadow-sm">
                  <VideoView
                    player={player}
                    style={{ width: "100%", height: "100%" }}
                    nativeControls
                    contentFit="cover"
                  />
                </View>

                {/* Replay Button */}
                <TouchableOpacity
                  onPress={handleReplay}
                  activeOpacity={0.7}
                  className="bg-[#ffe8c3] px-12 py-4 rounded-[16px] mt-6 flex-row items-center gap-2"
                >
                  <Ionicons name="refresh" size={20} color="#2f3a56" />
                  <Text
                    style={{ fontFamily: "Poppins_600SemiBold" }}
                    className="text-[#2f3a56] text-[16px]"
                  >
                    Replay Video
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Description Section (Always visible) */}
          <View className="gap-4">
            <Text
              style={{ fontFamily: "Poppins_600SemiBold" }}
              className="text-black text-[18px]"
            >
              Add a few words to capture the moment.
            </Text>

            <View className="bg-[#f5f5f5] rounded-[24px] p-6">
              <TextInput
                value={description}
                onChangeText={(text) => {
                  if (text.length <= MAX_CHARS) {
                    setDescription(text);
                  }
                }}
                multiline
                placeholder="Dear Future Child,
                
If you're having a tough day, I want you to know that I'm here for you..."
                placeholderTextColor="#7a7a7a"
                style={{
                  fontFamily: "Poppins_400Regular",
                  fontSize: 16,
                  color: "#4a4a4a",
                  textAlignVertical: "top",
                  minHeight: 300,
                }}
                className="w-full"
              />
              <View className="flex-row justify-end mt-2">
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className={`text-[12px] ${description.length >= MAX_CHARS ? "text-red-500" : "text-[#7a7a7a]"}`}
                >
                  {description.length}/{MAX_CHARS}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f3f4f6] px-5 py-6 gap-4">
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          className={`h-[60px] rounded-[12px] flex-row items-center justify-center gap-4 w-full ${title.trim() ? "bg-[#2f3a56]" : "bg-[#2f3a5680]"
            }`}
        >
          <Text
            style={{ fontFamily: "Poppins_600SemiBold" }}
            className="text-white text-[16px]"
          >
            Next, Schedule Message
          </Text>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSaveForLater} activeOpacity={0.7}>
          <Text
            style={{ fontFamily: "Poppins_500Medium" }}
            className="text-[#6099ea] text-[16px] text-center"
          >
            Save For Later
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
