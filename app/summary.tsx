import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const prompts = [
  "How do you think your childhood shaped who you are today?",
  "What's one piece of advice you wish you'd received as a child?",
  "What makes you proud of who you've become?",
  "What's a memory you hope your child will cherish forever?",
  "If you could tell your younger self one thing, what would it be?",
  "What's the most valuable lesson life has taught you so far?",
  "What's a family tradition you want to pass down?",
];

const messageTypes = [
  {
    id: "video",
    title: "Record a Video Message",
    description: "Send a video that feels like a hug",
    icon: "videocam",
    color: "#fdcb6e",
    route: "/create-video",
  },
  {
    id: "audio",
    title: "Record an Audio Message",
    description: "Share your voice with warmth and emotion",
    icon: "mic",
    color: "#a3c4f3",
    route: "/create-audio",
  },
  {
    id: "text",
    title: "Write a Text Message",
    description: "Express yourself through words",
    icon: "pencil",
    color: "#d6c7ed",
    route: "/create-text",
  },
  {
    id: "image",
    title: "Upload an Image",
    description: "Upload your favorite memory",
    icon: "image",
    color: "#9daaca",
    route: "/create-image",
  },
];

export default function SummaryPage() {
  const router = useRouter();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  const handleRefreshPrompt = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * prompts.length);
    } while (newIndex === currentPromptIndex && prompts.length > 1);
    setCurrentPromptIndex(newIndex);
  };

  const handleUsePrompt = () => {
    console.log("Using prompt:", prompts[currentPromptIndex]);
    // Navigate to text message creation with the prompt as initial content
    // router.push({ pathname: "/create-text", params: { prompt: prompts[currentPromptIndex] } });
  };

  const handleMessageType = (route: string) => {
    // Extract type from route (e.g., "/create-video" -> "video")
    const type = route.replace("/create-", "");
    console.log("Navigating to recipient selection for:", type);
    // Navigate to recipient selection page first, passing the type
    router.push({
      pathname: "/recipient",
      params: { type }
    });
  };

  const handleSkip = () => {
    router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-10">
          {/* Logo */}
          <View className="h-[97px] w-full items-center justify-center">
            <Image
              source={require("../assets/images/logo.png")}
              style={{ height: 97, width: 200 }}
              resizeMode="contain"
            />
          </View>

          {/* Welcome Text */}
          <View className="items-center gap-2">
            <Text
              style={{ fontFamily: "Poppins_700Bold" }}
              className="text-[#4a5b87] text-[32px] leading-[48px] text-center"
            >
              Your Time Capsule is ready!
            </Text>
            <Text
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-black text-[18px] leading-[27px] text-center"
            >
              Let’s create your first message!
            </Text>
          </View>

          {/* Inspiration Prompts Section */}
          <View className="w-full gap-4">
            <Text
              style={{ fontFamily: "Poppins_500Medium" }}
              className="text-[#5a5a5a] text-[18px] leading-[27px]"
            >
              Need Inspiration? Try one of these prompts
            </Text>

            <View
              className="rounded-[16px] p-6 gap-6"
              style={{
                backgroundColor: "rgba(214, 199, 237, 0.1)",
                borderWidth: 1,
                borderColor: "#8a5fcc",
                borderStyle: "dashed",
              }}
            >
              <View className="flex-row items-center justify-between">
                <Ionicons name="bulb" size={24} color="#8a5fcc" />
                <TouchableOpacity onPress={handleRefreshPrompt}>
                  <Ionicons name="refresh" size={24} color="#8a5fcc" />
                </TouchableOpacity>
              </View>

              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-[#4a4a4a] text-[16px] leading-[21px]"
              >
                {prompts[currentPromptIndex]}
              </Text>

              <TouchableOpacity
                onPress={handleUsePrompt}
                activeOpacity={0.8}
                className="bg-[#b093dc] h-[40px] rounded-[8px] items-center justify-center w-full"
              >
                <Text
                  style={{ fontFamily: "Poppins_500Medium" }}
                  className="text-white text-[16px]"
                >
                  Use Prompt
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Message Type Selection Section */}
          <View className="w-full gap-4">
            <View className="flex-row items-center justify-between">
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-[#5a5a5a] text-[18px] leading-[27px]"
              >
                Select Message Type
              </Text>
              <TouchableOpacity style={{ transform: [{ rotate: "45deg" }] }}>
                <Ionicons name="add-circle-outline" size={24} color="#5a5a5a" />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              {messageTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => handleMessageType(type.route)}
                  activeOpacity={0.8}
                  className="bg-[#f5f5f5] rounded-[8px] p-[18px] flex-row items-center gap-4"
                >
                  <View
                    className="w-[32px] h-[32px] rounded-full items-center justify-center"
                    style={{ backgroundColor: type.color }}
                  >
                    <Ionicons name={type.icon as any} size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: "Poppins_700Bold" }}
                      className="text-[#2f3a56] text-[16px] leading-[21px]"
                    >
                      {type.title}
                    </Text>
                    <Text
                      style={{ fontFamily: "Poppins_400Regular" }}
                      className="text-[#5a5a5a] text-[12px] leading-[18px]"
                    >
                      {type.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Skip Link */}
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} className="mt-4">
            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[#4a4a4a] text-[14px] leading-[21px] text-center"
            >
              Skip
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

