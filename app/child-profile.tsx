import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTabBarHeight } from "../hooks/useTabBarHeight";

interface Child {
  id: string;
  name: string;
  birthday: string;
  date: Date;
  showDatePicker: boolean;
}

export default function ChildProfileSetup() {
  const router = useRouter();
  const { scrollContentPadding } = useTabBarHeight();
  const [children, setChildren] = useState<Child[]>([
    {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      birthday: "",
      date: new Date(),
      showDatePicker: false,
    },
  ]);

  const handleBack = () => {
    // @ts-ignore
    const canGoBack = typeof router.canGoBack === "function" ? (router as any).canGoBack() : false;
    if (canGoBack) {
      router.back();
    } else {
      router.replace("/link-account");
    }
  };

  const updateChild = (index: number, updates: Partial<Child>) => {
    const newChildren = [...children];
    newChildren[index] = { ...newChildren[index], ...updates };
    setChildren(newChildren);
  };

  const onDateChange = (index: number, event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || children[index].date;
    const isIos = Platform.OS === "ios";
    
    const updates: Partial<Child> = {
      date: currentDate,
      showDatePicker: isIos,
    };

    if (event.type === "set" || isIos) {
      updates.birthday = currentDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    }
    
    updateChild(index, updates);
  };

  const handleOpenDatePicker = (index: number) => {
    updateChild(index, { showDatePicker: true });
  };

  const handleAddChild = () => {
    setChildren([
      ...children,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: "",
        birthday: "",
        date: new Date(),
        showDatePicker: false,
      },
    ]);
  };

  const handleRemoveChild = (index: number) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index));
    }
  };

  // Validate form - check if all children have name and birthday filled
  const isFormValid = () => {
    return children.every(child => 
      child.name.trim().length > 0 && 
      child.birthday.trim().length > 0
    );
  };

  const handleNext = () => {
    if (isFormValid()) {
      router.push("/family-space");
      console.log("Next pressed", { children });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
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
            className="text-[#1c2333] text-[22px] leading-[33px] text-center flex-1 pr-6"
          >
            Set Up Your Child’s Profile
          </Text>
        </View>
        {/* Progress Bar */}
        <View className="bg-[#2f3a561a] h-[5px] rounded-full overflow-hidden w-full">
          <View className="bg-[#2f3a56] h-full w-[25%]" />
        </View>
      </View>

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: scrollContentPadding(24) }}
          showsVerticalScrollIndicator={false}
        >
        <View className="gap-10">
          {children.map((child, index) => (
            <View key={child.id} className="gap-8">
              {index > 0 && (
                <View className="flex-row items-center justify-between border-t border-[#f3f4f6] pt-6 pb-2">
                  <Text style={{ fontFamily: "Poppins_700Bold" }} className="text-[#2f3a56] text-[18px]">
                    Child {index + 1}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => handleRemoveChild(index)}
                    activeOpacity={0.7}
                    className="p-2"
                  >
                    <Ionicons name="close-circle" size={28} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Name Field */}
              <View className="gap-3">
                <Text
                  style={{ fontFamily: "Poppins_600SemiBold" }}
                  className="text-[#1a1a1a] text-[18px] leading-[27px]"
                >
                  What’s Your Child’s Name?
                </Text>
                <View className={`border ${child.name.trim().length > 0 ? 'border-[#6099ea]' : 'border-[#79747e]'} rounded-[12px] h-[56px] px-4 flex-row items-center gap-3 bg-white`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: child.name.trim().length > 0 ? 0.1 : 0.05,
                    shadowRadius: 2,
                    elevation: child.name.trim().length > 0 ? 2 : 1,
                  }}
                >
                  <Ionicons name="person-outline" size={24} color={child.name.trim().length > 0 ? "#6099ea" : "#9ca3af"} />
                  <TextInput
                    value={child.name}
                    onChangeText={(text) => updateChild(index, { name: text })}
                    placeholder="Child’s Name"
                    placeholderTextColor="#9ca3af"
                    style={{ fontFamily: "Poppins_400Regular", fontSize: 16, color: "#1a1a1a" }}
                    className="flex-1"
                  />
                </View>
              </View>

              {/* Birthday Field */}
              <View className="gap-3">
                <Text
                  style={{ fontFamily: "Poppins_600SemiBold" }}
                  className="text-[#1a1a1a] text-[18px] leading-[27px]"
                >
                  What’s Your Child Birthday?
                </Text>
                <View className="flex-row gap-3 items-center">
                  <View className={`flex-1 border ${child.birthday.trim().length > 0 ? 'border-[#6099ea]' : 'border-[#79747e]'} rounded-[12px] h-[56px] px-4 justify-center bg-white`}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: child.birthday.trim().length > 0 ? 0.1 : 0.05,
                      shadowRadius: 2,
                      elevation: child.birthday.trim().length > 0 ? 2 : 1,
                    }}
                  >
                    <TextInput
                      value={child.birthday}
                      onChangeText={(text) => updateChild(index, { birthday: text })}
                      placeholder="Child’s Birthday"
                      placeholderTextColor="#49454f"
                      style={{ fontFamily: "Poppins_400Regular", fontSize: 16, color: "#49454f" }}
                      className="w-full"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => handleOpenDatePicker(index)}
                    activeOpacity={0.7}
                    className="bg-white rounded-[12px] h-[56px] w-[56px] items-center justify-center border border-gray-200"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Ionicons name="calendar-outline" size={24} color="#6099ea" />
                  </TouchableOpacity>
                </View>

                {child.showDatePicker && (
                  <DateTimePicker
                    value={child.date}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, date) => onDateChange(index, event, date)}
                    maximumDate={new Date()}
                  />
                )}
              </View>
            </View>
          ))}

          {/* Add Another Child Toggle */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleAddChild}
            className="flex-row items-center gap-3 py-3 px-2"
          >
            <View className="w-6 h-6 rounded-full border-2 border-[#6099ea] items-center justify-center">
              <Ionicons
                name="add"
                size={18}
                color="#6099ea"
              />
            </View>
            <Text
              style={{ fontFamily: "Poppins_600SemiBold" }}
              className="text-[#6099ea] text-[18px] leading-[27px]"
            >
              Add another child
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Next Button Fixed at Bottom */}
      <View className="px-4 pb-6 pt-4 bg-white border-t border-[#f3f4f6]">
        <View className="gap-4">
          <TouchableOpacity
            activeOpacity={isFormValid() ? 0.85 : 1}
            disabled={!isFormValid()}
            className={`${isFormValid() ? 'bg-[#2f3a56]' : 'bg-gray-300'} h-[60px] rounded-[12px] flex-row items-center justify-center gap-3 px-4 w-full`}
            onPress={handleNext}
            style={isFormValid() ? {
              shadowColor: "#2f3a56",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            } : {}}
          >
            <Text
              style={{ fontFamily: "Poppins_600SemiBold" }}
              className={`${isFormValid() ? 'text-white' : 'text-gray-500'} text-[16px]`}
            >
              Next
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={24} 
              color={isFormValid() ? "white" : "#9ca3af"} 
            />
          </TouchableOpacity>

          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-[#5a5a5a] text-[14px] leading-[21px] text-center"
          >
            These questions will help us personalize your experience and suggest meaningful messages to create.
          </Text>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
}

