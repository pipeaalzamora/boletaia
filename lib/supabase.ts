/**
 * Configuración de Supabase para BoletaIA
 * Cliente inicializado para autenticación y base de datos
 * Compatible con React Native, Web y SSR
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

// Configuración del cliente Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables de entorno de Supabase. Verifica EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env"
  );
}

// Detectar entorno y configurar storage apropiado
const getStorage = () => {
  // En entorno servidor (Node.js/SSR)
  if (typeof window === "undefined") {
    return {
      getItem: async (key: string) => null,
      setItem: async (key: string, value: string) => {},
      removeItem: async (key: string) => {},
    };
  }

  // En web browser
  if (Platform.OS === "web") {
    return {
      getItem: async (key: string) => {
        if (typeof localStorage !== "undefined") {
          return localStorage.getItem(key);
        }
        return null;
      },
      setItem: async (key: string, value: string) => {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(key, value);
        }
      },
      removeItem: async (key: string) => {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(key);
        }
      },
    };
  }

  // En React Native (iOS/Android)
  return AsyncStorage;
};

// Crear cliente Supabase con configuración universal
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Usar storage apropiado según el entorno
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: typeof window !== "undefined", // Solo persistir en cliente
    detectSessionInUrl: false, // Importante para React Native
    // Configuración adicional para web
    ...(Platform.OS === "web" && {
      flowType: "pkce",
    }),
  },
});

// Exportar tipos útiles
export type { User } from "@supabase/supabase-js";
