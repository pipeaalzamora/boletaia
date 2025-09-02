import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colores } from "../constants/Colors";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Cargando..." }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colores.naranja} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colores.fondoPrincipal,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: Colores.textoGrisMedio,
    textAlign: "center",
  },
});
