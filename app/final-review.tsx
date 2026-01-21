import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTimeCapsules } from "../context/TimeCapsuleContext";

// Mock data for recipient - in a real app this would come from a global state or API
const mockRecipients = [
  {
    id: "ava",
    name: "Ava",
    birthday: "12/23/2015",
    image: { uri: "https://www.figma.com/api/mcp/asset/53947aab-ee5a-40bb-a2d6-80d81e34424a" },
  },
  {
    id: "mason",
    name: "Mason",
    birthday: "12/23/2018",
    image: { uri: "https://www.figma.com/api/mcp/asset/4854258d-0fac-4073-be5d-5172e91b2a1f" },
  },
];

export default function FinalReview() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    type: string;
    uri: string;
    description: string;
    title: string;
    photoUri: string;
    method: string;
    date: string;
    time: string;
    scenario: string;
    reminder: string;
    recipientId: string;
  }>();

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const player = useVideoPlayer(params.uri || "", (player) => {
    player.loop = false;
  });

  const handleReplay = () => {
    player.seekBy(-player.currentTime);
    player.play();
  };

  useEffect(() => {
    return () => {
      if (sound) { sound.unloadAsync(); }
    };
  }, [sound]);

  const calculateAge = (birthday: string) => {
    const [month, day, year] = birthday.split("/").map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const recipient = mockRecipients.find((r) => r.id === params.recipientId) || mockRecipients[0];

  const handleBack = () => {
    router.back();
  };

  const handlePlayPause = async () => {
    if (!params.uri) return;
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
      return;
    }
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: params.uri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          newSound.setPositionAsync(0);
        }
      });
    } catch (err) {
      console.error("Failed to play preview", err);
    }
  };

  const { addTimeCapsule } = useTimeCapsules();

  const handleSchedule = async () => {
    console.log("Message Scheduled!");

    // Construct the new capsule object
    const newCapsule = {
      title: params.title || "Untitled Message",
      recipient: recipient.name,
      date: params.method === "date-time"
        ? formatDate(params.date)
        : params.method === "open-when"
          ? `Open When: ${params.scenario}`
          : "Scheduled Soon",
      type: params.type || "Message",
      photoUri: params.photoUri,
      description: params.description,
    };

    await addTimeCapsule(newCapsule);
    router.push("/processing-message");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    return new Date(timeStr).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={handleBack} activeOpacity={0.7} className="w-10 h-10 justify-center items-start">
            <Ionicons name="arrow-back" size={24} color="#777" />
          </TouchableOpacity>
          <Text style={{ fontFamily: "Poppins_700Bold" }} className="text-[#5a5a5a] text-[20px] text-center flex-1 pr-10">
            Final Review
          </Text>
        </View>
        <View className="bg-[#2f3a561a] h-[2px] rounded-full overflow-hidden w-full">
          <View className="bg-[#2f3a56] h-full w-full" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-8">
          {/* Status Section */}
          <View className="items-center gap-4">
            <LinearGradient
              colors={["#c28fef", "#1d6ee1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-[84px] h-[84px] items-center justify-center rounded-full"
            >
              <Ionicons name="mail-open" size={40} color="white" />
            </LinearGradient>
            <View className="items-center gap-1">
              <Text style={{ fontFamily: "Poppins_600SemiBold" }} className="text-black text-[18px]">
                Your Message is Ready
              </Text>
              <Text style={{ fontFamily: "Poppins_400Regular" }} className="text-[#606060] text-[14px] text-center">
                We’ve saved your message securely and privately.
              </Text>
            </View>
          </View>

          {/* Review Sections */}
          <View className="gap-6">
            {/* Sending to */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text style={{ fontFamily: "Poppins_600SemiBold" }} className="text-black text-[16px]">Sending to</Text>
                <TouchableOpacity onPress={() => router.push("/recipient")}>
                  <Ionicons name="create-outline" size={20} color="#6d7faf" />
                </TouchableOpacity>
              </View>
              <View className="bg-[#4a5b87] h-[80px] rounded-[12px] px-4 flex-row items-center gap-4 shadow-sm">
                <Image source={recipient.image} className="w-12 h-12 rounded-full border border-white/20" />
                <View>
                  <Text style={{ fontFamily: "Poppins_600SemiBold" }} className="text-white text-[16px]">
                    {recipient.name}
                  </Text>
                  <Text style={{ fontFamily: "Poppins_400Regular" }} className="text-white/80 text-[14px]">
                    Age {calculateAge(recipient.birthday)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Message Title */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text style={{ fontFamily: "Poppins_600SemiBold" }} className="text-black text-[16px]">Message Title</Text>
                <TouchableOpacity onPress={() => router.push("/final-touches")}>
                  <Ionicons name="create-outline" size={20} color="#6d7faf" />
                </TouchableOpacity>
              </View>
              <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-[#2f3a56] text-[16px]">
                {params.title}
              </Text>
            </View>

            {/* Preview Media */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text style={{ fontFamily: "Poppins_600SemiBold" }} className="text-black text-[16px]">Preview Media</Text>
                <TouchableOpacity onPress={() => router.push("/upload-image")}>
                  <Ionicons name="create-outline" size={20} color="#6d7faf" />
                </TouchableOpacity>
              </View>
              <View className="aspect-video rounded-[20px] overflow-hidden bg-[#f3f4f6] shadow-sm">
                {params.type === "video" && params.uri ? (
                  <View className="flex-1">
                    <VideoView
                      player={player}
                      style={{ width: "100%", height: "100%" }}
                      nativeControls
                      contentFit="cover"
                    />
                  </View>
                ) : params.photoUri || params.uri ? (
                  <Image source={{ uri: params.photoUri || params.uri }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="w-full h-full bg-[#2f3a561a] items-center justify-center">
                    <Ionicons name="image-outline" size={48} color="#2f3a56" />
                  </View>
                )}
                {params.type === "audio" && (
                  <View className="absolute inset-0 items-center justify-center bg-black/10">
                    <TouchableOpacity
                      onPress={handlePlayPause}
                      className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-lg"
                    >
                      <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="#2f3a56" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              {params.type === "video" && (
                <TouchableOpacity
                  onPress={handleReplay}
                  activeOpacity={0.7}
                  className="bg-[#ffe8c3] px-6 py-3 rounded-[12px] mt-2 flex-row items-center justify-center gap-2"
                >
                  <Ionicons name="refresh" size={18} color="#2f3a56" />
                  <Text style={{ fontFamily: "Poppins_600SemiBold" }} className="text-[#2f3a56] text-[14px]">
                    Replay Video
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Description */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text style={{ fontFamily: "Poppins_600SemiBold" }} className="text-black text-[16px]">Description</Text>
                <TouchableOpacity onPress={() => router.push({ pathname: "/final-touches", params: { ...params } })}>
                  <Ionicons name="create-outline" size={20} color="#6d7faf" />
                </TouchableOpacity>
              </View>
              <View className="bg-[#f5f5f5] rounded-[16px] p-4 min-h-[100px]">
                <Text style={{ fontFamily: "Poppins_400Regular" }} className="text-[#4a4a4a] text-[14px] leading-[22px]">
                  {params.description || "No description provided."}
                </Text>
              </View>
            </View>

            {/* Scheduled Delivery */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text style={{ fontFamily: "Poppins_600SemiBold" }} className="text-black text-[16px]">Scheduled Delivery</Text>
                <TouchableOpacity onPress={() => router.push("/schedule-message")}>
                  <Ionicons name="create-outline" size={20} color="#6d7faf" />
                </TouchableOpacity>
              </View>
              <View className="bg-[#f5f5f5] p-5 rounded-[16px] gap-4">
                <View className="flex-row gap-3 items-center">
                  <View className="bg-[#2f3a561a] p-2.5 rounded-full">
                    <Ionicons name="calendar-outline" size={20} color="#2f3a56" />
                  </View>
                  <View>
                    <Text style={{ fontFamily: "Poppins_600SemiBold" }} className="text-[#2f3a56] text-[15px]">Scheduled Delivery</Text>
                    <Text style={{ fontFamily: "Poppins_400Regular" }} className="text-[#606060] text-[12px]">
                      {params.method === "date-time" ? "Send by Date & Time" : params.method === "open-when" ? `Open When: ${params.scenario}` : params.method === "send-now" ? "Send Immediately" : "Saved as Draft"}
                    </Text>
                  </View>
                </View>

                {params.method === "date-time" && (
                  <View className="gap-3 pt-2">
                    <View className="flex-row justify-between items-center">
                      <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-[#606060] text-[14px]">Date:</Text>
                      <Text style={{ fontFamily: "Poppins_600SemiBold" }} className="text-black text-[14px]">{formatDate(params.date)}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-[#606060] text-[14px]">Time:</Text>
                      <Text style={{ fontFamily: "Poppins_600SemiBold" }} className="text-black text-[14px]">{formatTime(params.time)}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f3f4f6] px-5 py-6">
        <TouchableOpacity
          onPress={handleSchedule}
          activeOpacity={0.9}
          className="bg-[#2f3a56] h-[60px] rounded-[14px] flex-row items-center justify-center gap-3 w-full"
        >
          <Text style={{ fontFamily: "Poppins_600SemiBold" }} className="text-white text-[17px]">
            Schedule
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
