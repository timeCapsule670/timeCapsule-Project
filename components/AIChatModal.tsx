import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sparkles } from "lucide-react-native";

interface Message {
    id: string;
    text: string;
    sender: "bot" | "user";
}

interface AIChatModalProps {
    visible: boolean;
    onClose: () => void;
}

const WELCOME_MESSAGE: Message = {
    id: "welcome",
    text: "Hi! 👋 I'm here to help you craft the perfect prompt for your time capsule. Tell me what's on your mind, or pick a suggestion below.",
    sender: "bot",
};

const SUGGESTION_CHIPS = [
    "Help me express love",
    "Milestone advice",
    "Life lessons for my child",
];

const MOCK_RESPONSES = [
    "That's a beautiful thought! Here's a prompt you could try:\n\n\"What's the one thing you want your child to know about how much they changed your life?\"",
    "I love that idea. How about this prompt:\n\n\"If you could relive one moment with your child, which would it be and why?\"",
    "Here's something that might resonate:\n\n\"What values do you hope your child carries into adulthood, and how have you tried to model them?\"",
    "That's so meaningful. Try this one:\n\n\"What's a lesson life taught you the hard way that you want to make easier for your child?\"",
];

function TypingIndicator() {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = (dot: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
                ])
            );
        const a1 = animate(dot1, 0);
        const a2 = animate(dot2, 150);
        const a3 = animate(dot3, 300);
        a1.start();
        a2.start();
        a3.start();
        return () => { a1.stop(); a2.stop(); a3.stop(); };
    }, []);

    const dotStyle = (anim: Animated.Value) => ({
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: "#9ca3af",
        marginHorizontal: 2,
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }],
    });

    return (
        <View style={{ alignSelf: "flex-start", maxWidth: "75%", marginBottom: 12 }}>
            <View
                style={{
                    backgroundColor: "#f3f4f6",
                    borderRadius: 16,
                    borderTopLeftRadius: 4,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <Animated.View style={dotStyle(dot1)} />
                <Animated.View style={dotStyle(dot2)} />
                <Animated.View style={dotStyle(dot3)} />
            </View>
        </View>
    );
}

export default function AIChatModal({ visible, onClose }: AIChatModalProps) {
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const flatListRef = useRef<FlatList>(null);
    const responseIndex = useRef(0);

    const scrollToBottom = () => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const sendMessage = (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: text.trim(),
            sender: "user",
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText("");
        setShowSuggestions(false);
        setIsTyping(true);
        scrollToBottom();

        // Mock AI response after delay
        setTimeout(() => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: MOCK_RESPONSES[responseIndex.current % MOCK_RESPONSES.length],
                sender: "bot",
            };
            responseIndex.current += 1;
            setIsTyping(false);
            setMessages((prev) => [...prev, botMsg]);
            scrollToBottom();
        }, 1500);
    };

    const handleClose = () => {
        onClose();
        // Reset state after modal closes
        setTimeout(() => {
            setMessages([WELCOME_MESSAGE]);
            setInputText("");
            setIsTyping(false);
            setShowSuggestions(true);
            responseIndex.current = 0;
        }, 300);
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isBot = item.sender === "bot";
        return (
            <View
                style={{
                    alignSelf: isBot ? "flex-start" : "flex-end",
                    maxWidth: "80%",
                    marginBottom: 12,
                }}
            >
                {isBot && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4, gap: 6 }}>
                        <View
                            style={{
                                width: 22,
                                height: 22,
                                borderRadius: 11,
                                backgroundColor: "#4a5b87",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Sparkles size={12} color="#ffffff" />
                        </View>
                        <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 12, color: "#6b7280" }}>
                            AI Assistant
                        </Text>
                    </View>
                )}
                <View
                    style={{
                        backgroundColor: isBot ? "#f3f4f6" : "#4a5b87",
                        borderRadius: 16,
                        borderTopLeftRadius: isBot ? 4 : 16,
                        borderTopRightRadius: isBot ? 16 : 4,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: "Poppins_400Regular",
                            fontSize: 14,
                            lineHeight: 21,
                            color: isBot ? "#1a1f36" : "#ffffff",
                        }}
                    >
                        {item.text}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: "#ffffff" }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={0}
            >
                {/* Header */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 20,
                        paddingTop: insets.top + 8,
                        paddingBottom: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: "#f3f4f6",
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <View
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: "rgba(74,91,135,0.1)",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Sparkles size={20} color="#4a5b87" />
                        </View>
                        <View>
                            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 17, color: "#1a1f36" }}>
                                AI Prompt Assistant
                            </Text>
                            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: "#6b7280" }}>
                                Craft your perfect prompt
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={handleClose}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: "#f3f4f6",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons name="close" size={20} color="#6b7280" />
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 12 }}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                        <>
                            {/* Suggestion Chips */}
                            {showSuggestions && (
                                <View style={{ marginTop: 4, marginBottom: 12, gap: 8 }}>
                                    {SUGGESTION_CHIPS.map((chip) => (
                                        <TouchableOpacity
                                            key={chip}
                                            activeOpacity={0.8}
                                            onPress={() => sendMessage(chip)}
                                            style={{
                                                alignSelf: "flex-start",
                                                borderWidth: 1,
                                                borderColor: "rgba(74,91,135,0.25)",
                                                borderRadius: 20,
                                                paddingHorizontal: 16,
                                                paddingVertical: 10,
                                                backgroundColor: "rgba(74,91,135,0.05)",
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontFamily: "Poppins_500Medium",
                                                    fontSize: 14,
                                                    color: "#4a5b87",
                                                }}
                                            >
                                                {chip}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            {isTyping && <TypingIndicator />}
                        </>
                    }
                />

                {/* Input Bar */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "flex-end",
                        paddingHorizontal: 16,
                        paddingTop: 12,
                        paddingBottom: insets.bottom + 14,
                        borderTopWidth: 1,
                        borderTopColor: "#e5e7eb",
                        backgroundColor: "#fafafa",
                        gap: 10,
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#ffffff",
                            borderRadius: 22,
                            borderWidth: 1,
                            borderColor: "#e5e7eb",
                            paddingHorizontal: 16,
                            paddingVertical: Platform.OS === "ios" ? 10 : 2,
                            minHeight: 44,
                            maxHeight: 120,
                        }}
                    >
                        <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Tell me what's on your mind..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            style={{
                                flex: 1,
                                fontFamily: "Poppins_400Regular",
                                fontSize: 15,
                                color: "#1a1f36",
                                lineHeight: 21,
                                maxHeight: 100,
                                paddingTop: 0,
                                paddingBottom: 0,
                                textAlignVertical: "center",
                            }}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={() => sendMessage(inputText)}
                        activeOpacity={0.85}
                        disabled={!inputText.trim()}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: inputText.trim() ? "#4a5b87" : "#e5e7eb",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 1,
                        }}
                    >
                        <Ionicons name="send" size={18} color={inputText.trim() ? "#ffffff" : "#9ca3af"} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
