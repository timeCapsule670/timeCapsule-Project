import { Home, Lock, Plus, X, FileText, User } from "lucide-react-native";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import MessageTypeSheet from "../../components/MessageTypeModal";
import { useTabBarHeight } from "../../hooks/useTabBarHeight";
import { usePromptSheet } from "../../context/PromptContext";

export default function TabLayout() {
  const { showSheet, selectedPrompt, closeSheet, toggleSheet } = usePromptSheet();
  const { bottomInset } = useTabBarHeight();

  return (
    <View style={{ flex: 1 }}>
      {/* Message Type Sheet - positioned behind tab bar */}
      <MessageTypeSheet
        visible={showSheet}
        onClose={closeSheet}
        selectedPrompt={selectedPrompt}
      />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#1d1b20",
          tabBarInactiveTintColor: "#49454f",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 1,
            borderTopColor: "#f3f4f6",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            height: (Platform.OS === "ios" ? 64 : 56) + bottomInset,
            paddingBottom: (Platform.OS === "ios" ? 24 : 12) + bottomInset,
            paddingTop: 8,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          },
          tabBarLabelStyle: {
            fontFamily: "Poppins_400Regular",
            fontSize: 12,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Home
                size={24}
                color={focused ? "#1d1b20" : color}
                strokeWidth={focused ? 2.5 : 1.5}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="vault"
          options={{
            title: "Vault",
            tabBarIcon: ({ color, focused }) => (
              <Lock
                size={24}
                color={focused ? "#1d1b20" : color}
                strokeWidth={focused ? 2.5 : 1.5}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "",
            tabBarIcon: () => (
              <View
                style={{
                  backgroundColor: "#4a5b87",
                  width: 45,
                  height: 45,
                  borderRadius: 22.5,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: -8,
                }}
              >
                {showSheet ? (
                  <X size={28} color="white" strokeWidth={2.5} />
                ) : (
                  <Plus size={28} color="white" strokeWidth={2.5} />
                )}
              </View>
            ),
            tabBarLabel: "",
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              toggleSheet();
            },
          }}
        />
        <Tabs.Screen
          name="prompts"
          options={{
            title: "Prompts",
            tabBarIcon: ({ color, focused }) => (
              <FileText
                size={24}
                color={focused ? "#1d1b20" : color}
                strokeWidth={focused ? 2.5 : 1.5}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <User
                size={24}
                color={focused ? "#1d1b20" : color}
                strokeWidth={focused ? 2.5 : 1.5}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
