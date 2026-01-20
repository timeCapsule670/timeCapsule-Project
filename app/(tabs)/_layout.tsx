import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useState } from "react";
import { Platform, View } from "react-native";
import MessageTypeSheet from "../../components/MessageTypeModal";

export default function TabLayout() {
  const [showMessageTypeSheet, setShowMessageTypeSheet] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* Message Type Sheet - positioned behind tab bar */}
      <MessageTypeSheet
        visible={showMessageTypeSheet}
        onClose={() => setShowMessageTypeSheet(false)}
      />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#1d1b20",
          tabBarInactiveTintColor: "#49454f",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            height: Platform.OS === "ios" ? 88 : 64,
            paddingBottom: Platform.OS === "ios" ? 24 : 8,
            paddingTop: 8,
            zIndex: 200,
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
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={focused ? "#1d1b20" : color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="vault"
          options={{
            title: "Vault",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "lock-closed" : "lock-closed-outline"}
                size={24}
                color={focused ? "#1d1b20" : color}
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
                <Ionicons
                  name={showMessageTypeSheet ? "close" : "add"}
                  size={28}
                  color="white"
                />
              </View>
            ),
            tabBarLabel: "",
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowMessageTypeSheet(!showMessageTypeSheet);
            },
          }}
        />
        <Tabs.Screen
          name="prompts"
          options={{
            title: "Prompts",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "document-text" : "document-text-outline"}
                size={24}
                color={focused ? "#1d1b20" : color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={focused ? "#1d1b20" : color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
