/**
 * Pantalla de Perfil de Usuario para BoletaIA
 * Gestión de datos personales, configuración y cuenta de usuario
 */

import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TarjetaBase } from "../components/ui";
import { AvatarGrande } from "../components/ui/Avatar";
import { Colores } from "../constants/Colors";
import { useBoletasContext } from "../context/BoletasContext";

export default function PantallaPerfil() {
  const { usuario } = useBoletasContext();

  const manejarVolver = () => {
    router.back();
  };

  const manejarEditarPerfil = () => {
    Alert.alert(
      "Editar Perfil",
      "La edición de perfil estará disponible en una próxima actualización.",
      [{ text: "OK" }]
    );
  };

  if (!usuario) {
    return (
      <View style={[estilos.contenedor, estilos.centrado]}>
        <StatusBar barStyle="light-content" backgroundColor={Colores.negro} />
        <Text style={estilos.textoCargando}>Cargando perfil...</Text>
      </View>
    );
  }

  const fechaRegistroFormateada = format(
    new Date(usuario.fechaRegistro),
    "d 'de' MMMM 'de' yyyy",
    { locale: es }
  );

  return (
    <SafeAreaView style={estilos.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor={Colores.negro} />

      <ScrollView style={estilos.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={estilos.header}>
          <TouchableOpacity
            style={estilos.botonVolver}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colores.textoBlanco} />
          </TouchableOpacity>

          <Text style={estilos.titulo}>Mi Perfil</Text>

          <TouchableOpacity
            style={estilos.botonEditar}
            onPress={manejarEditarPerfil}
          >
            <Ionicons name="create-outline" size={24} color={Colores.naranja} />
          </TouchableOpacity>
        </View>

        {/* Información del Usuario */}
        <TarjetaBase estiloPersonalizado={estilos.tarjetaPerfil}>
          <View style={estilos.avatarContainer}>
            <AvatarGrande
              nombre={usuario.nombre}
              email={usuario.email}
              mostrarBorde={true}
              editable={true}
              onPress={manejarEditarPerfil}
            />
          </View>

          <View style={estilos.infoUsuario}>
            <Text style={estilos.nombreUsuario}>{usuario.nombre}</Text>
            <Text style={estilos.emailUsuario}>{usuario.email}</Text>

            <View style={estilos.tipoAutenticacion}>
              <Ionicons name="person" size={16} color={Colores.azul} />
              <Text style={estilos.textoTipoAuth}>Usuario Local</Text>
            </View>
          </View>
        </TarjetaBase>

        {/* Estadísticas */}
        <TarjetaBase estiloPersonalizado={estilos.tarjetaEstadisticas}>
          <Text style={estilos.tituloSeccion}>Información de la Cuenta</Text>

          <View style={estilos.estadistica}>
            <Ionicons name="calendar" size={20} color={Colores.azul} />
            <View style={estilos.textoEstadistica}>
              <Text style={estilos.labelEstadistica}>Fecha de registro</Text>
              <Text style={estilos.valorEstadistica}>
                {fechaRegistroFormateada}
              </Text>
            </View>
          </View>

          <View style={estilos.estadistica}>
            <Ionicons name="phone-portrait" size={20} color={Colores.verde} />
            <View style={estilos.textoEstadistica}>
              <Text style={estilos.labelEstadistica}>Tipo de cuenta</Text>
              <Text style={estilos.valorEstadistica}>Almacenamiento local</Text>
            </View>
          </View>
        </TarjetaBase>

        {/* Acciones */}
        <TarjetaBase estiloPersonalizado={estilos.tarjetaAcciones}>
          <Text style={estilos.tituloSeccion}>Acciones de Cuenta</Text>

          <TouchableOpacity
            style={estilos.accion}
            onPress={() => router.push("/configuracion-notificaciones")}
          >
            <Ionicons name="notifications" size={20} color={Colores.azul} />
            <Text style={estilos.textoAccion}>
              Configuración de Notificaciones
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colores.textoGrisMedio}
            />
          </TouchableOpacity>
        </TarjetaBase>

        <View style={estilos.espacioFinal} />
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Colores.fondoPrincipal,
  },

  centrado: {
    justifyContent: "center",
    alignItems: "center",
  },

  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },

  textoCargando: {
    color: Colores.textoBlanco,
    fontSize: 16,
    fontWeight: "500",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingTop: 20,
  },

  botonVolver: {
    padding: 8,
  },

  titulo: {
    fontSize: 20,
    fontWeight: "600",
    color: Colores.textoBlanco,
  },

  botonEditar: {
    padding: 8,
  },

  // Tarjeta de Perfil
  tarjetaPerfil: {
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 32,
  },

  avatarContainer: {
    marginBottom: 20,
  },

  infoUsuario: {
    alignItems: "center",
  },

  nombreUsuario: {
    fontSize: 24,
    fontWeight: "700",
    color: Colores.textoBlanco,
    marginBottom: 8,
    textAlign: "center",
  },

  emailUsuario: {
    fontSize: 16,
    color: Colores.textoGrisMedio,
    marginBottom: 4,
    textAlign: "center",
  },

  telefonoUsuario: {
    fontSize: 14,
    color: Colores.textoGrisOscuro,
    marginBottom: 16,
  },

  tipoAutenticacion: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colores.fondoSecundario,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  textoTipoAuth: {
    fontSize: 12,
    color: Colores.textoGrisClaro,
    marginLeft: 6,
    fontWeight: "500",
  },

  // Estadísticas
  tarjetaEstadisticas: {
    marginBottom: 20,
  },

  tituloSeccion: {
    fontSize: 18,
    fontWeight: "600",
    color: Colores.textoBlanco,
    marginBottom: 16,
  },

  estadistica: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  textoEstadistica: {
    flex: 1,
    marginLeft: 12,
  },

  labelEstadistica: {
    fontSize: 14,
    color: Colores.textoGrisMedio,
    marginBottom: 2,
  },

  valorEstadistica: {
    fontSize: 16,
    color: Colores.textoBlanco,
    fontWeight: "500",
  },

  // Acciones
  tarjetaAcciones: {
    marginBottom: 20,
  },

  accion: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colores.bordeOscuro,
  },

  textoAccion: {
    flex: 1,
    fontSize: 16,
    color: Colores.textoBlanco,
    marginLeft: 12,
  },

  espacioFinal: {
    height: 40,
  },
});
