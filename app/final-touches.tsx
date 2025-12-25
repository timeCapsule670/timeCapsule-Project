import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { profileIllustration } from "./_constants/assets";

export default function FinalTouches() {
  const router = useRouter();
  const { type, uri } = useLocalSearchParams<{ type: string; uri: string }>();
  
  const [title, setTitle] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleBack = () => {
    // @ts-ignore
    const canGoBack = typeof router.canGoBack === "function" ? (router as any).canGoBack() : false;
    if (canGoBack) {
      router.back();
    } else {
      router.replace("/summary");
    }
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
        photoUri: photoUri || "" 
      },
    });
  };

  const handleSaveForLater = () => {
    console.log("Saving draft...");
    router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
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
            Final Touches
          </Text>
        </View>
        {/* Progress Bar (75%) */}
        <View className="bg-[#2f3a561a] h-[2px] rounded-full overflow-hidden w-full">
          <View className="bg-[#2f3a56] h-full w-[75%]" />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-10">
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-[#606060] text-[16px] leading-[21px] text-center px-4"
          >
            You just did something great! Now let’s add some finishing touches.
          </Text>

          {/* Title Section */}
          <View className="gap-2">
            <Text
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-black text-[18px] leading-[27px]"
            >
              Let’s give this message a title.
            </Text>
            <View className="border border-[#79747e] rounded-[4px] h-[56px] px-4 justify-center">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Message Title"
                placeholderTextColor="#49454f"
                style={{ fontFamily: "Poppins_400Regular", fontSize: 16, color: "#49454f" }}
                className="w-full"
              />
            </View>
          </View>

          {/* Photo Section */}
          <View className="gap-4">
            <Text
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-black text-[18px] leading-[27px]"
            >
              Spice it up with a photo.
            </Text>
            <View className="gap-6">
              {/* Image Preview */}
              <View className="h-[232px] overflow-hidden items-center justify-center relative">
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    style={{ width: "150%", height: "150%" }}
                    resizeMode="contain"
                  />
                ) : (
                  <View className="items-center">
                    <Image
                      source={{ uri: profileIllustration }}
                      style={{ width: 200, height: 200 }}
                      resizeMode="contain"
                    />
                    
                  </View>
                )}
              </View>

              {/* Upload Buttons */}
              <View className="flex-row gap-6 justify-center">
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                  className="bg-[#a3c4f3] rounded-[8px] px-6 py-3"
                >
                  <Text
                    style={{ fontFamily: "Poppins_500Medium" }}
                    className="text-black text-[16px]"
                  >
                    Take a Photo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleChoosePhoto}
                  activeOpacity={0.7}
                  className="bg-[#a3c4f3] rounded-[8px] px-6 py-3"
                >
                  <Text
                    style={{ fontFamily: "Poppins_500Medium" }}
                    className="text-black text-[16px]"
                  >
                    Choose a Photo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f3f4f6] px-4 py-6 gap-4">
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          className={`h-[60px] rounded-[8px] flex-row items-center justify-center gap-4 w-full ${
            title.trim() ? "bg-[#2f3a56]" : "bg-[#2f3a5680]"
          }`}
        >
          <Text
            style={{ fontFamily: "Poppins_500Medium" }}
            className="text-white text-[16px]"
          >
            Next, Schedule Message
          </Text>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSaveForLater} activeOpacity={0.7}>
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-[#6099ea] text-[16px] text-center"
          >
            Save For Later
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

