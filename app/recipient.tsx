import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Recipient {
  id: string;
  name: string;
  birthday: string; // MM/DD/YYYY
  image?: any;
}

// Set this to [] to test the "No Linked Accounts" state
const mockRecipients: Recipient[] = [];

export default function RecipientSelection() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);

  const hasLinkedAccounts = mockRecipients.length > 0;

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

  const handleBack = () => {
    // @ts-ignore
    const canGoBack = typeof router.canGoBack === "function" ? (router as any).canGoBack() : false;
    if (canGoBack) {
      router.back();
    } else {
      router.replace("/summary");
    }
  };

  const handleNext = () => {
    if (selectedRecipientId) {
      console.log("Recipient selected:", selectedRecipientId, "Message type:", type);
      
      if (type === "text") {
        // Skip permissions for text messages
        router.push("/create-text");
      } else {
        // Navigate to unified permissions page for other media types
        router.push({
          pathname: "/media-permissions",
          params: { type: type || "video" }
        });
      }
    }
  };

  const handleCreateLinkedAccount = () => {
    router.push("/link-account");
  };

  const handleSaveForLater = () => {
    console.log("Save for later pressed");
    router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-10 pb-4">
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
            Recipient
          </Text>
        </View>
        {/* Progress Bar */}
        <View className="bg-[#2f3a561a] h-[2px] rounded-full overflow-hidden w-full">
          <View className="bg-[#2f3a56] h-full w-[23%]" />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6">
          <Text
            style={{ fontFamily: "Poppins_500Medium" }}
            className="text-[#5a5a5a] text-[18px] leading-[27px]"
          >
            Who is this message for
          </Text>

          <View className="gap-4">
            {/* Save To Vault Option (Always visible) */}
            <TouchableOpacity
              onPress={() => setSelectedRecipientId("vault")}
              activeOpacity={0.8}
              className={`rounded-[8px] px-[18px] py-[15px] flex-row items-center gap-4 ${
                selectedRecipientId === "vault"
                  ? "bg-[#1fc16b1a] border-[#1fc16b]"
                  : "bg-[#1fc16b0d] border-[#1fc16b]"
              }`}
              style={{
                borderWidth: 2,
                borderStyle: "dashed",
              }}
            >
              <View className="w-12 h-12 rounded-full bg-[#1fc16b] items-center justify-center">
                <Ionicons name="lock-closed" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text
                  style={{ fontFamily: "Poppins_500Medium" }}
                  className="text-[#2f3a56] text-[16px]"
                >
                  Save To Vault
                </Text>
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="text-[#5a5a5a] text-[12px]"
                >
                  Store this message privately until you’re ready to share.
                </Text>
              </View>
              {selectedRecipientId === "vault" && (
                <Ionicons name="checkmark-circle" size={24} color="#1fc16b" />
              )}
            </TouchableOpacity>

            {hasLinkedAccounts ? (
              mockRecipients.map((recipient) => {
                const isSelected = selectedRecipientId === recipient.id;
                return (
                  <TouchableOpacity
                    key={recipient.id}
                    onPress={() => setSelectedRecipientId(recipient.id)}
                    activeOpacity={0.8}
                    className={`h-[81px] rounded-[8px] px-[18px] py-[15px] flex-row items-center gap-4 ${
                      isSelected ? "bg-white border-[#2f3a56]" : "bg-[#f5f5f5] border-transparent"
                    }`}
                    style={{
                      borderWidth: isSelected ? 1.5 : 0,
                    }}
                  >
                    <Image
                      source={recipient.image}
                      className="w-12 h-12 rounded-full"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <Text
                        style={{ fontFamily: "Poppins_500Medium" }}
                        className="text-[#2f3a56] text-[16px]"
                      >
                        {recipient.name}
                      </Text>
                      <Text
                        style={{ fontFamily: "Poppins_400Regular" }}
                        className="text-[#5a5a5a] text-[12px]"
                      >
                        Age {calculateAge(recipient.birthday)}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color="#2f3a56" />
                    )}
                  </TouchableOpacity>
                )
              })
            ) : (
              /* No Linked Accounts State */
              <View 
                className="bg-[#8a5fcc0d] border border-[#8a5fcc] border-dashed rounded-[8px] px-6 py-4 items-center gap-4"
              >
                <View className="items-center gap-3">
                  <LinearGradient
                    colors={["#c28fef", "#1d6ee1"]}
                    className="w-[60px] h-[60px] rounded-full items-center justify-center"
                  >
                    <Ionicons name="people" size={30} color="white" />
                  </LinearGradient>
                  
                  <Text
                    style={{ fontFamily: "Poppins_500Medium" }}
                    className="text-black text-[18px] text-center"
                  >
                    No Linked accounts yet
                  </Text>
                  
                  <Text
                    style={{ fontFamily: "Poppins_400Regular" }}
                    className="text-[#606060] text-[16px] text-center px-2"
                  >
                    Start building connections by linking your loved one’s account.
                  </Text>
                </View>

                <View className="w-full gap-4 py-4">
                  <Text
                    style={{ fontFamily: "Poppins_500Medium" }}
                    className="text-black text-[18px] text-center"
                  >
                    Linking unlocks:
                  </Text>
                  
                  <View className="gap-4">
                    {/* Feature 1 */}
                    <View className="flex-row items-center gap-3">
                      <View className="w-[27px] h-[27px] rounded-full bg-[#473a561a] items-center justify-center">
                        <Ionicons name="calendar-outline" size={16} color="#6d7faf" />
                      </View>
                      <Text
                        style={{ fontFamily: "Poppins_400Regular" }}
                        className="text-[12px] text-black"
                      >
                        Schedule message to deliver for future dates
                      </Text>
                    </View>

                    {/* Feature 2 */}
                    <View className="flex-row items-center gap-3">
                      <View className="w-[27px] h-[27px] rounded-full bg-[#fdcb6e1a] items-center justify-center">
                        <Ionicons name="school-outline" size={16} color="#e19303" />
                      </View>
                      <Text
                        style={{ fontFamily: "Poppins_400Regular" }}
                        className="text-[12px] text-black"
                      >
                        Milestone & “Open When” triggers
                      </Text>
                    </View>

                    {/* Feature 3 */}
                    <View className="flex-row items-center gap-3">
                      <View className="w-[27px] h-[27px] rounded-full bg-[#ff6b6b1a] items-center justify-center">
                        <Ionicons name="heart-outline" size={16} color="#e30000" />
                      </View>
                      <Text
                        style={{ fontFamily: "Poppins_400Regular" }}
                        className="text-[12px] text-black"
                      >
                        Instant emotional support delivery
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleCreateLinkedAccount}
                  activeOpacity={0.8}
                  className="bg-[#b093dc] w-full h-[40px] rounded-[8px] items-center justify-center"
                >
                  <Text
                    style={{ fontFamily: "Poppins_500Medium" }}
                    className="text-black text-[16px]"
                  >
                    Create Linked Account
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f3f4f6] px-4 py-6 gap-4">
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          disabled={!selectedRecipientId}
          className={`h-[60px] rounded-[8px] flex-row items-center justify-center gap-4 w-full ${
            selectedRecipientId ? "bg-[#2f3a56]" : "bg-[#2f3a5680]"
          }`}
        >
          <Text
            style={{ fontFamily: "Poppins_500Medium" }}
            className="text-white text-[16px]"
          >
            Next, Record Message
          </Text>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSaveForLater} activeOpacity={0.7}>
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

