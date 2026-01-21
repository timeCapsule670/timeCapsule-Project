import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  messageCardBg,
  plusIcon,
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

export default function HomeTab() {
  const { timecapsules } = useTimeCapsules();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for images and data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
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
    },
  ];

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
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <StatusBar barStyle="dark-content" />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-6">


          {/* Header Section */}
          <View className="flex-row gap-4 items-center mt-2 mb-10">
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
              activeOpacity={0.9}
              style={styles.createButton}
            >
              <Image
                source={{ uri: plusIcon }}
                style={styles.plusIcon}
                resizeMode="contain"
              />
              <Text
                style={{ fontFamily: "Poppins_500Medium", color: "white", fontSize: 16 }}
              >
                Create Your First TimeCapsule
              </Text>
            </TouchableOpacity>
          </Link>

          {/* Suggested for You Section */}
          <View className="mb-10">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                style={{ fontFamily: "Poppins_600SemiBold" }}
                className="text-[#1a1f36] text-[18px]"
              >
                Suggested for You
              </Text>
              <TouchableOpacity>
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="text-[#1d6ee1] text-[16px]"
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
              {suggestedPrompts.map((prompt) => (
                <View
                  key={prompt.id}
                  style={[styles.promptCard, { backgroundColor: prompt.bgColor }]}
                >
                  <View className="flex-row items-center gap-1 mb-2">
                    <View
                      style={[styles.promptIconBg, { backgroundColor: prompt.iconBg }]}
                    >
                      <Ionicons name="school-outline" size={20} color={prompt.categoryColor} />
                    </View>
                    <View
                      style={[styles.categoryBadge, { backgroundColor: prompt.iconBg }]}
                    >
                      <Text
                        style={{ fontFamily: "Poppins_500Medium", color: prompt.categoryColor, fontSize: 14 }}
                      >
                        {prompt.category}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ fontFamily: "Poppins_500Medium" }}
                    className="text-[#2f3a56] text-[18px] leading-[27px] mb-2"
                  >
                    {prompt.title}
                  </Text>
                  <Text
                    style={{ fontFamily: "Poppins_400Regular" }}
                    className="text-[#2f3a56] text-[16px] leading-[21px] mb-4"
                  >
                    {prompt.description}
                  </Text>
                  <TouchableOpacity
                    style={[styles.promptButton, { backgroundColor: prompt.buttonColor }]}
                  >
                    <Text
                      style={{ fontFamily: "Poppins_500Medium", color: prompt.buttonText, fontSize: 16 }}
                    >
                      Use This Prompt
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Your Timecapsules Section */}
          <View className="mb-10">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                style={{ fontFamily: "Poppins_600SemiBold" }}
                className="text-[#1a1f36] text-[18px]"
              >
                Your Timecapsules
              </Text>
              <TouchableOpacity>
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="text-[#1d6ee1] text-[16px]"
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
                    <View className="flex-row items-center justify-between mb-1">
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
                  <LinearGradient
                    colors={["#f5f3ff", "#ede9fe"]}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.addIconContainer}>
                    <Ionicons name="add" size={32} color="#6738af" />
                  </View>
                  <Text
                    style={{
                      fontFamily: "Poppins_600SemiBold",
                      color: "#48277b",
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
                      color: "#6d28d9",
                      fontSize: 11,
                      textAlign: "center",
                      opacity: 0.6
                    }}
                  >
                    Capture a memory
                  </Text>
                </TouchableOpacity>
              </Link>
            </ScrollView>
          </View>

          {/* Message Templates Section */}
          <View className="mb-2">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                style={{ fontFamily: "Poppins_600SemiBold" }}
                className="text-[#1a1f36] text-[18px]"
              >
                Message Templates
              </Text>
              <TouchableOpacity>
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="text-[#1d6ee1] text-[16px]"
                >
                  Browse
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2">
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
    backgroundColor: "#2f3a56",
    height: 58,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 32,
    shadowColor: "#2f3a56",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  profileImageContainer: {
    shadowColor: "#4a5b87",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  plusIcon: {
    width: 29,
    height: 29,
  },
  promptCard: {
    borderRadius: 20,
    padding: 18,
    width: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
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
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  capsuleCard: {
    width: 190,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  capsuleImageBg: {
    height: 180,
    padding: 12,
  },
  floatingTypeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    zIndex: 10,
  },
  floatingTypeText: {
    color: "white",
    fontSize: 10,
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
    padding: 14,
    backgroundColor: "white",
  },
  statusDot: {
    width: 6,
    height: 6,
    backgroundColor: "#34c759",
    borderRadius: 3,
  },
  createNewCard: {
    width: 190,
    height: 290, // Match total height of capsule card approximately
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#e9d5ff",
    backgroundColor: "#f5f3ff",
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
    shadowColor: "#6738af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  templateCard: {
    width: "48%",
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
});
