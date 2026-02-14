import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTabBarHeight } from "../../hooks/useTabBarHeight";
import { Bookmark, GraduationCap, Heart, Lightbulb, RefreshCw, Star, HandHeart, Compass, PartyPopper, Sparkles } from "lucide-react-native";
import { usePromptSheet } from "../../context/PromptContext";
import AIChatModal from "../../components/AIChatModal";

const categoryChips = [
  { id: "favorites", label: "Favorites", icon: Star, color: "#f59e0b" },
  { id: "affirmations", label: "Affirmations", icon: Heart, color: "#ef4444" },
  { id: "milestones", label: "Milestones", icon: GraduationCap, color: "#6366f1" },
  { id: "emotional-support", label: "Emotional Support", icon: HandHeart, color: "#f97316" },
  { id: "life-advice", label: "Life Advice", icon: Compass, color: "#14b8a6" },
  { id: "celebration", label: "Celebration", icon: PartyPopper, color: "#a855f7" },
];

const promptsByCategory: Record<string, string[]> = {
  favorites: [
    "What makes your child uniquely special to you?",
    "What's one thing you admire about your child?",
    "What's something you hope your child never forgets about themselves?",
    "When was a moment you felt incredibly proud of your child?",
    "If your love was a message in a bottle, what would it say?",
    "What are the words you needed to hear as a child that you want to pass on?",
  ],
  affirmations: [
    "What makes your child uniquely special to you?",
    "What's one thing you admire about your child?",
    "What's something you hope your child never forgets about themselves?",
    "When was a moment you felt incredibly proud of your child?",
    "If your love was a message in a bottle, what would it say?",
    "What are the words you needed to hear as a child that you want to pass on?",
  ],
  milestones: [
    "What was the happiest day you've spent together as a family?",
    "What milestone of your child's made you cry happy tears?",
    "Describe the moment your child first said 'I love you.'",
    "What was the first big thing your child ever achieved?",
    "What tradition do you hope your child will continue?",
    "What was the proudest moment of your parenting journey?",
  ],
  "emotional-support": [
    "What would you tell your child on their hardest day?",
    "How do you want your child to handle failure?",
    "What's one lesson about resilience you want to pass on?",
    "If your child ever feels alone, what should they remember?",
    "What do you wish someone had told you during tough times?",
    "How would you comfort your child through their first heartbreak?",
  ],
  "life-advice": [
    "What is the most important value you want your child to live by?",
    "What money lesson do you wish you'd learned earlier?",
    "What's the best career advice you've ever received?",
    "How do you define success, and how should your child?",
    "What's one relationship lesson that changed your life?",
    "What would you tell your child about choosing their own path?",
  ],
  celebration: [
    "What's a funny memory with your child that always makes you laugh?",
    "Describe the joy you felt the day your child was born.",
    "What's a silly thing your child does that makes your heart full?",
    "What achievement of your child's deserves a standing ovation?",
    "What's the best surprise your child ever gave you?",
    "Write a 'congratulations in advance' for something you know they'll achieve.",
  ],
};

