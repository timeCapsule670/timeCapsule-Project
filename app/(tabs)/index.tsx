import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTabBarHeight } from "../../hooks/useTabBarHeight";
import {
  messageCardBg,
  profilePicture,
  templateFirstHeartbreak,
  templateFirstHeartbreakOverlay,
  templateFirstJob,
  templateFirstJobOverlay,
  templateGraduation,
  templateGraduationOverlay,
  templateWedding
} from "../../constants/assets";
import { useTimeCapsules } from "../../context/TimeCapsuleContext";

// Skeleton Loader Component
function SkeletonLoader({ width, height, borderRadius = 8 }: { width?: number | string; height: number; borderRadius?: number }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const widthValue = width || "100%";
  const widthStyle = typeof widthValue === "string"
    ? (widthValue === "100%" ? { flex: 1 } : { width: widthValue as any })
    : { width: widthValue };

  return (
    <View style={widthStyle}>
      <Animated.View
        style={{
          height,
          borderRadius,
          backgroundColor: "#e0e0e0",
          opacity,
          width: "100%",
        }}
      />
    </View>
  );
}

const PROMPT_CARD_WIDTH = 296;
const PROMPT_CARD_GAP = 16;

export default function HomeTab() {
  const router = useRouter();
  const { timecapsules } = useTimeCapsules();
  const [isLoading, setIsLoading] = useState(true);
  const { contentBottomPadding } = useTabBarHeight();
  const suggestedScrollRef = useRef<ScrollView>(null);
  const suggestedScrollIndex = useRef(0);
  const isUserScrolling = useRef(false);
  const userScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Simulate loading time for images and data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (userScrollTimeout.current) clearTimeout(userScrollTimeout.current);
    };
  }, []);

  const suggestedPrompts = [
    {
      id: 1,
      title: "First Day of School",
      description: '"Here\'s what I want you to remember on your first day..."',
      category: "Milestone",
      categoryColor: "#9e6802",
      bgColor: "#fff4e1",
      iconBg: "rgba(253,203,110,0.5)",
      buttonColor: "#fcb32b",
      buttonText: "black",
      icon: "school" as const,
    },
    {
      id: 2,
      title: "Tough Day Support",
      description: '"When things feel overwhelming, remember this..."',
      category: "Support",
      categoryColor: "#a00000",
      bgColor: "#fdd",
      iconBg: "rgba(255,181,181,0.6)",
      buttonColor: "#ff2828",
      buttonText: "white",
      icon: "heart" as const,
    },
    {
      id: 3,
      title: "Life Lesson",
      description: '"Something important I\'ve learned that I want to share..."',
      category: "Advise",
      categoryColor: "#48277b",
      bgColor: "#efe6fe",
      iconBg: "rgba(214,199,237,0.5)",
      buttonColor: "#8a5fcc",
      buttonText: "white",
      icon: "book" as const,
    },
  ];

  // Auto-scroll Suggested prompts
  useEffect(() => {
    if (isLoading) return;
    const scrollInterval = setInterval(() => {
      if (isUserScrolling.current) return;
      suggestedScrollIndex.current += 1;
      const maxIndex = suggestedPrompts.length;
      if (suggestedScrollIndex.current >= maxIndex) {
        suggestedScrollIndex.current = 0;
      }
      const offset = suggestedScrollIndex.current * (PROMPT_CARD_WIDTH + PROMPT_CARD_GAP);
      suggestedScrollRef.current?.scrollTo({ x: offset, animated: true });
    }, 4000);
    return () => clearInterval(scrollInterval);
  }, [isLoading]);

  // Dynamic timecapsules from context


  const messageTemplates = [
    {
      id: 1,
      title: "First Heartbreak",
      category: "Emotional Support",
      image: templateFirstHeartbreak,
      overlay: templateFirstHeartbreakOverlay,
    },
    {
      id: 2,
      title: "Graduation Day",
      category: "Milestone",
      image: templateGraduation,
      overlay: templateGraduationOverlay,
    },
    {
      id: 3,
      title: "Wedding Day",
      category: "Milestone",
      image: templateWedding,
    },
    {
      id: 4,
      title: "First Job",
      category: "Life Advice",
      image: templateFirstJob,
      overlay: templateFirstJobOverlay,
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="white" translucent />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: contentBottomPadding }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-4 pt-2">

            {/* Header Skeleton */}
            <View className="flex-row gap-4 items-start mb-6">
              <SkeletonLoader width={75} height={75} borderRadius={37.5} />
              <View className="flex-1 gap-2">
                <SkeletonLoader width="60%" height={28} />
                <SkeletonLoader width="80%" height={20} />
              </View>
            </View>

            {/* Create Button Skeleton */}
            <SkeletonLoader width="100%" height={61} borderRadius={8} />
            <View className="h-6" />

            {/* Suggested for You Section Skeleton */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <SkeletonLoader width={150} height={24} />
                <SkeletonLoader width={60} height={20} />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 16 }}
              >
                {[1, 2, 3].map((i) => (
                  <View
                    key={i}
                    className="rounded-[16px] p-4"
                    style={{ width: 253 }}
                  >
                    <View className="flex-row items-center gap-2 mb-3">
                      <SkeletonLoader width={36} height={36} borderRadius={18} />
                      <SkeletonLoader width={80} height={24} borderRadius={12} />
                    </View>
                    <SkeletonLoader width="90%" height={24} borderRadius={4} />
                    <View className="h-2" />
                    <SkeletonLoader width="100%" height={20} borderRadius={4} />
                    <View className="h-2" />
                    <SkeletonLoader width="100%" height={20} borderRadius={4} />
                    <View className="h-4" />
                    <SkeletonLoader width="100%" height={40} borderRadius={8} />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Your Timecapsules Section Skeleton */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <SkeletonLoader width={160} height={24} />
                <SkeletonLoader width={60} height={20} />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 16 }}
              >
                {[1, 2].map((i) => (
                  <View key={i} style={{ width: 174 }}>
                    <SkeletonLoader width={174} height={166} borderRadius={16} />
                    <View className="p-2 bg-white">
                      <View className="flex-row items-center justify-between mb-2">
                        <SkeletonLoader width={80} height={24} />
                        <SkeletonLoader width={24} height={24} borderRadius={12} />
                      </View>
                      <SkeletonLoader width="70%" height={20} />
                      <View className="h-2" />
                      <SkeletonLoader width="100%" height={16} />
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Message Templates Section Skeleton */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <SkeletonLoader width={160} height={24} />
                <SkeletonLoader width={60} height={20} />
              </View>
              <View className="flex-row flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonLoader
                    key={i}
                    width="48%"
                    height={132}
                    borderRadius={16}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: contentBottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-4 pb-2">
          {/* Header Section */}
          <View className="flex-row gap-4 items-center mb-8">
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: profilePicture }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>
            <View className="flex-1">
              <Text
                style={{ fontFamily: "Poppins_700Bold" }}
                className="text-[#1a1f36] text-[24px] leading-[32px]"
              >
                Hi Pelumi 👋
              </Text>
              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-[#6b7280] text-[15px] leading-[22px] mt-1"
              >
                What memory will you create today?
              </Text>
            </View>
          </View>

          {/* Create Button */}
          <Link href="/recipient" asChild>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.createButton}
            >
              <Ionicons name="add" size={28} color="white" />
              <Text
                style={{ fontFamily: "Poppins_600SemiBold", color: "white", fontSize: 16 }}
              >
                Create Your First TimeCapsule
              </Text>
            </TouchableOpacity>
          </Link>

          {/* Suggested for You Section */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                style={{ fontFamily: "Poppins_700Bold" }}
                className="text-[#1a1f36] text-[20px]"
              >
                Suggested for You
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text
                  style={{ fontFamily: "Poppins_500Medium" }}
                  className="text-[#4a5b87] text-[15px]"
                >
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              ref={suggestedScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: PROMPT_CARD_GAP, paddingHorizontal: 4, paddingRight: 24, paddingVertical: 12 }}
              onScrollBeginDrag={() => {
                isUserScrolling.current = true;
                if (userScrollTimeout.current) clearTimeout(userScrollTimeout.current);
              }}
              onScrollEndDrag={() => {
                userScrollTimeout.current = setTimeout(() => {
                  isUserScrolling.current = false;
                }, 5000);
              }}
              onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                const offset = e.nativeEvent.contentOffset.x;
                suggestedScrollIndex.current = Math.round(offset / (PROMPT_CARD_WIDTH + PROMPT_CARD_GAP));
              }}
            >
              {suggestedPrompts.map((prompt) => (
                <View
                  key={prompt.id}
                  style={[
                    styles.promptCard,
                    {
                      backgroundColor: prompt.bgColor,
                      width: PROMPT_CARD_WIDTH,
                    },
                  ]}
                >
                  {/* Top accent strip */}
                  <View
                    style={{
                      height: 3,
                      backgroundColor: prompt.buttonColor,
                      borderRadius: 2,
                      marginBottom: 16,
                    }}
                  />
                  <View
                    style={[styles.categoryBadge, { backgroundColor: prompt.iconBg }]}
                    className="flex-row items-center gap-1.5 mb-3 self-start"
                  >
                    <Ionicons
                      name={prompt.icon === "school" ? "school-outline" : prompt.icon === "heart" ? "heart-outline" : "book-outline"}
                      size={14}
                      color={prompt.categoryColor}
                    />
                    <Text
                      style={{ fontFamily: "Poppins_600SemiBold", color: prompt.categoryColor, fontSize: 12 }}
                    >
                      {prompt.category}
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: "Poppins_600SemiBold" }}
                    className="text-[#1a1f36] text-[19px] leading-[26px] mb-2"
                  >
                    {prompt.title}
                  </Text>
                  <Text
                    style={{ fontFamily: "Poppins_400Regular" }}
                    className="text-[#1a1f36] text-[15px] leading-[22px] mb-5 opacity-80"
                  >
                    {prompt.description}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname: "/prompt",
                        params: {
                          promptId: String(prompt.id),
                          question: prompt.description,
                          title: prompt.title,
                        },
                      })
                    }
                    style={[
                      styles.promptButton,
                      {
                        backgroundColor: prompt.buttonColor,
                      },
                    ]}
                  >
                    <Text
                      style={{ fontFamily: "Poppins_600SemiBold", color: prompt.buttonText, fontSize: 15 }}
                    >
                      Use This Prompt
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Your Timecapsules Section */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                style={{ fontFamily: "Poppins_700Bold" }}
                className="text-[#1a1f36] text-[20px]"
              >
                Your Timecapsules
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text
                  style={{ fontFamily: "Poppins_500Medium" }}
                  className="text-[#4a5b87] text-[15px]"
                >
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 16, paddingRight: 16, paddingVertical: 8 }}
            >
              {timecapsules.map((capsule) => (
                <TouchableOpacity
                  key={capsule.id}
                  style={styles.capsuleCard}
                  activeOpacity={0.9}
                >
                  <ImageBackground
                    source={{ uri: capsule.photoUri || messageCardBg }}
                    style={styles.capsuleImageBg}
                  >
                    <LinearGradient
                      colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.4)"]}
                      style={StyleSheet.absoluteFillObject}
                    />

                    {/* Floating Type Badge */}
                    <View style={styles.floatingTypeBadge}>
                      <Ionicons
                        name={capsule.type?.toLowerCase() === "audio" ? "mic" : capsule.type?.toLowerCase() === "image" ? "image" : capsule.type?.toLowerCase() === "video" ? "videocam" : "document-text"}
                        size={12}
                        color="white"
                      />
                      <Text style={styles.floatingTypeText}>
                        {capsule.type ? capsule.type.charAt(0).toUpperCase() + capsule.type.slice(1) : ""}
                      </Text>
                    </View>

                    <View className="flex-1 items-center justify-center">
                      {capsule.type?.toLowerCase() === "audio" && (
                        <View className="items-center">
                          <View className="flex-row items-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5, 4, 3, 2].map((h, i) => (
                              <View
                                key={i}
                                style={{
                                  backgroundColor: "white",
                                  borderRadius: 2,
                                  width: 3,
                                  height: 12 + h * 4,
                                  opacity: 0.8
                                }}
                              />
                            ))}
                          </View>
                          <TouchableOpacity style={styles.playButton}>
                            <Ionicons name="play" size={24} color="white" style={{ marginLeft: 3 }} />
                          </TouchableOpacity>
                        </View>
                      )}
                      {capsule.type?.toLowerCase() === "video" && (
                        <TouchableOpacity style={styles.playButton}>
                          <Ionicons name="play" size={24} color="white" style={{ marginLeft: 3 }} />
                        </TouchableOpacity>
                      )}
                      {(capsule.type?.toLowerCase() === "image" || capsule.type?.toLowerCase() === "text") && !capsule.photoUri && (
                        <View style={styles.placeholderIconContainer}>
                          <Ionicons
                            name={capsule.type?.toLowerCase() === "image" ? "image-outline" : "document-text-outline"}
                            size={32}
                            color="white"
                          />
                        </View>
                      )}
                    </View>
                  </ImageBackground>

                  <View style={styles.capsuleDetails}>
                    <View className="flex-row items-center justify-between mb-0.5">
                      <Text
                        numberOfLines={1}
                        style={{ fontFamily: "Poppins_600SemiBold" }}
                        className="text-[#1a1f36] text-[15px] flex-1 mr-2"
                      >
                        {capsule.title}
                      </Text>
                      <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="bookmark-outline" size={18} color="#6b7280" />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center gap-1 mb-2">
                      <Ionicons name="person-circle-outline" size={14} color="#6b7280" />
                      <Text
                        numberOfLines={1}
                        style={{ fontFamily: "Poppins_400Regular" }}
                        className="text-[#6b7280] text-[12px] flex-1"
                      >
                        For {capsule.recipient}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between pt-2 border-t border-[#f3f4f6]">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
                        <Text
                          style={{ fontFamily: "Poppins_500Medium" }}
                          className="text-[#9ca3af] text-[11px]"
                        >
                          {capsule.date}
                        </Text>
                      </View>
                      <View style={styles.statusDot} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Create New Card */}
              <Link href="/recipient" asChild>
                <TouchableOpacity style={styles.createNewCard} activeOpacity={0.8}>
                  <View style={styles.addIconContainer}>
                    <Ionicons name="add" size={32} color="#4a5b87" />
                  </View>
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      color: "#1a1f36",
                      fontSize: 14,
                      textAlign: "center",
                      marginTop: 8,
                      paddingHorizontal: 16
                    }}
                  >
                    Create New
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins_400Regular",
                      color: "#6b7280",
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    Capture a memory
                  </Text>
                </TouchableOpacity>
              </Link>
            </ScrollView>
          </View>

          {/* Message Templates Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                style={{ fontFamily: "Poppins_700Bold" }}
                className="text-[#1a1f36] text-[20px]"
              >
                Message Templates
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text
                  style={{ fontFamily: "Poppins_500Medium" }}
                  className="text-[#4a5b87] text-[15px]"
                >
                  Browse
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-3">
              {messageTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateCard}
                >
                  <ImageBackground
                    source={{ uri: template.image }}
                    style={{ flex: 1 }}
                    resizeMode="cover"
                  >
                    {template.overlay && (
                      <Image
                        source={{ uri: template.overlay }}
                        style={StyleSheet.absoluteFillObject}
                        resizeMode="cover"
                      />
                    )}
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.7)"]}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View className="flex-1 justify-end p-4">
                      <Text
                        style={{ fontFamily: "Poppins_500Medium" }}
                        className="text-white text-[16px] mb-1"
                      >
                        {template.title}
                      </Text>
                      <Text
                        style={{ fontFamily: "Poppins_400Regular" }}
                        className="text-white text-[12px] leading-[18px]"
                      >
                        {template.category}
                      </Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
  },
  emoji: {
    width: 26,
    height: 26,
  },
  createButton: {
    backgroundColor: "#4a5b87",
    height: 60,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 28,
    shadowColor: "#4a5b87",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  profileImageContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  promptCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  promptIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  promptButton: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  capsuleCard: {
    width: 200,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  capsuleImageBg: {
    height: 200,
    padding: 12,
  },
  floatingTypeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    zIndex: 10,
  },
  floatingTypeText: {
    color: "white",
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
  },
  playButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  placeholderIconContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  capsuleDetails: {
    padding: 16,
    backgroundColor: "white",
  },
  statusDot: {
    width: 6,
    height: 6,
    backgroundColor: "#34c759",
    borderRadius: 3,
  },
  createNewCard: {
    width: 200,
    height: 310,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e9d5ff",
    backgroundColor: "#f9f5ff",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    overflow: "hidden",
  },
  addIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  templateCard: {
    width: "48%",
    height: 160,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
});
