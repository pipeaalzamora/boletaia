/**
 * Pantalla Configuración - Configuraciones de la aplicación BoletaIA
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter } from "expo-router";

import { TarjetaConfiguracion } from "../../components/ui/TarjetaBase";
import { Colores } from "../../constants/Colors";
import { EstilosBase } from "../../constants/EstilosBase";
import { Tipografia } from "../../constants/Tipografia";
import { useBoletasContext } from "../../context/BoletasContext";

export default function ConfiguracionScreen() {
  const router = useRouter();
  const { usuario, configuracionNotificaciones, configurarNotificaciones } =
    useBoletasContext();

  const manejarCambioNotificacion = async (campo: string, valor: boolean) => {
    if (configuracionNotificaciones) {
      try {
        await configurarNotificaciones({
          ...configuracionNotificaciones,
          [campo]: valor,
        });
      } catch (error) {
        console.error("Error al actualizar configuración:", error);
      }
    }
  };

  const OpcionConfiguracion = ({
    titulo,
    descripcion,
    icono,
    valor,
    onCambio,
    tipo = "switch",
  }: {
    titulo: string;
    descripcion?: string;
    icono: string;
    valor?: boolean;
    onCambio?: (valor: boolean) => void;
    tipo?: "switch" | "navegacion";
  }) => (
    <TarjetaConfiguracion estiloPersonalizado={estilos.opcionContainer}>
      <View style={estilos.opcionContent}>
        <View style={estilos.opcionInfo}>
          <Ionicons
            name={icono as any}
            size={24}
            color={Colores.naranja}
            style={estilos.opcionIcono}
          />
          <View style={estilos.opcionTexto}>
            <Text style={Tipografia.cuerpo}>{titulo}</Text>
            {descripcion && (
              <Text style={Tipografia.pequeno}>{descripcion}</Text>
            )}
          </View>
        </View>

        {tipo === "switch" && onCambio && (
          <Switch
            value={valor || false}
            onValueChange={onCambio}
            trackColor={{
              false: Colores.grisMedio,
              true: Colores.naranja + "80",
            }}
            thumbColor={valor ? Colores.naranja : Colores.grisClaro}
          />
        )}

        {tipo === "navegacion" && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colores.textoGrisMedio}
          />
        )}
      </View>
    </TarjetaConfiguracion>
  );

  return (
    <SafeAreaView style={EstilosBase.contenedorPrincipal}>
      <ScrollView
        style={EstilosBase.contenedorConPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={estilos.header}>
          <Text style={Tipografia.tituloGrande}>Configuración</Text>
        </View>

        {/* Información del usuario */}
        <View style={estilos.seccion}>
          <Text style={Tipografia.subtitulo}>Perfil</Text>

          <TouchableOpacity onPress={() => router.push("/perfil")}>
            <TarjetaConfiguracion estiloPersonalizado={estilos.perfilContainer}>
              <View style={estilos.perfilContent}>
                <View style={estilos.avatarContainer}>
                  <Ionicons name="person" size={32} color={Colores.naranja} />
                </View>
                <View style={estilos.perfilInfo}>
                  <Text style={Tipografia.tituloTarjeta}>
                    {usuario?.nombre || "Usuario"}
                  </Text>
                  <Text style={Tipografia.pequeno}>
                    {usuario?.email || "usuario@boletaia.app"}
                  </Text>
                  <Text
                    style={[
                      Tipografia.pequeno,
                      { color: Colores.azul, marginTop: 4 },
                    ]}
                  >
                    ✓ Usuario Local
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colores.textoGrisMedio}
                />
              </View>
            </TarjetaConfiguracion>
          </TouchableOpacity>
        </View>

        {/* Notificaciones */}
        <View style={estilos.seccion}>
          <Text style={Tipografia.subtitulo}>Notificaciones</Text>

          <TouchableOpacity
            onPress={() => router.push("/configuracion-notificaciones")}
          >
            <OpcionConfiguracion
              titulo="Configurar Notificaciones"
              descripcion="Personaliza alertas y recordatorios"
              icono="notifications"
              tipo="navegacion"
            />
          </TouchableOpacity>

          <View style={estilos.resumenNotificaciones}>
            <Text style={Tipografia.pequeno}>
              Estado:{" "}
              {configuracionNotificaciones?.habilitadas
                ? "Activadas"
                : "Desactivadas"}
            </Text>
            {configuracionNotificaciones?.habilitadas && (
              <Text style={Tipografia.pequeno}>
                Hora: {configuracionNotificaciones.horaNotificacion}
              </Text>
            )}
          </View>
        </View>

        {/* Aplicación */}
        <View style={estilos.seccion}>
          <Text style={Tipografia.subtitulo}>Aplicación</Text>

          <TouchableOpacity>
            <OpcionConfiguracion
              titulo="Sobre BoletaIA"
              descripcion="Información de la aplicación"
              icono="information-circle"
              tipo="navegacion"
            />
          </TouchableOpacity>

          <TouchableOpacity>
            <OpcionConfiguracion
              titulo="Ayuda"
              descripcion="Preguntas frecuentes y soporte"
              icono="help-circle"
              tipo="navegacion"
            />
          </TouchableOpacity>
        </View>

        {/* Información de la app */}
        <View style={estilos.infoApp}>
          <Text style={Tipografia.pequeno}>BoletaIA v1.0.0</Text>
          <Text style={[Tipografia.pequeno, { marginTop: 4 }]}>
            Gestiona tus boletas de servicios básicos
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  seccion: {
    marginBottom: 32,
  },
  perfilContainer: {
    marginTop: 16,
  },
  perfilContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colores.fondoInput,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  perfilInfo: {
    flex: 1,
  },
  opcionContainer: {
    marginTop: 8,
  },
  opcionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  opcionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  opcionIcono: {
    marginRight: 16,
  },
  opcionTexto: {
    flex: 1,
  },
  infoApp: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 32,
  },
  resumenNotificaciones: {
    marginTop: 8,
    paddingLeft: 16,
  },
});
