import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateTextMessage() {
    const router = useRouter();
    const { prompt } = useLocalSearchParams<{ prompt: string }>();
    const [text, setText] = useState(prompt || "");

    const handleBack = () => {
        router.back();
    };

    const handleNext = () => {
        if (text.trim()) {
            router.push({
                pathname: "/final-touches",
                params: { type: "text", content: text }
            });
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-white">
            {/* Header */}
            <View className="px-4 pt-10 pb-4 border-b border-[#f3f4f6]">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity onPress={handleBack} className="w-6 h-6 items-center justify-center">
                        <Ionicons name="arrow-back" size={24} color="#777" />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: "Poppins_700Bold" }} className="text-[#5a5a5a] text-[22px] text-center flex-1 pr-6">
                        Write Text Message
                    </Text>
                </View>
                <View className="bg-[#2f3a561a] h-[2px] rounded-full overflow-hidden w-full">
                    <View className="bg-[#2f3a56] h-full w-[50%]" />
                </View>
            </View>

            <ScrollView className="flex-1 px-4 pt-6">
                <Text style={{ fontFamily: "Poppins_400Regular" }} className="text-[#606060] text-[16px] text-center mb-10">
                    Share your thoughts, stories, or advice through words.
                </Text>

                <TextInput
                    multiline
                    placeholder="Start writing..."
                    value={text}
                    onChangeText={setText}
                    style={{ fontFamily: "Poppins_400Regular", fontSize: 18, minHeight: 200, textAlignVertical: "top" }}
                    className="border border-[#f3f4f6] rounded-[16px] p-6 text-[#1a1f36]"
                />
            </ScrollView>

            <View className="px-4 py-6 border-t border-[#f3f4f6]">
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={!text.trim()}
                    className={`h-[60px] rounded-[8px] flex-row items-center justify-center gap-4 ${text.trim() ? "bg-[#2f3a56]" : "bg-[#2f3a5680]"}`}
                >
                    <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-white text-[16px]">
                        Next, Final Touches
                    </Text>
                    <Ionicons name="arrow-forward" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
