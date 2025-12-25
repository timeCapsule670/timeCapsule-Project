import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateAudioMessage() {
  const router = useRouter();
  
  // Recording states
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<"idle" | "recording" | "completed">("idle");
  const [timer, setTimer] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  // Animation refs for waveform
  const barHeights = useRef([
    new Animated.Value(16),
    new Animated.Value(32),
    new Animated.Value(64),
    new Animated.Value(48),
    new Animated.Value(80),
    new Animated.Value(24),
    new Animated.Value(40),
  ]).current;

  const timerRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleBack = () => {
    router.back();
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setRecordingStatus("recording");
      setTimer(0);
      
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);

      startWaveformAnimation();
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Could not start audio recording.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setRecordingStatus("completed");
      if (timerRef.current) clearInterval(timerRef.current);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
      stopWaveformAnimation();
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  const startWaveformAnimation = () => {
    const animations = barHeights.map((anim) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 60 + 20,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: Math.random() * 20 + 10,
            duration: 200,
            useNativeDriver: false,
          }),
        ])
      );
    });
    Animated.parallel(animations).start();
  };

  const stopWaveformAnimation = () => {
    barHeights.forEach((anim, index) => {
      anim.stopAnimation();
      // Reset to static heights
      const staticHeights = [16, 32, 64, 48, 80, 24, 40];
      Animated.timing(anim, {
        toValue: staticHeights[index],
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  const playPreview = async () => {
    if (!recordingUri) return;

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
        { uri: recordingUri },
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

  const handleReRecord = () => {
    Alert.alert(
      "Re-record",
      "This will delete your current recording. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete & Restart", 
          style: "destructive",
          onPress: () => {
            setRecordingUri(null);
            setRecordingStatus("idle");
            setTimer(0);
            if (sound) {
              sound.unloadAsync();
              setSound(null);
            }
            setIsPlaying(false);
          }
        }
      ]
    );
  };

  const handleNext = () => {
    if (recordingStatus === "completed" && recordingUri) {
      // Navigate to final touches
      router.push({ 
        pathname: "/final-touches", 
        params: { type: "audio", uri: recordingUri } 
      });
    }
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
            Record Audio Message
          </Text>
        </View>
        {/* Progress Bar */}
        <View className="bg-[#2f3a561a] h-[2px] rounded-full overflow-hidden w-full">
          <View className="bg-[#2f3a56] h-full w-[50%]" />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-10 items-center">
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-[#606060] text-[16px] leading-[21px] text-center px-4"
          >
            Let your voice carry the love, guidance, or comfort they may need — today or one day.
          </Text>

          {/* Recording Interface */}
          <View className="items-center gap-10 mt-8 w-full">
            {/* Timer */}
            <Text
              style={{ fontFamily: "Inter_600SemiBold", fontSize: 24, color: "#2f3a56" }}
            >
              {formatTime(timer)}
            </Text>

            {/* Waveform */}
            <View className="flex-row items-center justify-center gap-2 h-[80px]">
              {barHeights.map((height, i) => (
                <Animated.View
                  key={i}
                  style={{
                    height: height,
                    width: 4,
                    backgroundColor: "#a3c4f3",
                    borderRadius: 2,
                  }}
                />
              ))}
            </View>

            {/* Record Button */}
            <View className="items-center gap-4">
              <TouchableOpacity
                onPress={recordingStatus === "recording" ? stopRecording : startRecording}
                activeOpacity={0.8}
                disabled={recordingStatus === "completed"}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: recordingStatus === "recording" ? "#ff4d4d" : "#ff6b6b",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                <Ionicons 
                  name={recordingStatus === "recording" ? "stop" : "mic"} 
                  size={32} 
                  color="white" 
                />
              </TouchableOpacity>
              <Text
                style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: "#9b9b9b" }}
              >
                {recordingStatus === "idle" ? "Tap to start recording" : 
                 recordingStatus === "recording" ? "Recording..." : "Recording complete"}
              </Text>
            </View>

            {/* Controls */}
            <View className="flex-row gap-10 items-center">
              <TouchableOpacity
                onPress={handleReRecord}
                disabled={recordingStatus !== "completed"}
                activeOpacity={0.7}
                className="items-center gap-1"
              >
                <View className={`w-10 h-10 rounded-full items-center justify-center ${recordingStatus === "completed" ? "bg-[#f5f5f5]" : "bg-transparent"}`}>
                  <Ionicons 
                    name="refresh" 
                    size={20} 
                    color={recordingStatus === "completed" ? "#2f3a56" : "#9b9b9b"} 
                  />
                </View>
                <Text
                  style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "#9b9b9b" }}
                >
                  Re-record
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={playPreview}
                disabled={recordingStatus !== "completed"}
                activeOpacity={0.7}
                className="items-center gap-1"
              >
                <View className={`w-10 h-10 rounded-full items-center justify-center ${recordingStatus === "completed" ? "bg-[#f5f5f5]" : "bg-transparent"}`}>
                  <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={20} 
                    color={recordingStatus === "completed" ? "#2f3a56" : "#9b9b9b"} 
                  />
                </View>
                <Text
                  style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "#9b9b9b" }}
                >
                  Preview
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f3f4f6] px-4 py-6 gap-4">
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          disabled={recordingStatus !== "completed"}
          className={`h-[60px] rounded-[8px] flex-row items-center justify-center gap-4 w-full ${
            recordingStatus === "completed" ? "bg-[#2f3a56]" : "bg-[#2f3a5680]"
          }`}
        >
          <Text
            style={{ fontFamily: "Poppins_500Medium" }}
            className="text-white text-[16px]"
          >
            Next, Final Touches
          </Text>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/")} activeOpacity={0.7}>
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-[#6099ea] text-[16px] text-center"
          >
            Save For Later
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

