import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
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

  const handleSchedule = () => {
    console.log("Message Scheduled!");
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
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-10 pb-4 border-b border-[#f3f4f6]">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            className="w-6 h-6 justify-center items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#777" />
          </TouchableOpacity>
          <Text
            style={{ fontFamily: "Poppins_700Bold" }}
            className="text-[#5a5a5a] text-[22px] leading-[33px] text-center flex-1 pr-6"
          >
            Final Review
          </Text>
        </View>
        <View className="bg-[#2f3a561a] h-[2px] rounded-full overflow-hidden w-full">
          <View className="bg-[#2f3a56] h-full w-full" />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-10">
          {/* Success Section */}
          <View className="items-center gap-6">
            <LinearGradient
              colors={["#c28fef", "#1d6ee1"]}
              start={{ x: 0, y: 0.19 }}
              end={{ x: 0, y: 1.74 }}
              className="w-[92px] h-[92px] items-center justify-center"
              style={{
                borderRadius: 46,
              }}  
            >
              <Ionicons name="mail-open" size={45} color="white" />
            </LinearGradient>
            <View className="items-center gap-2">
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-black text-[18px]"
              >
                Your Message is Ready
              </Text>
              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-[#606060] text-[16px] text-center px-4"
              >
                We’ve saved your message securely and privately.
              </Text>
            </View>
          </View>

          {/* Review Sections */}
          <View className="gap-8">
            {/* Sending to */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-black text-[18px]">Sending to</Text>
                <TouchableOpacity onPress={() => router.push("/recipient")}>
                  <Ionicons name="create-outline" size={20} color="#777" />
                </TouchableOpacity>
              </View>
              <View className="bg-[#4a5b87] h-[84px] rounded-[8px] px-4 flex-row items-center gap-4">
                <Image
                  source={recipient.image}
                  className="w-12 h-12 rounded-full"
                />
                <View>
                  <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-white text-[18px]">
                    {recipient.name}
                  </Text>
                  <Text style={{ fontFamily: "Poppins_400Regular" }} className="text-white opacity-80 text-[16px]">
                    Age {calculateAge(recipient.birthday)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Message Title */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-black text-[18px]">Message Title</Text>
                <TouchableOpacity onPress={() => router.push("/final-touches")}>
                  <Ionicons name="create-outline" size={20} color="#777" />
                </TouchableOpacity>
              </View>
              <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-[#2f3a56] text-[18px]">
                {params.title}
              </Text>
            </View>

            {/* Preview Media */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-black text-[18px]">Preview Media</Text>
                <TouchableOpacity onPress={() => router.push("/create-audio")}>
                  <Ionicons name="create-outline" size={20} color="#777" />
                </TouchableOpacity>
              </View>
              <View className="h-[215px] rounded-[16px] overflow-hidden bg-[#f3f4f6] relative shadow-md" style={{ elevation: 4 }}>
                {params.photoUri ? (
                  <Image source={{ uri: params.photoUri }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="w-full h-full bg-[#2f3a561a] items-center justify-center">
                    <Ionicons name="image-outline" size={48} color="#2f3a56" />
                  </View>
                )}
                {params.type === "audio" && (
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="bg-white/20 p-4 rounded-full">
                      <TouchableOpacity 
                        onPress={handlePlayPause}
                        className="w-16 h-16 bg-[#ff6b6b] rounded-full items-center justify-center"
                      >
                        <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Scheduled Delivery */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-black text-[18px]">Scheduled Delivery</Text>
                <TouchableOpacity onPress={() => router.push("/schedule-message")}>
                  <Ionicons name="create-outline" size={20} color="#777" />
                </TouchableOpacity>
              </View>
              <View className="bg-[#f5f5f580] p-4 rounded-[16px] gap-4">
                <View className="flex-row gap-4 items-center">
                  <View className="bg-[#4a5b871a] p-2 rounded-full">
                    <Ionicons name="calendar" size={20} color="#4a5b87" />
                  </View>
                  <View>
                    <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-black text-[16px]">Scheduled Delivery</Text>
                    <Text style={{ fontFamily: "Poppins_400Regular" }} className="text-[#4a4a4a] text-[12px]">
                      {params.method === "date-time" ? "Send by Date & Time" : `Open When: ${params.scenario}`}
                    </Text>
                  </View>
                </View>
                
                {params.method === "date-time" && (
                  <View className="gap-2">
                    <View className="flex-row justify-between">
                      <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-[#2f3a56]">Date:</Text>
                      <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-[#2f3a56]">{formatDate(params.date)}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-[#2f3a56]">Time:</Text>
                      <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-[#2f3a56]">{formatTime(params.time)}</Text>
                    </View>
                  </View>
                )}

                {params.reminder && (
                  <View className="flex-row justify-between pt-2 border-t border-[#f5f5f5]">
                    <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-[#2f3a56]">Reminder</Text>
                    <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-[#2f3a56]">{params.reminder.replace("-", " ")}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f3f4f6] px-4 py-6">
        <TouchableOpacity
          onPress={handleSchedule}
          activeOpacity={0.9}
          className="bg-[#2f3a56] h-[60px] rounded-[8px] items-center justify-center w-full"
        >
          <Text
            style={{ fontFamily: "Poppins_500Medium" }}
            className="text-white text-[16px]"
          >
            Schedule
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

