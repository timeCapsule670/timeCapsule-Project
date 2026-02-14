import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTabBarHeight } from "../hooks/useTabBarHeight";

// Stripe Payment Links for each plan + billing period combination
const PAYMENT_LINKS: Record<string, Record<string, string>> = {
  premium: {
    month: "https://buy.stripe.com/test_fZu9AT9ym0tp7KW2Eq1Jm00",
    year: "https://buy.stripe.com/test_4gM14nbGu4JFghs4My1Jm01",
  },
  family: {
    month: "https://buy.stripe.com/test_fZu9AT6ma1xt3uGfrc1Jm02",
    year: "https://buy.stripe.com/test_6oU28rfWK5NJd5g92O1Jm03",
  },
};

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
    id: "premium",
    label: "Premium",
    monthlyPrice: "$14.99/mo",
    yearlyPrice: "$11.99/mo",
    monthlyBilling: "Cancel anytime",
    yearlyBilling: "billed $143.88 upfront",
    badge: "Save 20%",
  },
  {
    id: "family",
    label: "Family Plan",
    monthlyPrice: "$19.99/mo",
    yearlyPrice: "$15.99/mo",
    monthlyBilling: "Cancel anytime",
    yearlyBilling: "billed $191.88 upfront",
    badge: "Best Value - 20% off",
    isRecommended: true,
  },
];

interface Feature {
  label: string;
  free: string | boolean;
  premium: string | boolean;
  family: string | boolean;
}

