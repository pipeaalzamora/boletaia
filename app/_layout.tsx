import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colores } from '../constants/Colors';
import { BoletasProvider } from '../context/BoletasContext';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BoletasProvider>
        <ThemeProvider value={TemaBoletaIA}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="agregar-boleta" options={{ headerShown: false }} />
            <Stack.Screen name="editar-boleta" options={{ headerShown: false }} />
            <Stack.Screen name="configuracion-notificaciones" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="light" backgroundColor={Colores.fondoPrincipal} />
        </ThemeProvider>
      </BoletasProvider>
    </GestureHandlerRootView>
  );
}
