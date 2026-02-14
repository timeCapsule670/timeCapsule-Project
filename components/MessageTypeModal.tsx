import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTabBarHeight } from "../hooks/useTabBarHeight";
import {
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type MessageType = "video" | "audio" | "text" | "image";

interface MessageTypeOption {
    id: MessageType;
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    iconColor: string;
}

interface MessageTypeSheetProps {
    visible: boolean;
    onClose: () => void;
    selectedPrompt?: string | null;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = 480;
const SHEET_HEIGHT_WITH_PROMPT = 580;

const messageTypes: MessageTypeOption[] = [
    {
        id: "video",
        title: "Record a Video Message",
        subtitle: "Send a video that feels like a hug",
        icon: "videocam",
        iconBg: "#fff4e1",
        iconColor: "#e6a23c",
    },
    {
        id: "audio",
        title: "Record an Audio Message",
        subtitle: "Share your voice with warmth and emotion",
        icon: "mic",
        iconBg: "#e8f0ff",
        iconColor: "#4a5b87",
    },
    {
        id: "text",
        title: "Write a Text Message",
        subtitle: "Express yourself through words",
        icon: "create",
        iconBg: "#e8f4fd",
        iconColor: "#4a90d9",
    },
    {
        id: "image",
        title: "Upload an Image",
        subtitle: "Upload your favorite memory",
        icon: "image",
        iconBg: "#f3f4f6",
        iconColor: "#6b7280",
    },
];

export default function MessageTypeSheet({ visible, onClose, selectedPrompt }: MessageTypeSheetProps) {
    const router = useRouter();
    const { tabBarHeight } = useTabBarHeight();
    const [selectedType, setSelectedType] = useState<MessageType | null>(null);
    const sheetHeight = selectedPrompt ? SHEET_HEIGHT_WITH_PROMPT : SHEET_HEIGHT;
    const translateY = useRef(new Animated.Value(SHEET_HEIGHT_WITH_PROMPT)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const buttonOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Reset selection when opening
            setSelectedType(null);
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 150,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: SHEET_HEIGHT_WITH_PROMPT,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 150,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    useEffect(() => {
        // Animate button when selection changes
        Animated.timing(buttonOpacity, {
            toValue: selectedType ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [selectedType]);

    const handleSelectType = (type: MessageType) => {
        setSelectedType(type);
    };

    const handleNext = () => {
        if (!selectedType) return;
        onClose();
        router.push({
            pathname: "/recipient",
            params: {
                messageType: selectedType,
                ...(selectedPrompt ? { prompt: selectedPrompt } : {}),
            },
        });
    };

    if (!visible) return null;

    return (
        <View className="absolute inset-0" style={{ zIndex: 100 }} pointerEvents="box-none">
            {/* Overlay */}
            <Animated.View
                className="absolute inset-0 bg-black/50"
                style={{ opacity: overlayOpacity }}
                pointerEvents="auto"
            >
                <Pressable className="flex-1" onPress={onClose} />
            </Animated.View>

            {/* Sheet */}
            <Animated.View
                className="absolute left-0 right-0 bg-white rounded-t-3xl"
                style={{
                    bottom: 0,
                    height: sheetHeight,
                    transform: [{ translateY }],
                    paddingBottom: tabBarHeight,
                }}
                pointerEvents="box-none"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between px-5 pt-4 mb-3">
                    <Text
                        style={{ fontFamily: "Poppins_600SemiBold" }}
                        className="text-[#1a1f36] text-lg"
                    >
                        Select Message Type
                    </Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="w-9 h-9 rounded-full bg-[#f3f4f6] items-center justify-center"
                    >
                        <Ionicons name="close" size={20} color="#6b7280" />
                    </TouchableOpacity>
                </View>

                {/* Scrollable Content */}
                <ScrollView
                    className="flex-1 px-5"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
                >
                    {/* Selected Prompt Card */}
                    {selectedPrompt && (
                        <View
                            style={{
                                borderWidth: 1.5,
                                borderColor: "rgba(138,95,204,0.4)",
                                borderStyle: "dashed",
                                borderRadius: 14,
                                padding: 16,
                                backgroundColor: "rgba(214,199,237,0.1)",
                            }}
                        >
                            <Text
                                style={{ fontFamily: "Poppins_600SemiBold" }}
                                className="text-[#1a1f36] text-[15px] mb-1"
                            >
                                Your Selected Prompt
                            </Text>
                            <Text
                                style={{ fontFamily: "Poppins_400Regular" }}
                                className="text-[#6b7280] text-[14px] leading-[20px]"
                                numberOfLines={2}
                            >
                                {selectedPrompt}
                            </Text>
                        </View>
                    )}

                    {/* Message Type Options */}
                    {messageTypes.map((option) => {
                        const isSelected = selectedType === option.id;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                className={`flex-row items-center rounded-[14px] p-4 gap-3.5 ${isSelected ? "bg-[#4a5b87]" : "bg-[#f3f4f6]"
                                    }`}
                                onPress={() => handleSelectType(option.id)}
                                activeOpacity={0.7}
                            >
                                <View
                                    className="w-11 h-11 rounded-full items-center justify-center"
                                    style={{
                                        backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : option.iconBg,
                                    }}
                                >
                                    <Ionicons
                                        name={option.icon}
                                        size={22}
                                        color={isSelected ? "#ffffff" : option.iconColor}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text
                                        style={{ fontFamily: isSelected ? "Poppins_600SemiBold" : "Poppins_500Medium" }}
                                        className={`text-[15px] mb-0.5 ${isSelected ? "text-white" : "text-[#1a1f36]"
                                            }`}
                                    >
                                        {option.title}
                                    </Text>
                                    <Text
                                        style={{ fontFamily: "Poppins_400Regular" }}
                                        className={`text-[13px] ${isSelected ? "text-white/80" : "text-[#6b7280]"
                                            }`}
                                    >
                                        {option.subtitle}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Next Button - Only visible when option selected */}
                <Animated.View
                    className="px-5 pb-3"
                    style={{ opacity: buttonOpacity }}
                    pointerEvents={selectedType ? "auto" : "none"}
                >
                    <TouchableOpacity
                        className="bg-[#4a5b87] h-14 rounded-[14px] flex-row items-center justify-center gap-2"
                        onPress={handleNext}
                        activeOpacity={0.9}
                    >
                        <Text
                            style={{ fontFamily: "Poppins_500Medium" }}
                            className="text-white text-base"
                        >
                            Next, Recipient
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </View>
    );
}