const features: Feature[] = [
  { label: "Capsules", free: "Limited", premium: "Unlimited", family: "Unlimited" },
  {
    label: "Scheduling",
    free: "Basic (video, audio, text, image)",
    premium: "Advanced",
    family: "Advanced",
  },
  { label: "Storage", free: "Limited", premium: "Unlimited", family: "Shared vault" },
  { label: "Prompts", free: "Limited", premium: "AI memory", family: "AI memory" },
  {
    label: "Open-When triggers",
    free: false,
    premium: "Advanced",
    family: "Advanced",
  },
  {
    label: "Family linking",
    free: false,
    premium: "1 linked experience",
    family: "Parent + teen, multiple children",
  },
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
  const { scrollContentPadding } = useTabBarHeight();
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("year");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("family");
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

  const getPaymentLink = () => {
    return PAYMENT_LINKS[selectedPlanId]?.[billingPeriod] || "";
  };

  const openPaymentLink = async () => {
    const url = getPaymentLink();
    if (!url) {
      Alert.alert("Error", "Payment link not found for the selected plan.");
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    try {
      // Open Stripe checkout in external browser
      await Linking.openURL(url);
      // Navigate forward immediately — user completes payment in the browser
      // and returns to the app on the next screen
      router.push({
        pathname: "/creating-account",
        params: { plan: selectedPlanId, billing: billingPeriod },
      });
    } catch (error) {
      Alert.alert("Error", "Unable to open payment page. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTrial = () => {
    openPaymentLink();
  };

  // const handleSetupPayment = () => {
  //   openPaymentLink();
  // };

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
          contentContainerStyle={{ padding: 20, paddingTop: 54, paddingBottom: scrollContentPadding(40) }}
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
                const isSelected = selectedPlanId === plan.id;
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
                      onPress={() => setSelectedPlanId(plan.id)}
                      className={`rounded-[16px] px-4 py-5 flex-row items-center justify-between border-[3px] ${isSelected
                        ? "bg-[#4a5b87] border-[#4a5b87]"
                        : "bg-white border-transparent"
                        }`}
                    >
                      {/* Left Content */}
                      <View className="flex-row items-center gap-3">
                        <View
                          className={`rounded-full border-2 items-center justify-center ${isSelected ? "border-white bg-white/20" : "border-[#5a5a5a]"
                            }`}
                          style={{ width: 24, height: 24 }}
                        >
                          {isSelected && (
                            <Ionicons name="checkmark" size={16} color="white" />
                          )}
                        </View>
                        <View className="gap-1">
                          <Text
                            style={{ fontFamily: "Poppins_700Bold" }}
                            className={`text-[18px] leading-[27px] ${isSelected ? "text-[#f5f5f5]" : "text-[#4a5b87]"
                              }`}
                          >
                            {plan.label}
                          </Text>
                          <Text
                            style={{ fontFamily: "Poppins_400Regular" }}
                            className={`text-[12px] leading-[18px] ${isSelected ? "text-[#f5f5f5]" : "text-[#5a5a5a]"
                              }`}
                          >
                            30-day free trial
                          </Text>
                        </View>
                      </View>

                      {/* Right Content */}
                      <View className="gap-1 items-end">
                        <Text
                          style={{ fontFamily: "Poppins_700Bold" }}
                          className={`text-[18px] leading-[27px] ${isSelected ? "text-[#f5f5f5]" : "text-[#4a5b87]"
                            }`}
                        >
                          {price}
                        </Text>
                        <Text
                          style={{ fontFamily: "Poppins_400Regular" }}
                          className={`text-[12px] leading-[18px] ${isSelected ? "text-[#f5f5f5]" : "text-[#5a5a5a]"
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
              <View className="flex-row mb-2">
                <View className="flex-1" />
                <View className="flex-row flex-1 justify-between">
                  <Text
                    style={{ fontFamily: "Poppins_400Regular" }}
                    className="text-black text-[12px] leading-[18px] flex-1 text-center"
                  >
                    Free
                  </Text>
                  <Text
                    style={{ fontFamily: "Poppins_400Regular" }}
                    className="text-black text-[12px] leading-[18px] flex-1 text-center"
                  >
                    Premium
                  </Text>
                  <Text
                    style={{ fontFamily: "Poppins_400Regular" }}
                    className="text-black text-[12px] leading-[18px] flex-1 text-center"
                  >
                    Family
                  </Text>
                </View>
              </View>

              {/* Features List */}
              <View className="gap-2">
                {features.map((feature, index) => (
                  <View key={index} className="flex-row items-center">
                    <Text
                      style={{ fontFamily: "Poppins_400Regular" }}
                      className="flex-1 text-black text-[12px] leading-[18px] pr-2"
                    >
                      {feature.label}
                    </Text>
                    <View className="flex-row flex-1 justify-between">
                      {typeof feature.free === "string" ? (
                        <View className="items-center flex-1">
                          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                          <Text
                            style={{ fontFamily: "Poppins_400Regular" }}
                            className="text-[#5a5a5a] text-[10px] leading-[14px] text-center"
                            numberOfLines={2}
                          >
                            {feature.free}
                          </Text>
                        </View>
                      ) : feature.free ? (
                        <View className="flex-1 items-center">
                          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                        </View>
                      ) : (
                        <View className="flex-1 items-center">
                          <Ionicons name="lock-closed" size={18} color="#5a5a5a" />
                        </View>
                      )}
                      {typeof feature.premium === "string" ? (
                        <View className="items-center flex-1">
                          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                          <Text
                            style={{ fontFamily: "Poppins_400Regular" }}
                            className="text-[#5a5a5a] text-[10px] leading-[14px] text-center"
                            numberOfLines={2}
                          >
                            {feature.premium}
                          </Text>
                        </View>
                      ) : feature.premium ? (
                        <View className="flex-1 items-center">
                          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                        </View>
                      ) : (
                        <View className="flex-1 items-center">
                          <Ionicons name="lock-closed" size={18} color="#5a5a5a" />
                        </View>
                      )}
                      {typeof feature.family === "string" ? (
                        <View className="items-center flex-1">
                          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                          <Text
                            style={{ fontFamily: "Poppins_400Regular" }}
                            className="text-[#5a5a5a] text-[10px] leading-[14px] text-center"
                            numberOfLines={2}
                          >
                            {feature.family}
                          </Text>
                        </View>
                      ) : feature.family ? (
                        <View className="flex-1 items-center">
                          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                        </View>
                      ) : (
                        <View className="flex-1 items-center">
                          <Ionicons name="lock-closed" size={18} color="#5a5a5a" />
                        </View>
                      )}
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
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text
                  style={{ fontFamily: "Poppins_500Medium" }}
                  className="text-white text-[16px]"
                >
                  Start Your Free 30-Days
                </Text>
              )}
            </TouchableOpacity>

            {/* Set Up Payment Button
            <TouchableOpacity
              onPress={handleSetupPayment}
              activeOpacity={0.9}
              className="h-[52px] rounded-[8px] items-center justify-center w-full px-4 border-2 border-[#4a5b87] bg-white"
            >
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-[#4a5b87] text-[16px]"
              >
                Set Up Payment
              </Text>
            </TouchableOpacity>
            */}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

