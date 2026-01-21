import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PricingPlan {
  id: string;
  label: string;
  monthlyPrice: string;
  yearlyPrice: string;
  monthlyBilling: string;
  yearlyBilling: string;
  badge?: string;
  isRecommended?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "12months",
    label: "12 Months",
    monthlyPrice: "$5.99/mo",
    yearlyPrice: "$4.17/mo",
    monthlyBilling: "Cancel anytime",
    yearlyBilling: "billed $49.99 upfront",
    badge: "Best Value - 30% off",
    isRecommended: true,
  },
  {
    id: "6months",
    label: "6 Months",
    monthlyPrice: "$5.99/mo",
    yearlyPrice: "$5.00/mo",
    monthlyBilling: "Cancel anytime",
    yearlyBilling: "billed $29.99 upfront",
    badge: "Save 17%",
  },
  {
    id: "1month",
    label: "1 Month",
    monthlyPrice: "$5.99/mo",
    yearlyPrice: "$5.99/mo",
    monthlyBilling: "Cancel anytime",
    yearlyBilling: "Cancel anytime",
  },
];

interface Feature {
  label: string;
  free: boolean;
  premium: boolean;
}

const features: Feature[] = [
  { label: "View Memories", free: true, premium: true },
  { label: "Create and Schedule Messages", free: false, premium: true },
  { label: 'Use "Open When" Delivery', free: false, premium: true },
  { label: "Link Family Accounts", free: false, premium: true },
  { label: "Add comments & Replies", free: false, premium: true },
  { label: "Daily Prompt Inspiration", free: false, premium: true },
];

interface TimelineItem {
  day: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg?: string;
}

const timelineItems: TimelineItem[] = [
  {
    day: "Now",
    title: "Now",
    description: "Get full access to all features",
    icon: "play-circle",
    iconBg: undefined,
  },
  {
    day: "Day 28",
    title: "Day 28",
    description: "Reminder before trial ends",
    icon: "notifications",
    iconBg: "#fcb32b",
  },
  {
    day: "Day 30",
    title: "Day 30",
    description: "Subscription begins (cancel anytime)",
    icon: "star",
    iconBg: "#8A5FCC",
  },
];

