import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colores } from "../../constants/Colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colores.naranja,
        tabBarInactiveTintColor: Colores.textoGrisMedio,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colores.fondoPrincipal,
          borderTopWidth: 1,
          borderTopColor: Colores.bordeOscuro,
          paddingTop: 10,
          height: Platform.OS === "ios" ? 90 : 70 + insets.bottom,
          paddingBottom: Platform.OS === "ios" ? 30 : 10 + insets.bottom,
          ...Platform.select({
            ios: {
              shadowColor: Colores.sombra,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracion"
        options={{
          title: "Configuración",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
