/**
 * Pantalla de Callback OAuth para BoletaIA
 * Maneja el retorno desde Google OAuth y procesa la autenticación
 */

import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

import { Colores } from "../../constants/Colors";
import { Tipografia } from "../../constants/Tipografia";
import { useAuth } from "../../context/AuthContext";
import { servicioAuth } from "../../services/ServicioAutenticacion";

export default function OAuthCallbackScreen() {
  const { usuario, estaAutenticado } = useAuth();
  const [procesando, setProcesando] = useState(true);
  const [mensaje, setMensaje] = useState("Procesando tu información...");

  useEffect(() => {
    // Si ya está autenticado, redirigir inmediatamente
    if (estaAutenticado && usuario) {
      console.log("Usuario ya autenticado, redirigiendo...");
      router.replace("/(tabs)");
      return;
    }

    // Procesar el callback OAuth
    const procesarCallback = async () => {
      try {
        console.log("🔍 Procesando callback OAuth...");
        setMensaje("Verificando autenticación...");

        // Obtener la URL actual que activó esta pantalla
        const url = await Linking.getInitialURL();
        console.log("🔍 URL recibida:", url);

        if (url && url.includes("access_token")) {
          console.log("URL con tokens encontrada, procesando...");
          setMensaje("Estableciendo sesión...");

          // Procesar el callback OAuth con la URL
          const usuarioOAuth = await servicioAuth.procesarCallbackOAuth(url);

          if (usuarioOAuth) {
            console.log("OAuth exitoso para:", usuarioOAuth.nombre);
            setMensaje("¡Autenticación exitosa! Redirigiendo...");

            // Pequeña pausa para mostrar el éxito
            setTimeout(() => {
              router.replace("/(tabs)");
            }, 1500);
            return;
          }
        }

        // Fallback: verificar si hay una sesión válida
        console.log("Verificando sesión existente...");
        const sesionValida = await servicioAuth.verificarSesion();

        if (sesionValida) {
          console.log("Sesión OAuth válida encontrada");

          // Obtener el usuario actual
          const usuarioActual = await servicioAuth.obtenerUsuarioActual();

          if (usuarioActual) {
            console.log("OAuth exitoso para:", usuarioActual.nombre);
            setMensaje("¡Autenticación exitosa! Redirigiendo...");

            // Pequeña pausa para mostrar el éxito
            setTimeout(() => {
              router.replace("/(tabs)");
            }, 1500);
            return;
          }
        }

        // Si no hay sesión válida, redirigir al login
        console.log("No se encontró sesión válida, redirigiendo al login");
        setMensaje("No se pudo completar la autenticación");
        setTimeout(() => {
          router.replace("/login");
        }, 2000);
      } catch (error) {
        console.error("Error procesando callback OAuth:", error);
        setProcesando(false);

        Alert.alert(
          "Error de Autenticación",
          "Hubo un problema al procesar la autenticación. Inténtalo de nuevo.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/login"),
            },
          ]
        );
      }
    };

    // Pequeña pausa antes de procesar para permitir que el deep link se establezca
    const timeout = setTimeout(() => {
      procesarCallback();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [estaAutenticado, usuario]);

  return (
    <View style={estilos.container}>
      <View style={estilos.content}>
        <View style={estilos.iconContainer}>
          <Ionicons
            name={procesando ? "sync" : "checkmark-circle"}
            size={80}
            color={procesando ? Colores.naranja : Colores.verde}
          />
        </View>

        <Text style={estilos.titulo}>
          {procesando ? "Procesando..." : "¡Autenticación Exitosa!"}
        </Text>
        <Text style={estilos.mensaje}>{mensaje}</Text>

        {procesando && (
          <ActivityIndicator
            size="large"
            color={Colores.naranja}
            style={estilos.loader}
          />
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colores.fondoPrincipal,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: 24,
  },
  titulo: {
    ...Tipografia.titulo,
    color: Colores.textoBlanco,
    textAlign: "center",
    marginBottom: 16,
  },
  mensaje: {
    ...Tipografia.cuerpo,
    color: Colores.textoGrisMedio,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  loader: {
    marginTop: 16,
  },
});
