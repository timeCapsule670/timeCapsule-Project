import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cakeIcon, carIcon, openBookIcon, schoolIcon, trophyIcon } from "../constants/assets";

type SchedulingMethod = "date-time" | "open-when" | "send-now" | "save-later";

const OPEN_WHEN_CATEGORIES = [
  { id: "milestones", label: "Milestones", emoji: "🎓" },
  { id: "emotional-support", label: "Emotional Support", emoji: "😟" },
  { id: "celebrations", label: "Celebrations", emoji: "🎉" },
  { id: "life-advice", label: "Life Advice", emoji: "💡" },
  { id: "just-because", label: "Just Because", emoji: "❤️" },
];

const OPEN_WHEN_TAGS: Record<string, { id: string; label: string; emoji?: string; image?: any }[]> = {
  milestones: [
    { id: "first-big-game", label: "First Big Game / Performance", image: trophyIcon },
    { id: "first-school-dance", label: "First School Dance", image: openBookIcon },
    { id: "first-day", label: "First Day Of School/Job", image: schoolIcon },
    { id: "first-car", label: "First Car", image: carIcon },
    { id: "sweet-16", label: "Sweet 16", image: cakeIcon },
  ],
  "emotional-support": [
    { id: "overwhelmed", label: "Feeling Overwhelmed", image: trophyIcon },
    { id: "feeling-lonely", label: "Feeling Lonely", image: openBookIcon },
    { id: "tough-day", label: "Tough Day", image: schoolIcon },
    { id: "missing-me", label: "Missing me", image: carIcon },
    { id: "celebration-emotional", label: "Need a Celebration", image: cakeIcon },
  ],
  celebrations: [
    { id: "birthday", label: "Birthday", emoji: "🎂" },
    { id: "graduation", label: "Graduation", emoji: "🎓" },
    { id: "wedding", label: "Wedding Day", emoji: "💍" },
    { id: "new-baby", label: "New Baby", emoji: "👶" },
  ],
  "life-advice": [
    { id: "hard-decision", label: "Hard Decisions", emoji: "🤔" },
    { id: "heartbreak", label: "Heartbreak", emoji: "💔" },
    { id: "moving-away", label: "Moving Away", emoji: "📦" },
  ],
  "just-because": [
    { id: "thinking-of-you", label: "Thinking of You", emoji: "💭" },
    { id: "proud-of-you", label: "I'm Proud of You", emoji: "⭐" },
  ],
};

