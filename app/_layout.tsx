import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Colores } from "../constants/Colors";
import { AuthProvider } from "../context/AuthContext";
import { BoletasProvider } from "../context/BoletasContext";
import { ReportesProvider } from "../context/ReportesContext";

// Tema personalizado para BoletaIA
const TemaBoletaIA = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colores.naranja,
    background: Colores.fondoPrincipal,
    card: Colores.fondoTarjeta,
    text: Colores.textoBlanco,
    border: Colores.bordeOscuro,
    notification: Colores.naranja,
  },
};

// Componente para el fondo del StatusBar en edge-to-edge
function StatusBarBackground() {
  const insets = useSafeAreaInsets();

  if (Platform.OS !== "android") {
    return null;
  }

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: insets.top,
        backgroundColor: Colores.fondoPrincipal,
        zIndex: 1000,
      }}
    />
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <BoletasProvider>
            <ReportesProvider>
              <ThemeProvider value={TemaBoletaIA}>
                <StatusBarBackground />
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                  <Stack.Screen
                    name="login"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="registro"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="auth/callback"
                    options={{ 
                      headerShown: false,
                      gestureEnabled: false // Evitar que el usuario pueda regresar manualmente
                    }}
                  />
                  <Stack.Screen
                    name="perfil"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="agregar-boleta"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="editar-boleta"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="configuracion-notificaciones"
                    options={{ headerShown: false }}
                  />
                </Stack>
                <StatusBar style="light" />
              </ThemeProvider>
            </ReportesProvider>
          </BoletasProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
