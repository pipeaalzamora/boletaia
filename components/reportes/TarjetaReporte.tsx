/**
 * TarjetaReporte - Componente para mostrar información de reportes generados
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colores } from "../../constants/Colors";
import { Tipografia } from "../../constants/Tipografia";
import { PropsTarjetaReporte } from "../../types";
import { UtilsBoleta } from "../../utils/validaciones";
import { TarjetaBase } from "../ui/TarjetaBase";

export function TarjetaReporte({
  reporte,
  onGenerar,
  onCompartir,
  onEliminar,
}: PropsTarjetaReporte) {
  const [cargando, setCargando] = useState(false);

  const formatearTamaño = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const manejarCompartir = async () => {
    try {
      setCargando(true);
      await onCompartir();
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo compartir el reporte. Intenta nuevamente.",
        [{ text: "OK" }]
      );
    } finally {
      setCargando(false);
    }
  };

  const manejarEliminar = () => {
    Alert.alert(
      "Eliminar Reporte",
      `¿Estás seguro de eliminar el reporte "${reporte.nombre}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: onEliminar,
        },
      ]
    );
  };

  const obtenerIconoConfiguracion = () => {
    const config = reporte.configuracion;

    if (config.filtros.tiposCuenta.length === 1) {
      switch (config.filtros.tiposCuenta[0]) {
        case "luz":
          return "flash";
        case "agua":
          return "water";
        case "gas":
          return "flame";
        case "internet":
          return "wifi";
        case "internet_movil":
          return "phone-portrait";
        case "gastos_comunes":
          return "business";
        default:
          return "document-text";
      }
    }

    return "document-text";
  };

  const obtenerColorConfiguracion = () => {
    const config = reporte.configuracion;

    if (config.filtros.estados.length === 1) {
      switch (config.filtros.estados[0]) {
        case "pagada":
          return Colores.verde;
        case "pendiente":
          return Colores.naranja;
        case "vencida":
          return Colores.rojo;
        default:
          return Colores.azul;
      }
    }

    return Colores.azul;
  };

  const generarResumenFiltros = () => {
    const filtros = reporte.configuracion.filtros;
    const resumen = [];

    // Tipos de cuenta
    if (filtros.tiposCuenta.length > 0 && filtros.tiposCuenta.length < 6) {
      const tipos = filtros.tiposCuenta
        .map((t) => t.replace("_", " "))
        .join(", ");
      resumen.push(`Tipos: ${tipos}`);
    }

    // Estados
    if (filtros.estados.length > 0 && filtros.estados.length < 4) {
      const estados = filtros.estados.join(", ");
      resumen.push(`Estados: ${estados}`);
    }

    // Rango de fechas
    const formatearFechaSafe = (fecha: any): string => {
      try {
        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj.getTime())) {
          return "Fecha inválida";
        }
        return UtilsBoleta.formatearFecha(fechaObj);
      } catch (error) {
        return "Fecha inválida";
      }
    };

    const periodo = `${formatearFechaSafe(
      filtros.fechaInicio
    )} - ${formatearFechaSafe(filtros.fechaFin)}`;
    resumen.push(periodo);

    return resumen.join(" • ");
  };

  return (
    <TarjetaBase elevada={true}>
      <View style={estilos.contenedor}>
        {/* Encabezado */}
        <View style={estilos.encabezado}>
          <View style={estilos.infoReporte}>
            <View
              style={[
                estilos.iconoReporte,
                { backgroundColor: obtenerColorConfiguracion() + "20" },
              ]}
            >
              <Ionicons
                name={obtenerIconoConfiguracion() as any}
                size={20}
                color={obtenerColorConfiguracion()}
              />
            </View>
            <View style={estilos.datosReporte}>
              <Text style={estilos.nombreReporte} numberOfLines={1}>
                {reporte.nombre}
              </Text>
              <Text style={estilos.fechaGeneracion}>
                Generado el{" "}
                {UtilsBoleta.formatearFecha(reporte.fechaGeneracion)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={estilos.botonEliminar}
            onPress={manejarEliminar}
          >
            <Ionicons name="trash-outline" size={20} color={Colores.rojo} />
          </TouchableOpacity>
        </View>

        {/* Descripción de filtros */}
        <View style={estilos.filtrosContainer}>
          <Text style={estilos.filtrosTexto} numberOfLines={2}>
            {generarResumenFiltros()}
          </Text>
        </View>

        {/* Información del archivo */}
        <View style={estilos.infoArchivo}>
          <View style={estilos.itemInfo}>
            <Ionicons
              name="document"
              size={14}
              color={Colores.textoGrisMedio}
            />
            <Text style={estilos.textoInfo}>PDF</Text>
          </View>

          <View style={estilos.itemInfo}>
            <Ionicons
              name="download"
              size={14}
              color={Colores.textoGrisMedio}
            />
            <Text style={estilos.textoInfo}>
              {formatearTamaño(reporte.tamaño)}
            </Text>
          </View>

          <View style={estilos.itemInfo}>
            <Ionicons name="time" size={14} color={Colores.textoGrisMedio} />
            <Text style={estilos.textoInfo}>
              {(() => {
                try {
                  const fecha = new Date(reporte.fechaGeneracion);
                  if (isNaN(fecha.getTime())) {
                    return "Hora inválida";
                  }
                  return fecha.toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                } catch (error) {
                  return "Hora inválida";
                }
              })()}
            </Text>
          </View>
        </View>

        {/* Separador */}
        <View style={estilos.separador} />

        {/* Acciones */}
        <View style={estilos.acciones}>
          <TouchableOpacity
            style={[estilos.botonAccion, estilos.botonGenerar]}
            onPress={onGenerar}
            disabled={cargando}
          >
            <Ionicons name="refresh" size={16} color={Colores.naranja} />
            <Text style={estilos.textoBotonGenerar}>Regenerar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[estilos.botonAccion, estilos.botonCompartir]}
            onPress={manejarCompartir}
            disabled={cargando}
          >
            {cargando ? (
              <Text style={estilos.textoBotonCompartir}>Compartiendo...</Text>
            ) : (
              <>
                <Ionicons name="share" size={16} color={Colores.textoBlanco} />
                <Text style={estilos.textoBotonCompartir}>Compartir</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TarjetaBase>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 16,
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoReporte: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconoReporte: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  datosReporte: {
    flex: 1,
  },
  nombreReporte: {
    ...Tipografia.tituloTarjeta,
    color: Colores.textoBlanco,
    marginBottom: 2,
  },
  fechaGeneracion: {
    ...Tipografia.pequeno,
    color: Colores.textoGrisMedio,
  },
  botonEliminar: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colores.rojo + "10",
  },
  filtrosContainer: {
    marginBottom: 12,
  },
  filtrosTexto: {
    ...Tipografia.pequeno,
    color: Colores.textoGrisMedio,
    lineHeight: 16,
    fontStyle: "italic",
  },
  infoArchivo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  textoInfo: {
    ...Tipografia.pequeno,
    color: Colores.textoGrisMedio,
    fontWeight: "500",
  },
  separador: {
    height: 1,
    backgroundColor: Colores.bordeClaro,
    marginBottom: 16,
  },
  acciones: {
    flexDirection: "row",
    gap: 12,
  },
  botonAccion: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  botonGenerar: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colores.naranja,
  },
  botonCompartir: {
    backgroundColor: Colores.naranja,
  },
  textoBotonGenerar: {
    ...Tipografia.cuerpo,
    color: Colores.naranja,
    fontWeight: "600",
  },
  textoBotonCompartir: {
    ...Tipografia.cuerpo,
    color: Colores.textoBlanco,
    fontWeight: "600",
  },
});
