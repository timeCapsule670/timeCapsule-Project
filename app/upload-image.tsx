import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { backArrowIcon, profileIllustration } from "../constants/assets";
import { useTabBarHeight } from "../hooks/useTabBarHeight";

export default function UploadImageScreen() {
    const router = useRouter();
    const { scrollContentPadding } = useTabBarHeight();
    const { messageType } = useLocalSearchParams<{ messageType: string }>();
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    const handleBack = () => {
        router.back();
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
        if (!photoUri) {
            Alert.alert("Image Required", "Please select an image before proceeding.");
            return;
        }
        router.push({
            pathname: "/final-touches",
            params: { type: messageType || "image", uri: photoUri }
        });
    };

    const handleSaveForLater = () => {
        console.log("Save for later pressed");
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
                        Upload an Image
                    </Text>
                </View>

                {/* Progress Bar */}
                <View className="bg-[#2f3a561a] h-[2px] rounded-full overflow-hidden w-full">
                    <View className="bg-[#2f3a56] h-full w-[45%]" />
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: scrollContentPadding(120) }}
                showsVerticalScrollIndicator={false}
            >
                <Text
                    style={{ fontFamily: "Poppins_400Regular" }}
                    className="text-[#5a5a5a] text-[16px] leading-[24px] text-center mb-4"
                >
                    Photos help tell your story. Choose one that captures the moment.
                </Text>

                <View className="items-center justify-center py-10">
                    <Image
                        source={{ uri: photoUri || profileIllustration }}
                        style={{ width: photoUri ? "100%" : 280, height: 220, borderRadius: photoUri ? 12 : 0 }}
                        resizeMode="contain"
                    />
                    <Text
                        style={{ fontFamily: "Poppins_700Bold" }}
                        className="text-[#2f3a56] text-[28px] text-center mt-6 px-4"
                    >
                        {photoUri ? "Looks perfect!" : "Upload the perfect memory"}
                    </Text>
                </View>

                <View className="flex-row gap-4 mt-8">
                    <TouchableOpacity
                        onPress={handleTakePhoto}
                        activeOpacity={0.8}
                        className="flex-1 bg-[#b3d1ff] h-[50px] rounded-[10px] items-center justify-center shadow-sm"
                    >
                        <Text
                            style={{ fontFamily: "Poppins_600SemiBold" }}
                            className="text-[#2f3a56] text-[14px]"
                        >
                            Take a Photo
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleChoosePhoto}
                        activeOpacity={0.8}
                        className="flex-1 bg-[#b3d1ff] h-[50px] rounded-[10px] items-center justify-center shadow-sm"
                    >
                        <Text
                            style={{ fontFamily: "Poppins_600SemiBold" }}
                            className="text-[#2f3a56] text-[14px]"
                        >
                            Choose a Photo
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Footer */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-6 gap-4">
                <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.9}
                    disabled={!photoUri}
                    className={`h-[60px] rounded-[10px] flex-row items-center justify-center gap-4 w-full ${photoUri ? "bg-[#2f3a56]" : "bg-[#2f3a5680]"
                        }`}
                >
                    <Text
                        style={{ fontFamily: "Poppins_600SemiBold" }}
                        className="text-white text-[16px]"
                    >
                        Next, Final Touches
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