export default function PromptsTab() {
  const { scrollContentPadding } = useTabBarHeight();
  const { openSheetWithPrompt } = usePromptSheet();
  const [activeCategory, setActiveCategory] = useState("affirmations");
  const [favoritePrompts, setFavoritePrompts] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);

  const toggleFavorite = (prompt: string) => {
    setFavoritePrompts((prev) =>
      prev.includes(prompt) ? prev.filter((p) => p !== prompt) : [...prev, prompt]
    );
  };

  const currentPrompts = activeCategory === "favorites"
    ? favoritePrompts
    : (promptsByCategory[activeCategory] || []);
  const activeChip = categoryChips.find((c) => c.id === activeCategory);
  const buttonColor = activeChip?.color || "#4a5b87";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: scrollContentPadding(120) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Header — centered, clear hierarchy */}
        <View className="px-5 pt-4">
          <Text
            style={{ fontFamily: "Poppins_700Bold" }}
            className="text-[#1a1f36] text-[24px] leading-[32px] text-center"
          >
            Prompts to Help You
          </Text>
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-[#6b7280] text-[15px] leading-[22px] text-center mt-1"
          >
            Share your Story
          </Text>
        </View>

        {/* Daily Prompt — Hero card, most prominent element on screen */}
        <View className="px-5 mt-8">
          <View
            className="rounded-[16px] px-6 py-5"
            style={{
              backgroundColor: "rgba(214,199,237,0.15)",
              borderWidth: 1,
              borderColor: "rgba(138,95,204,0.3)",
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Lightbulb size={22} color="#1a1f36" />
                <Text style={{ fontFamily: "Poppins_700Bold" }} className="text-[#1a1f36] text-[16px]">
                  Daily Prompt
                </Text>
              </View>
              <TouchableOpacity activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <RefreshCw size={20} color="#4a5b87" />
              </TouchableOpacity>
            </View>
            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[#1a1f36] text-[16px] leading-[24px] mt-3"
            >
              How do you think your childhood shaped who you are today?
            </Text>
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity activeOpacity={0.85} className="flex-1 bg-[#8a5fcc] rounded-[12px] px-4 py-3 items-center">
                <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-white text-[15px]">
                  Start Recording
                </Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} className="bg-[#f3f4f6] rounded-[12px] px-3 items-center justify-center" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Bookmark size={20} color="#1a1f36" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Categories — compact chips, clear section header */}
        <View className="px-5 mt-8">
          <Text style={{ fontFamily: "Poppins_700Bold" }} className="text-[#1a1f36] text-[20px] leading-[28px]">
            Let's spark a memory
          </Text>
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-[#6b7280] text-[14px] leading-[20px] mt-1"
          >
            Choose a category then your prompt to answer it in your own voice.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            <View className="flex-row gap-3">
              {categoryChips.map((chip) => {
                const Icon = chip.icon;
                const isActive = chip.id === activeCategory;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    activeOpacity={0.85}
                    onPress={() => setActiveCategory(chip.id)}
                    className={`px-4 py-2 rounded-[9999px] flex-row items-center gap-2 ${isActive ? "bg-[#4a5b87]" : "bg-[#f3f4f6]"
                      }`}
                  >
                    <Icon size={16} color={isActive ? "#ffffff" : chip.color} />
                    <Text
                      style={{ fontFamily: "Poppins_500Medium" }}
                      className={isActive ? "text-white text-[14px]" : "text-[#1a1f36] text-[14px]"}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Prompt Cards Grid — simplified, no redundant wrappers or tags */}
        <View className="px-5 mt-8">
          <View className="flex-row flex-wrap gap-3">
            {currentPrompts.map((prompt, index) => (
              <View
                key={`${activeCategory}-${index}`}
                className="rounded-[16px] px-4 py-4 w-[48%]"
                style={{
                  backgroundColor: "#ffffff",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 3,
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: "#f3f4f6",
                }}
              >
                <View className="flex-row items-center justify-end mb-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => toggleFavorite(prompt)}
                  >
                    <Bookmark
                      size={16}
                      color={favoritePrompts.includes(prompt) ? "#f59e0b" : "#9ca3af"}
                      fill={favoritePrompts.includes(prompt) ? "#f59e0b" : "none"}
                    />
                  </TouchableOpacity>
                </View>
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="text-[#1a1f36] text-[14px] leading-[20px] mb-4"
                >
                  {prompt}
                </Text>
                <TouchableOpacity activeOpacity={0.85} style={{ backgroundColor: buttonColor }} className="rounded-[10px] px-4 py-2 items-center" onPress={() => openSheetWithPrompt(prompt)}>
                  <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-white text-[14px]">
                    Record
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating AI Chat Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setShowChat(true)}
        style={{
          position: "absolute",
          bottom: scrollContentPadding(56),
          right: 16,
          width: 60,
          height: 60,
          borderRadius: 30,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 8,
          zIndex: 999,
        }}
      >
        <Image
          source={require("../../assets/assistance.gif")}
          style={{ width: 56, height: 56, borderRadius: 30 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* AI Chat Modal */}
      <AIChatModal visible={showChat} onClose={() => setShowChat(false)} />
    </SafeAreaView>
  );
}

