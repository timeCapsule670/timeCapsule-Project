import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  profileIllustration,
} from "../constants/assets";

export default function ProfileInformation() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const handleBack = () => {
    // @ts-ignore
    const canGoBack = typeof router.canGoBack === "function" ? (router as any).canGoBack() : false;
    if (canGoBack) {
      router.back();
    } else {
      router.replace("/sign-up");
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera permissions to take a profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImageUri(result.assets[0].uri);
    }
  };

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need gallery permissions to choose a profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      mediaTypes: ['images'],
    });

    if (!result.canceled) {
      setProfileImageUri(result.assets[0].uri);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);

    if (event.type === "set" || Platform.OS === "ios") {
      const formattedDate = currentDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
      setBirthday(formattedDate);
    }
  };

  const handleOpenDatePicker = () => {
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      {/* Header */}
      <View className="bg-white border-b border-[#f3f4f6] pt-10 pb-4 px-4">
        <View className="flex-row items-center gap-[42px] px-2">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            className="w-6 h-6 justify-center items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#777" />
          </TouchableOpacity>
          <Text
            style={{ fontFamily: "Poppins_700Bold" }}
            className="text-[#5a5a5a] text-[22px] leading-[33px]"
          >
            Tell Us About Yourself
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-10">
          {/* First Name Field */}
          <View className="gap-2">
            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[#5a5a5a] text-[16px] leading-[21px]"
            >
              My First Name Is:
            </Text>
            <View className="border border-[#79747e] rounded-[4px] h-[56px] px-4 justify-center">
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder=""
                style={{ fontFamily: "Poppins_400Regular", fontSize: 16, color: "#49454f" }}
                className="w-full"
              />
            </View>
          </View>

          {/* Last Name Field */}
          <View className="gap-2">
            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[#5a5a5a] text-[16px] leading-[21px]"
            >
              My Last Name Is:
            </Text>
            <View className="border border-[#79747e] rounded-[4px] h-[56px] px-4 justify-center">
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder=""
                style={{ fontFamily: "Poppins_400Regular", fontSize: 16, color: "#49454f" }}
                className="w-full"
              />
            </View>
          </View>

          {/* Birthday Field */}
          <View className="gap-2">
            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[#5a5a5a] text-[16px] leading-[21px]"
            >
              My Birthday Is:
            </Text>
            <View className="flex-row gap-4 items-center">
              <View className="flex-1 border border-[#79747e] rounded-[4px] h-[56px] px-4 justify-center">
                <TextInput
                  value={birthday}
                  onChangeText={setBirthday}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#49454f"
                  style={{ fontFamily: "Poppins_400Regular", fontSize: 16, color: "#49454f" }}
                  className="w-full"
                />
              </View>
              <TouchableOpacity
                onPress={handleOpenDatePicker}
                activeOpacity={0.7}
                className="bg-white rounded-[8px] p-4 items-center justify-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                  elevation: 4,
                }}
              >
                <Ionicons name="calendar-outline" size={24} color="#49454f" />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Profile Picture Upload Section */}
          <View className="gap-4">
            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[#5a5a5a] text-[16px] leading-[21px]"
            >
              Let's Upload A Profile Picture (Optional)
            </Text>
            <View className="gap-6">
              {/* Illustration / Preview */}
              <View className="h-[232px] rounded-[16px] overflow-hidden bg-[#f3f4f6]">
                <Image
                  source={{ uri: profileImageUri || profileIllustration }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>

              {/* Upload Buttons */}
              <View className="flex-row gap-6 justify-center">
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                  className="bg-[#a3c4f3] rounded-[8px] px-4 py-2"
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
                  className="bg-[#a3c4f3] rounded-[8px] px-4 py-2"
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

          {/* Next Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            className="bg-[#2f3a56] h-[60px] rounded-[8px] flex-row items-center justify-center gap-4 px-4"
            onPress={() => {
              router.push("/category");
            }}
          >
            <Text
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-white text-[16px]"
            >
              Next
            </Text>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

