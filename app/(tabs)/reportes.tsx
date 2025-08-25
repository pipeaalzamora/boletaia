/**
 * Pantalla de Reportes - Gestión y generación de reportes PDF de boletas
 */

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  EncabezadoReportes,
  FiltrosReportes,
  TarjetaReporte,
} from "../../components/reportes";
import { BotonPrimario } from "../../components/ui";
import { Colores } from "../../constants/Colors";
import { Tipografia } from "../../constants/Tipografia";
import { useReportesContext } from "../../context/ReportesContext";
import { ReporteGuardado } from "../../types";

export default function PantallaReportes() {
  const insets = useSafeAreaInsets();
  const {
    reportesGenerados,
    filtrosActivos,
    cargandoReporte,
    errorReporte,
    aplicarFiltros,
    limpiarFiltros,
    generarReporte,
    compartirReporte,
    eliminarReporte,
    setError,
    generarConfiguracionRapida,
    obtenerResumenFiltrado,
  } = useReportesContext();

  const [refrescando, setRefrescando] = useState(false);

  // Recargar datos cuando la pantalla gana foco
  useFocusEffect(
    useCallback(() => {
      if (errorReporte) {
        setError(null);
      }
    }, [errorReporte, setError])
  );

  const manejarRefrescar = async () => {
    setRefrescando(true);
    try {
      // Aquí podrías recargar datos si fuera necesario
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulación
    } catch (error) {
      console.error("Error al refrescar:", error);
    } finally {
      setRefrescando(false);
    }
  };

  const manejarGenerarReporte = async () => {
    try {
      const configuracion = generarConfiguracionRapida();
      const rutaArchivo = await generarReporte(configuracion);

      Alert.alert(
        "Reporte Generado",
        "¡Tu reporte PDF ha sido generado exitosamente!",
        [
          {
            text: "Ver reportes",
            style: "default",
          },
          {
            text: "Compartir ahora",
            style: "default",
            onPress: () => manejarCompartirReporte(rutaArchivo),
          },
        ]
      );
    } catch (error) {
      console.error("Error al generar reporte:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo generar el reporte",
        [{ text: "OK" }]
      );
    }
  };

  const manejarCompartirReporte = async (rutaArchivo: string) => {
    try {
      await compartirReporte(rutaArchivo);
    } catch (error) {
      console.error("Error al compartir:", error);
      Alert.alert(
        "Error",
        "No se pudo compartir el reporte. Intenta nuevamente.",
        [{ text: "OK" }]
      );
    }
  };

  const manejarEliminarReporte = async (id: string) => {
    try {
      await eliminarReporte(id);
      Alert.alert(
        "Reporte Eliminado",
        "El reporte ha sido eliminado exitosamente.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error al eliminar:", error);
      Alert.alert(
        "Error",
        "No se pudo eliminar el reporte. Intenta nuevamente.",
        [{ text: "OK" }]
      );
    }
  };

  const manejarRegenerarReporte = async (reporte: ReporteGuardado) => {
    try {
      const rutaArchivo = await generarReporte(reporte.configuracion);

      Alert.alert(
        "Reporte Regenerado",
        "¡El reporte ha sido regenerado exitosamente!",
        [
          {
            text: "OK",
            style: "default",
          },
          {
            text: "Compartir",
            style: "default",
            onPress: () => manejarCompartirReporte(rutaArchivo),
          },
        ]
      );
    } catch (error) {
      console.error("Error al regenerar reporte:", error);
      Alert.alert(
        "Error",
        "No se pudo regenerar el reporte. Intenta nuevamente.",
        [{ text: "OK" }]
      );
    }
  };

  const renderizarTarjetaReporte = ({ item }: { item: ReporteGuardado }) => (
    <TarjetaReporte
      reporte={item}
      onGenerar={() => manejarRegenerarReporte(item)}
      onCompartir={() => manejarCompartirReporte(item.rutaArchivo)}
      onEliminar={() => manejarEliminarReporte(item.id)}
    />
  );

  const renderizarSinReportes = () => (
    <View style={estilos.sinReportes}>
      <Ionicons
        name="document-text-outline"
        size={64}
        color={Colores.textoGrisMedio}
      />
      <Text style={estilos.textoSinReportes}>No hay reportes generados</Text>
      <Text style={estilos.descripcionSinReportes}>
        Genera tu primer reporte para ver un resumen detallado de tus boletas
      </Text>
      <BotonPrimario
        titulo="Generar Primer Reporte"
        onPress={manejarGenerarReporte}
        cargando={cargandoReporte}
        estiloPersonalizado={estilos.botonPrimerReporte}
      />
    </View>
  );

  const renderizarContenido = () => {
    const resumen = obtenerResumenFiltrado();

    if (resumen.totalBoletas === 0) {
      return (
        <View style={estilos.sinBoletas}>
          <Ionicons
            name="receipt-outline"
            size={64}
            color={Colores.textoGrisMedio}
          />
          <Text style={estilos.textoSinBoletas}>
            No hay boletas para el período seleccionado
          </Text>
          <Text style={estilos.descripcionSinBoletas}>
            Ajusta los filtros o agrega boletas para generar reportes
          </Text>
          <TouchableOpacity
            style={estilos.botonLimpiarFiltros}
            onPress={limpiarFiltros}
          >
            <Ionicons name="refresh" size={16} color={Colores.naranja} />
            <Text style={estilos.textoLimpiarFiltros}>Limpiar Filtros</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const periodoTexto = (() => {
      try {
        const fechaInicio = new Date(filtrosActivos.fechaInicio);
        const fechaFin = new Date(filtrosActivos.fechaFin);

        if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
          return "Período: Fechas inválidas";
        }

        return `${fechaInicio.toLocaleDateString(
          "es-CL"
        )} - ${fechaFin.toLocaleDateString("es-CL")}`;
      } catch (error) {
        return "Período: Error al formatear fechas";
      }
    })();

    return (
      <>
        {/* Encabezado con resumen */}
        <EncabezadoReportes
          resumen={resumen}
          periodoSeleccionado={periodoTexto}
        />

        {/* Filtros */}
        <FiltrosReportes
          filtros={filtrosActivos}
          onAplicarFiltros={aplicarFiltros}
          onLimpiarFiltros={limpiarFiltros}
        />

        {/* Botón generar reporte */}
        <View style={estilos.accionesContainer}>
          <BotonPrimario
            titulo="Generar Nuevo Reporte"
            icono={
              <Ionicons name="download" size={16} color={Colores.textoBlanco} />
            }
            onPress={manejarGenerarReporte}
            cargando={cargandoReporte}
          />

          {reportesGenerados.length > 0 && (
            <Text style={estilos.contadorReportes}>
              {reportesGenerados.length} reporte
              {reportesGenerados.length !== 1 ? "s" : ""} guardado
              {reportesGenerados.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {/* Lista de reportes generados */}
        {reportesGenerados.length > 0 && (
          <View style={estilos.listaContainer}>
            <Text style={estilos.tituloLista}>Reportes Generados</Text>

            <FlatList
              data={reportesGenerados.sort((a, b) => {
                try {
                  const fechaA = new Date(b.fechaGeneracion);
                  const fechaB = new Date(a.fechaGeneracion);

                  if (isNaN(fechaA.getTime()) || isNaN(fechaB.getTime())) {
                    return 0; // No cambiar orden si hay fechas inválidas
                  }

                  return fechaA.getTime() - fechaB.getTime();
                } catch (error) {
                  return 0;
                }
              })}
              renderItem={renderizarTarjetaReporte}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          </View>
        )}

        {reportesGenerados.length === 0 && renderizarSinReportes()}
      </>
    );
  };

  return (
    <View style={[estilos.contenedor, { paddingTop: insets.top }]}>
      {/* Mensaje de error */}
      {errorReporte && (
        <View style={estilos.errorContainer}>
          <Ionicons name="warning" size={16} color={Colores.rojo} />
          <Text style={estilos.textoError}>{errorReporte}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Ionicons name="close" size={16} color={Colores.rojo} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={manejarRefrescar}
            colors={[Colores.naranja]}
            tintColor={Colores.naranja}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderizarContenido()}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Colores.fondoPrincipal,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 100, // Espacio para la tab bar
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colores.rojo + "15",
    borderColor: Colores.rojo + "30",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    gap: 8,
  },
  textoError: {
    ...Tipografia.pequeno,
    color: Colores.rojo,
    flex: 1,
  },
  accionesContainer: {
    alignItems: "center",
    gap: 8,
  },
  contadorReportes: {
    ...Tipografia.pequeno,
    color: Colores.textoGrisMedio,
    fontStyle: "italic",
  },
  listaContainer: {
    gap: 12,
  },
  tituloLista: {
    ...Tipografia.subtitulo,
    color: Colores.textoBlanco,
    fontWeight: "600",
  },
  sinReportes: {
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  textoSinReportes: {
    ...Tipografia.titulo,
    color: Colores.textoBlanco,
    textAlign: "center",
  },
  descripcionSinReportes: {
    ...Tipografia.cuerpo,
    color: Colores.textoGrisMedio,
    textAlign: "center",
    marginBottom: 8,
  },
  botonPrimerReporte: {
    minWidth: 200,
  },
  sinBoletas: {
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  textoSinBoletas: {
    ...Tipografia.titulo,
    color: Colores.textoBlanco,
    textAlign: "center",
  },
  descripcionSinBoletas: {
    ...Tipografia.cuerpo,
    color: Colores.textoGrisMedio,
    textAlign: "center",
    marginBottom: 8,
  },
  botonLimpiarFiltros: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colores.naranja,
    backgroundColor: "transparent",
    gap: 6,
  },
  textoLimpiarFiltros: {
    ...Tipografia.cuerpo,
    color: Colores.naranja,
    fontWeight: "600",
  },
});
