import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

const PLAN_LABELS: Record<string, string> = {
  premium: "Premium",
  family: "Family Plan",
};

export default function PaymentSetup() {
  const router = useRouter();
  const { plan, billing } = useLocalSearchParams<{ plan?: string; billing?: string }>();
  const [isLoading, setIsLoading] = useState(false);

  const planName = PLAN_LABELS[plan || ""] || plan || "Unknown";
  const billingLabel = billing === "year" ? "Yearly" : "Monthly";

  const handleOpenPayment = async () => {
    const url = PAYMENT_LINKS[plan || ""]?.[billing || ""];
    if (!url) {
      Alert.alert("Error", "Payment link not found for the selected plan.");
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    try {
      // Open Stripe checkout in external browser
      await Linking.openURL(url);
      // Navigate forward immediately
      router.push({
        pathname: "/creating-account",
        params: { plan, billing },
      });
    } catch (error) {
      Alert.alert("Error", "Unable to open payment page. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View className="flex-1 bg-white px-6 pt-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2 py-2"
        >
          <Ionicons name="arrow-back" size={24} color="#4a5b87" />
          <Text
            style={{ fontFamily: "Poppins_500Medium" }}
            className="text-[#4a5b87] text-[16px]"
          >
            Back
          </Text>
        </TouchableOpacity>

        <View className="flex-1 justify-center items-center gap-4 px-4">
          <View className="bg-[#f3f4f6] rounded-full p-6">
            <Ionicons name="card-outline" size={64} color="#4a5b87" />
          </View>
          <Text
            style={{ fontFamily: "Poppins_700Bold" }}
            className="text-[#1d1b20] text-[22px] text-center"
          >
            Set Up Payment
          </Text>
          <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-[#5a5a5a] text-[14px] text-center"
          >
            Add your payment method to ensure uninterrupted access after your
            free trial ends.
          </Text>
          {plan && (
            <View className="bg-[#f0f0ff] rounded-[12px] px-4 py-3 items-center">
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-[#4a5b87] text-[14px]"
              >
                {planName} • {billingLabel}
              </Text>
            </View>
          )}

          {/* Proceed to Payment Button */}
          <TouchableOpacity
            onPress={handleOpenPayment}
            activeOpacity={0.9}
            className="bg-[#4a5b87] h-[56px] rounded-[12px] items-center justify-center w-full px-4 mt-4"
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-white text-[16px]"
              >
                Proceed to Payment
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