export default function ScheduleMessage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    type: string;
    uri: string;
    title: string;
    photoUri: string;
  }>();

  // State
  const [selectedMethod, setSelectedMethod] = useState<SchedulingMethod | null>(
    null
  );
  const [expandedSection, setExpandedSection] = useState<
    "date-time" | "open-when" | null
  >(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("milestones");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [selectedReminderInterval, setSelectedReminderInterval] = useState<string>("1-day");

  const REMINDER_INTERVALS = [
    { id: "5-min", label: "5 minutes before" },
    { id: "1-day", label: "1 day before" },
    { id: "1-week", label: "1 week before" },
    { id: "custom", label: "Custom" },
  ];

  const handleBack = () => {
    router.back();
  };

  const toggleSection = (section: "date-time" | "open-when") => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
      setSelectedMethod(section);
    }
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
    }
  };

  const onTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (time) {
      setSelectedTime(time);
    }
  };

  const handleNext = () => {
    if (!selectedMethod) return;

    // Navigate to final review
    router.push({
      pathname: "/final-review",
      params: {
        ...params,
        method: selectedMethod,
        date: selectedMethod === "date-time" ? selectedDate.toISOString() : "",
        time: selectedMethod === "date-time" ? selectedTime.toISOString() : "",
        scenario: selectedMethod === "open-when" ? selectedScenario || "" : "",
        reminder: reminderEnabled ? selectedReminderInterval : "",
      },
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
            Schedule Message
          </Text>
        </View>
        {/* Progress Bar (100%) */}
        <View className="bg-[#2f3a561a] h-[2px] rounded-full overflow-hidden w-full">
          <View className="bg-[#2f3a56] h-full w-full" />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-8">
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-[#606060] text-[16px] leading-[21px] text-center px-4"
          >
            Choose how you want this message delivered.
          </Text>

          <View className="gap-6">
            {/* Specific Date or Time */}
            <View>
              <TouchableOpacity
                onPress={() => toggleSection("date-time")}
                activeOpacity={0.7}
                className="bg-white h-[58px] rounded-[8px] px-4 flex-row items-center justify-between shadow-md"
                style={{
                  elevation: 4,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name={
                        selectedMethod === "date-time"
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={24}
                      color={
                        selectedMethod === "date-time" ? "#2f3a56" : "#9daaca"
                      }
                    />
                  </View>
                  <Ionicons name="calendar-outline" size={24} color="#6d7faf" />
                  <Text
                    style={{ fontFamily: "Poppins_400Regular" }}
                    className="text-[16px] text-black"
                  >
                    Send by Specific Date or Time
                  </Text>
                </View>
                <Ionicons
                  name={
                    expandedSection === "date-time"
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={24}
                  color="black"
                />
              </TouchableOpacity>

              {expandedSection === "date-time" && (
                <View 
                  className="mt-2 p-6 bg-[#f9fafb] rounded-[16px] gap-6 shadow-sm"
                  style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  }}
                >
                  <Text
                    style={{ fontFamily: "Poppins_400Regular" }}
                    className="text-[12px] text-black leading-[18px]"
                  >
                    Select the date and time this message should be delivered.
                  </Text>

                  <View className="flex-row gap-4">
                    {/* Date Field */}
                    <View className="flex-1 gap-2">
                      <Text style={{ fontFamily: "Poppins_400Regular" }} className="text-[12px] text-black">Date</Text>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        activeOpacity={0.7}
                        className="bg-white border border-[#79747e] rounded-[4px] h-[56px] px-4 flex-row items-center justify-between"
                      >
                        <Text style={{ fontFamily: "Poppins_400Regular", color: "#49454f" }} className="text-[12px]">
                          {selectedDate.toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </Text>
                        <Ionicons name="calendar" size={24} color="black" />
                      </TouchableOpacity>
                    </View>

                    {/* Time Field */}
                    <View className="flex-1 gap-2">
                      <Text style={{ fontFamily: "Poppins_400Regular" }} className="text-[12px] text-black">Time</Text>
                      <TouchableOpacity
                        onPress={() => setShowTimePicker(true)}
                        activeOpacity={0.7}
                        className="bg-white border border-[#79747e] rounded-[4px] h-[56px] px-4 flex-row items-center justify-between"
                      >
                        <Text style={{ fontFamily: "Poppins_400Regular", color: "#49454f" }} className="text-[12px]">
                          {selectedTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                        <Ionicons name="time-outline" size={24} color="black" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Timezone Info Box */}
                  <View className="bg-[#f5f5f580] p-2 rounded-[8px] flex-row items-center gap-2">
                    <Ionicons name="time-outline" size={16} color="#4a5b87" />
                    <Text 
                      style={{ fontFamily: "Poppins_400Regular" }} 
                      className="text-[12px] text-[#606060] flex-1"
                    >
                      Time will be sent according on recipient’s local timezone
                    </Text>
                  </View>

                  {/* Divider */}
                  <View className="h-[1px] bg-[#f5f5f5] w-full" />

                  {/* Reminder Notification */}
                  <View className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <Text
                        style={{ fontFamily: "Poppins_400Regular" }}
                        className="text-[16px] text-black"
                      >
                        Set Reminder Notification
                      </Text>
                      <Switch
                        value={reminderEnabled}
                        onValueChange={setReminderEnabled}
                        trackColor={{ false: "#d1d5db", true: "#4a5b87" }}
                        thumbColor={Platform.OS === "ios" ? undefined : "#f4f3f4"}
                      />
                    </View>
                    <Text
                      style={{ fontFamily: "Poppins_400Regular" }}
                      className="text-[12px] text-[#606060]"
                    >
                      Would you like a reminder before this message sends?
                    </Text>

                    {reminderEnabled && (
                      <View className="mt-2 gap-1">
                        {REMINDER_INTERVALS.map((interval) => (
                          <TouchableOpacity
                            key={interval.id}
                            onPress={() => setSelectedReminderInterval(interval.id)}
                            className="py-3 border-b border-[#f5f5f5]"
                          >
                            <Text
                              style={{ 
                                fontFamily: "Poppins_400Regular",
                                color: selectedReminderInterval === interval.id ? "#4a5b87" : "black"
                              }}
                              className="text-[14px]"
                            >
                              {interval.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  {(showDatePicker || Platform.OS === "ios") && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={onDateChange}
                      minimumDate={new Date()}
                    />
                  )}

                  {(showTimePicker || Platform.OS === "ios") && (
                    <DateTimePicker
                      value={selectedTime}
                      mode="time"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={onTimeChange}
                    />
                  )}
                </View>
              )}
            </View>

            {/* Open When... */}
            <View>
              <TouchableOpacity
                onPress={() => toggleSection("open-when")}
                activeOpacity={0.7}
                className="bg-white h-[58px] rounded-[8px] px-4 flex-row items-center justify-between shadow-md"
                style={{
                  elevation: 4,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                }}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons
                    name={
                      selectedMethod === "open-when"
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={24}
                    color={
                      selectedMethod === "open-when" ? "#2f3a56" : "#9daaca"
                    }
                  />
                  <Text className="text-[20px]">🎓</Text>
                  <Text
                    style={{ fontFamily: "Poppins_400Regular" }}
                    className="text-[16px] text-black"
                  >
                    Open When...
                  </Text>
                </View>
                <Ionicons
                  name={
                    expandedSection === "open-when"
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={24}
                  color="black"
                />
              </TouchableOpacity>

              {expandedSection === "open-when" && (
                <View 
                  className="mt-2 p-6 bg-[#f9fafb] rounded-[16px] gap-6 shadow-sm"
                  style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  }}
                >
                  <Text
                    style={{ fontFamily: "Poppins_400Regular" }}
                    className="text-[12px] text-black leading-[18px]"
                  >
                    Choose when this message should be unlocked. You can pick milestones, emotions, or create your own.
                  </Text>

                  {/* Categories */}
                  <View className="gap-2">
                    <Text
                      style={{ fontFamily: "Poppins_400Regular" }}
                      className="text-[16px] text-black"
                    >
                      Categories
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row gap-2 pr-4">
                        {OPEN_WHEN_CATEGORIES.map((category) => {
                          const isActive = activeCategory === category.id;
                          return (
                            <TouchableOpacity
                              key={category.id}
                              onPress={() => setActiveCategory(category.id)}
                              activeOpacity={0.7}
                              className={`flex-row items-center gap-2 px-4 py-3 rounded-[8px] ${
                                isActive ? "bg-[#4a5b87]" : "bg-white border border-[#e5e7eb]"
                              }`}
                            >
                              <Text className="text-[14px]">{category.emoji}</Text>
                              <Text
                                style={{
                                  fontFamily: "Poppins_400Regular",
                                  color: isActive ? "white" : "black",
                                }}
                                className="text-[12px]"
                              >
                                {category.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Select Tags */}
                  <View className="gap-4">
                    <Text
                      style={{ fontFamily: "Poppins_400Regular" }}
                      className="text-[16px] text-black"
                    >
                      Select Tags
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                      {OPEN_WHEN_TAGS[activeCategory].map((tag) => {
                        const isSelected = selectedScenario === tag.id;
                        return (
                          <TouchableOpacity
                            key={tag.id}
                            onPress={() => setSelectedScenario(tag.id)}
                            activeOpacity={0.7}
                            className={`w-[47%] bg-white border-2 rounded-[16px] p-3 items-center justify-center gap-2 shadow-sm ${
                              isSelected ? "border-[#4a5b87]" : "border-[#e8e8e8]"
                            }`}
                            style={{
                              elevation: 2,
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.1,
                              shadowRadius: 4,
                              minHeight: 115,
                            }}
                          >
                            {tag.image ? (
                              <Image source={tag.image} style={{ width: 33, height: 33 }} resizeMode="contain" />
                            ) : (
                              <Text className="text-[33px]">{tag.emoji}</Text>
                            )}
                            <Text
                              style={{ fontFamily: "Poppins_400Regular" }}
                              className="text-[14px] text-black text-center"
                            >
                              {tag.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}

                      {/* Add Custom Tag */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        className="w-[47%] bg-[#d1e2f9] border-2 border-[#6099ea] border-dashed rounded-[16px] p-3 items-center justify-center gap-2 shadow-sm"
                        style={{
                          elevation: 2,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          minHeight: 115,
                        }}
                      >
                        <Ionicons name="add" size={33} color="#6099ea" />
                        <Text
                          style={{ fontFamily: "Poppins_400Regular" }}
                          className="text-[14px] text-[#6099ea] text-center"
                        >
                          Add Custom
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Send Now */}
            <TouchableOpacity
              onPress={() => {
                setSelectedMethod("send-now");
                setExpandedSection(null);
              }}
              activeOpacity={0.7}
              className="bg-white h-[58px] rounded-[8px] px-4 flex-row items-center justify-between shadow-md"
              style={{
                elevation: 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
              }}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name={
                    selectedMethod === "send-now"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={24}
                  color={selectedMethod === "send-now" ? "#2f3a56" : "#9daaca"}
                />
                <Ionicons name="send" size={24} color="#6d7faf" />
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="text-[16px] text-black"
                >
                  Send Now
                </Text>
              </View>
            </TouchableOpacity>

            {/* Save For Later */}
            <TouchableOpacity
              onPress={() => {
                setSelectedMethod("save-later");
                setExpandedSection(null);
              }}
              activeOpacity={0.7}
              className="bg-white h-[58px] rounded-[8px] px-4 flex-row items-center justify-between shadow-md"
              style={{
                elevation: 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
              }}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name={
                    selectedMethod === "save-later"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={24}
                  color={selectedMethod === "save-later" ? "#2f3a56" : "#9daaca"}
                />
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#6d7faf"
                />
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="text-[16px] text-black"
                >
                  Save For Later
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f3f4f6] px-4 py-6">
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          disabled={!selectedMethod}
          className={`h-[60px] rounded-[8px] flex-row items-center justify-center gap-4 w-full ${
            selectedMethod ? "bg-[#2f3a56]" : "bg-[#2f3a5680]"
          }`}
        >
          <Text
            style={{ fontFamily: "Poppins_500Medium" }}
            className="text-white text-[16px]"
          >
            Next, Final Review
          </Text>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

