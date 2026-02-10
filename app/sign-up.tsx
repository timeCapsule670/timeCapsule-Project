import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { AuthUserResponse } from "./models/auth-user-reponse";
import { authConfig } from "./utils/auth-config";
import { saveAccessToken, saveIdToken } from "./utils/token-storage";

export default function SignUp() {
  const router = useRouter();


  const handleSignIn = async () =>
  {
    console.info("🔐 Starting sign-in flow");

    const request = new AuthSession.AuthRequest({
      clientId: authConfig.clientId,
      scopes: authConfig.scopes,
      redirectUri: authConfig.redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    });

    console.debug("📡 Building auth request");
    await request.makeAuthUrlAsync(authConfig.discovery);

    console.info("🌐 Opening system browser for authentication");
    const result = await request.promptAsync(authConfig.discovery);


    if (result.type !== "success") {
      const message = `Authentication cancelled or failed: ${result.type}`;
      console.warn(message);
      AuthSession.dismiss();
      throw new Error(message);
    }

    console.info("✅ Authorization code received");

    if (!request.codeVerifier) {
      throw new Error("Missing PKCE code verifier");
    }

    console.info("🔁 Exchanging authorization code for tokens");

    const tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        clientId: authConfig.clientId,
        code: result.params.code,
        redirectUri: authConfig.redirectUri,
        extraParams: {
          code_verifier: request.codeVerifier,
        },
      },
      authConfig.discovery
    );

    if (!tokenResponse.accessToken) {
      handleSignUpFauilure(new Error("Access token missing from token response"));
    }

    console.info("💾 Storing access token");

    await saveAccessToken(
      tokenResponse.accessToken,
      tokenResponse.expiresIn
    );

    if (tokenResponse.idToken) {
      await saveIdToken?.(tokenResponse.idToken);
    }

    console.info("🎉 Sign-in successful");

    handleSignUpSuccess(new AuthUserResponse(
      tokenResponse.accessToken,
      tokenResponse.expiresIn!,
      tokenResponse.idToken
    ));
  };

  const handleSignUpSuccess = (authResponse: AuthUserResponse) => {
    // Show success toast at the bottom
    Toast.success("Login successful!", "bottom");

    // Navigate to profile information page after toast displays
    setTimeout(() => {
      router.replace("/profile-information");
    }, 2500);
  };

  const handleSignUpFauilure = (error: Error) => {
    // Show error toast at the bottom
    Toast.error(`Login failed: ${error.message}`, "bottom");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-between px-5 py-[57px]">
          {/* Icon Container */}
          <View className="items-center justify-center w-full pt-0">
            
              <Image
                source={require("../assets/images/unlock.png")}
                style={{ width: 60, height: 60 }}
                resizeMode="contain"
              />
          </View>

          {/* Content Section */}
          <View className="flex-1 justify-center gap-6 w-full">
            {/* Title and Description */}
            <View className="gap-4 items-center">
              <Text
                style={{ fontFamily: "Poppins_700Bold" }}
                className="text-[#4a5b87] text-[32px] leading-[48px] text-center"
              >
                Ready to Unlock Your Timecapsule?
              </Text>
              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-[#5a5a5a] text-[16px] leading-[21px] text-center"
              >
                Sign in to start saving memories or enter your unique code to join your family's capsule
              </Text>
            </View>

            {/* Sign Up Buttons */}
            <View className="gap-4 w-full">
              {/* Email Sign Up */}
              <TouchableOpacity
                onPress={() => handleSignIn()}
                activeOpacity={0.9}
                className="bg-white rounded-[8px] px-10 py-4 flex-row items-center justify-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 8,
                }}
              >
                <Image
                  source={require("../assets/images/email.png")}
                  style={{ width: 29.4, height: 29.4 }}
                  resizeMode="contain"
                />
                <Text
                  style={{ fontFamily: "Poppins_500Medium" }}
                  className="text-black text-[16px]"
                >
                  Sign In/Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Section */}
          <View className="gap-6 mt-8 items-center w-full pb-0">
            {/* OR Divider */}
            <View className="flex-row items-center gap-[18px] w-full">
              <View className="flex-1 h-px bg-[#777]" />
              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-[#777] text-[16px] tracking-[0.5px]"
              >
                OR
              </Text>
              <View className="flex-1 h-px bg-[#777]" />
            </View>

            {/* Have a code Button */}
            <TouchableOpacity
              onPress={() => handleSignUpSuccess}
              activeOpacity={0.9}
              className="bg-[#fcb32b] h-[60px] rounded-[8px] items-center justify-center w-full px-4"
            >
              <Text
                style={{ fontFamily: "Poppins_500Medium" }}
                className="text-black text-[16px]"
              >
                Have a code? Enter it here
              </Text>
            </TouchableOpacity>

            {/* Terms and Version */}
            <View className="gap-[11px] items-center">
              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-[#5a5a5a] text-[12px] leading-[18px] text-center"
              >
                By continuing, you agree to our{" "}
                <Text style={{ fontFamily: "Poppins_700Bold" }}>Terms of Service</Text> and{" "}
                <Text style={{ fontFamily: "Poppins_700Bold" }}>Privacy Policy</Text>
              </Text>
              <Text
                style={{ fontFamily: "Poppins_400Regular" }}
                className="text-[#5a5a5a] text-[12px] leading-[18px]"
              >
                Version 1.0.0
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

