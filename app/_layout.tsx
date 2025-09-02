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
import { ErrorBoundary } from "../components/ErrorBoundary";
import { LoadingScreen } from "../components/LoadingScreen";
import { Colores } from "../constants/Colors";
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
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Manejar errores de carga de fuentes
  if (error) {
    console.error("Error loading fonts:", error);
  }

  if (!loaded && !error) {
    // Mostrar pantalla de carga mientras se cargan las fuentes
    return <LoadingScreen message="Cargando fuentes..." />;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BoletasProvider>
            <ReportesProvider>
              <ThemeProvider value={TemaBoletaIA}>
                <StatusBarBackground />
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="light" />
              </ThemeProvider>
            </ReportesProvider>
          </BoletasProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
