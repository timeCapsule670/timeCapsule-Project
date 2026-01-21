import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateVideoMessage() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [isRecording, setIsRecording] = useState(false);
  const [cameraType, setCameraType] = useState<"front" | "back">("front");
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setTimer(0);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  const handleBack = () => {
    router.back();
  };

  const toggleCameraType = () => {
    setCameraType((current) => (current === "back" ? "front" : "back"));
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: 60, // 1 minute limit example
        });
        if (video) {
          console.log("Video recorded:", video.uri);
          router.push({
            pathname: "/final-touches",
            params: { type: "video", uri: video.uri },
          });
        }
      } catch (error) {
        console.error("Failed to record video:", error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!permission || !micPermission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted || !micPermission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container} className="items-center justify-center p-6 bg-white">
        <Text style={{ fontFamily: "Poppins_500Medium" }} className="text-center mb-6 text-[16px]">
          We need your permission to show the camera and record audio
        </Text>
        <TouchableOpacity
          onPress={() => {
            requestPermission();
            requestMicPermission();
          }}
          className="bg-[#2f3a56] px-8 py-4 rounded-xl"
        >
          <Text className="text-white font-bold text-[16px]">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      {/* Header */}
      <View className="pt-4 pb-2">
        <View className="flex-row items-center px-4 mb-4">
          <TouchableOpacity onPress={handleBack} className="w-10 h-10 items-center justify-center -ml-2">
            <Ionicons name="arrow-back" size={28} color="#1a1f36" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text style={{ fontFamily: "Poppins_700Bold" }} className="text-[#1a1f36] text-[20px]">
              Record Video Message
            </Text>
          </View>
          <View className="w-8" />
        </View>
        {/* Progress Bar */}
        <View className="h-[2px] bg-[#f3f4f6] w-full">
          <View className="h-full bg-[#2f3a56] w-[45%]" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-10 items-center">
          {/* Instructional Text */}
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-[#9ca3af] text-[15px] text-center leading-[24px] mb-14 px-4"
          >
            It doesn't have to be perfect — just real. Your child will treasure hearing from you.
          </Text>

          {/* Camera Preview Area */}
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing={cameraType}
              ref={cameraRef}
              mode="video"
            >
              {isRecording && (
                <View className="absolute top-4 left-4 flex-row items-center bg-black/50 px-3 py-1 rounded-full">
                  <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  <Text className="text-white font-bold">{formatTime(timer)}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={toggleCameraType}
                style={styles.flipButton}
                className="absolute top-4 right-4 bg-black/30 p-2 rounded-full"
              >
                <Ionicons name="camera-reverse-outline" size={24} color="white" />
              </TouchableOpacity>
            </CameraView>
          </View>

          {/* Record Button Section */}
          <View className="items-center mt-12 mb-10">
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              activeOpacity={0.8}
              className={`w-[100px] h-[100px] rounded-full items-center justify-center ${isRecording ? "bg-red-500 scale-110" : "bg-[#ff6b6b]"
                } shadow-lg shadow-black/20`}
              style={{ elevation: 5 }}
            >
              {isRecording ? (
                <View className="w-8 h-8 bg-white rounded-sm" />
              ) : (
                <Ionicons name="videocam" size={40} color="white" />
              )}
            </TouchableOpacity>
            <Text
              style={{ fontFamily: "Poppins_400Regular" }}
              className="text-[#9ca3af] text-[16px] mt-4"
            >
              {isRecording ? "Tap To Stop Recording" : "Tap To Start Recording"}
            </Text>
          </View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Footer Buttons */}
          <View className="w-full gap-4 mt-10">
            <TouchableOpacity
              onPress={() => {
                if (isRecording) stopRecording();
                // In a real app, we'd wait for URI but here we can navigate if needed
              }}
              style={styles.nextButton}
              className="bg-[#2f3a56] h-[60px] rounded-[16px] flex-row items-center justify-center"
            >
              <Text style={{ fontFamily: "Poppins_600SemiBold" }} className="text-white text-[16px]">
                Next, Final Touches
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-[#1d6ee1] text-[16px] text-center"
              >
                Save For Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  camera: {
    flex: 1,
  },
  flipButton: {
    zIndex: 10,
  },
  nextButton: {
    shadowColor: "#2f3a56",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});