export default function Pricing() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("year");
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    // @ts-ignore
    const canGoBack = typeof router.canGoBack === "function" ? (router as any).canGoBack() : false;
    if (canGoBack) {
      router.back();
    } else {
      router.replace("/category");
    }
  };

  const handleStartTrial = () => {
    if (isLoading) return;
    setIsLoading(true);
    router.push("/creating-account");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#d1e2f9", "#c28fef"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center gap-6">
            {/* Header */}
            <View className="gap-2 items-start w-full">
              <Text
                style={{ fontFamily: "Poppins_700Bold" }}
                className="text-[#4a5b87] text-[26px] leading-[39px] text-center w-full"
              >
                Give your family the full TimeCapsule experience
              </Text>
              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-[#5a5a5a] text-[12px] leading-[18px] text-center w-full"
              >
                Premium unlocks all the ways to capture, schedule, and share memories that last forever.
              </Text>
            </View>

            {/* Month/Year Toggle */}
            <View className="bg-[#a4a4a4] rounded-[16px] flex-row w-64 overflow-hidden">
              <TouchableOpacity
                onPress={() => setBillingPeriod("month")}
                activeOpacity={0.8}
                className={`flex-1 py-4 px-4 rounded-[16px] ${billingPeriod === "month" ? "" : ""}`}
              >
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className={`text-[16px] leading-[21px] text-center ${billingPeriod === "month" ? "text-black" : "text-white"
                    }`}
                >
                  Month
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setBillingPeriod("year")}
                activeOpacity={0.8}
                className={`flex-1 py-4 px-4 rounded-[16px] ${billingPeriod === "year" ? "bg-[#4a5b87]" : ""}`}
              >
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className={`text-[16px] leading-[21px] text-center ${billingPeriod === "year" ? "text-white" : "text-black"
                    }`}
                >
                  Year
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pricing Plans */}
            <View className="gap-4 w-full">
              {pricingPlans.map((plan) => {
                const isRecommended = plan.isRecommended && billingPeriod === "year";
                const price =
                  billingPeriod === "year" ? plan.yearlyPrice : plan.monthlyPrice;
                const billing =
                  billingPeriod === "year" ? plan.yearlyBilling : plan.monthlyBilling;

                return (
                  <View key={plan.id} className="relative">
                    {/* Badge */}
                    {plan.badge && billingPeriod === "year" && (
                      <View className="absolute -top-3 left-4 z-10 bg-[#fcb32b] px-4 py-1 rounded-[8px]">
                        <Text
                          style={{ fontFamily: "Poppins_400Regular" }}
                          className="text-black text-[12px] leading-[18px]"
                        >
                          {plan.badge}
                        </Text>
                      </View>
                    )}

                    {/* Card */}
                    <TouchableOpacity
                      activeOpacity={0.9}
                      className={`rounded-[16px] px-4 py-5 flex-row items-center justify-between ${isRecommended
                        ? "bg-[#4a5b87] border-[3px] border-[#4a5b87]"
                        : "bg-white"
                        }`}
                    >
                      {/* Left Content */}
                      <View className="gap-1">
                        <Text
                          style={{ fontFamily: "Poppins_700Bold" }}
                          className={`text-[18px] leading-[27px] ${isRecommended ? "text-[#f5f5f5]" : "text-[#4a5b87]"
                            }`}
                        >
                          {plan.label}
                        </Text>
                        <Text
                          style={{ fontFamily: "Poppins_400Regular" }}
                          className={`text-[12px] leading-[18px] ${isRecommended ? "text-[#f5f5f5]" : "text-[#5a5a5a]"
                            }`}
                        >
                          30-day free trial
                        </Text>
                      </View>

                      {/* Right Content */}
                      <View className="gap-1 items-end">
                        <Text
                          style={{ fontFamily: "Poppins_700Bold" }}
                          className={`text-[18px] leading-[27px] ${isRecommended ? "text-[#f5f5f5]" : "text-[#4a5b87]"
                            }`}
                        >
                          {price}
                        </Text>
                        <Text
                          style={{ fontFamily: "Poppins_400Regular" }}
                          className={`text-[12px] leading-[18px] ${isRecommended ? "text-[#f5f5f5]" : "text-[#5a5a5a]"
                            }`}
                        >
                          {billing}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>


            {/* What You Get */}
            <View className="bg-white rounded-[16px] p-4 w-full gap-6 shadow-lg">
              <Text
                style={{ fontFamily: "Poppins_700Bold" }}
                className="text-black text-[18px] leading-[27px] text-center"
              >
                What You Get
              </Text>

              {/* Header Row */}
              <View className="flex-row justify-end gap-[30px] mb-2">
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="text-black text-[12px] leading-[18px]"
                >
                  Free
                </Text>
                <Text
                  style={{ fontFamily: "Poppins_400Regular" }}
                  className="text-black text-[12px] leading-[18px]"
                >
                  Premium
                </Text>
              </View>

              {/* Features List */}
              <View className="gap-2">
                {features.map((feature, index) => (
                  <View key={index} className="flex-row items-center justify-between">
                    <Text
                      style={{ fontFamily: "Poppins_400Regular" }}
                      className="flex-1 text-black text-[12px] leading-[18px]"
                    >
                      {feature.label}
                    </Text>
                    <View className="flex-row items-center justify-between w-[114px]">
                      {feature.free ? (
                        <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                      ) : (
                        <Ionicons name="lock-closed" size={19} color="#5a5a5a" />
                      )}
                      <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Your Trial Timeline */}
            <View className="bg-white rounded-[16px] p-4 w-full gap-6 shadow-lg">
              <Text
                style={{ fontFamily: "Poppins_700Bold" }}
                className="text-black text-[18px] leading-[27px] text-center"
              >
                Your Trial Timeline
              </Text>

              <View className="gap-4">
                {timelineItems.map((item, index) => (
                  <View key={index} className="flex-row gap-3 items-center">
                    <View
                      className="items-center justify-center"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        overflow: "hidden",
                        backgroundColor: item.iconBg || "transparent",
                      }}
                    >
                      {item.icon === "play-circle" ? (
                        <Ionicons name="play-circle" size={48} color="#4a5b87" />
                      ) : item.icon === "notifications" ? (
                        <Ionicons name="notifications" size={24} color="#9E6802" />
                      ) : item.icon === "star" ? (
                        <Ionicons name="star" size={24} color="#ffffff" />
                      ) : null}
                    </View>
                    <View className="flex-1 gap-2">
                      <Text
                        style={{ fontFamily: "Poppins_700Bold" }}
                        className="text-black text-[18px] leading-[27px]"
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{ fontFamily: "Poppins_400Regular" }}
                        className="text-[#5a5a5a] text-[12px] leading-[18px]"
                      >
                        {item.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Start Your Free 30-Days Button */}
            <TouchableOpacity
              onPress={handleStartTrial}
              activeOpacity={0.9}
              className="bg-[#2f3a56] h-[60px] rounded-[8px] items-center justify-center w-full px-4"
            >
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-white text-[16px]"
              >
                Start Your Free 30-Days
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

