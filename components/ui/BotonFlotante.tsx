/**
 * Componente BotonFlotante - Botón flotante que respeta las safe areas
 */

import React from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colores } from "../../constants/Colors";

interface BotonFlotanteProps {
  onPress: () => void;
  children: React.ReactNode;
  estiloPersonalizado?: object;
  activeOpacity?: number;
}

export function BotonFlotante({
  onPress,
  children,
  estiloPersonalizado = {},
  activeOpacity = 0.8,
}: BotonFlotanteProps) {
  const insets = useSafeAreaInsets();

  const estiloConSafeArea = {
    ...estilos.botonFlotante,
    bottom: Platform.OS === "ios" ? -20 + insets.bottom : -20 + insets.bottom,
    ...estiloPersonalizado,
  };

  return (
    <TouchableOpacity
      style={estiloConSafeArea}
      onPress={onPress}
      activeOpacity={activeOpacity}
    >
      {children}
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  botonFlotante: {
    position: "absolute",
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colores.naranja,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colores.naranja,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
