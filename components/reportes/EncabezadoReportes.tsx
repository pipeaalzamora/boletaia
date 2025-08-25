/**
 * EncabezadoReportes - Componente para mostrar resumen ejecutivo en la pantalla de reportes
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Colores } from "../../constants/Colors";
import { Tipografia } from "../../constants/Tipografia";
import { PropsEncabezadoReportes } from "../../types";
import { UtilsBoleta } from "../../utils/validaciones";
import { TarjetaBase } from "../ui/TarjetaBase";

export function EncabezadoReportes({
  resumen,
  periodoSeleccionado,
}: PropsEncabezadoReportes) {
  const porcentajePagado =
    resumen.totalBoletas > 0
      ? Math.round((resumen.boletasPagadas / resumen.totalBoletas) * 100)
      : 0;

  const porcentajePendiente =
    resumen.totalBoletas > 0
      ? Math.round((resumen.boletasPendientes / resumen.totalBoletas) * 100)
      : 0;

  const renderizarMetrica = (
    icono: string,
    valor: string,
    etiqueta: string,
    color: string,
    porcentaje?: number
  ) => (
    <View style={estilos.metrica}>
      <View style={[estilos.iconoMetrica, { backgroundColor: color + "20" }]}>
        <Ionicons name={icono as any} size={20} color={color} />
      </View>
      <View style={estilos.datosMetrica}>
        <Text style={[estilos.valorMetrica, { color }]}>{valor}</Text>
        <Text style={estilos.etiquetaMetrica}>{etiqueta}</Text>
        {porcentaje !== undefined && (
          <Text style={estilos.porcentajeMetrica}>{porcentaje}%</Text>
        )}
      </View>
    </View>
  );

  return (
    <TarjetaBase elevada={true}>
      <View style={estilos.contenedor}>
        {/* Título de la sección */}
        <View style={estilos.encabezado}>
          <View style={estilos.tituloContainer}>
            <Ionicons name="document-text" size={24} color={Colores.naranja} />
            <Text style={estilos.titulo}>Reportes de Boletas</Text>
          </View>
          <Text style={estilos.periodo}>{periodoSeleccionado}</Text>
        </View>

        {/* Métricas principales */}
        <View style={estilos.metricas}>
          {renderizarMetrica(
            "receipt",
            resumen.totalBoletas.toString(),
            "Total Boletas",
            Colores.textoBlanco
          )}

          {renderizarMetrica(
            "checkmark-circle",
            resumen.boletasPagadas.toString(),
            "Pagadas",
            Colores.verde,
            porcentajePagado
          )}

          {renderizarMetrica(
            "time",
            resumen.boletasPendientes.toString(),
            "Pendientes",
            Colores.naranja,
            porcentajePendiente
          )}

          {resumen.boletasVencidas > 0 &&
            renderizarMetrica(
              "warning",
              resumen.boletasVencidas.toString(),
              "Vencidas",
              Colores.rojo
            )}
        </View>

        {/* Información financiera */}
        <View style={estilos.separador} />

        <View style={estilos.finanzas}>
          <View style={estilos.itemFinanciero}>
            <Text style={estilos.etiquetaFinanciera}>Monto Total</Text>
            <Text
              style={[estilos.valorFinanciero, { color: Colores.textoBlanco }]}
            >
              {UtilsBoleta.formatearMonto(resumen.totalMonto)}
            </Text>
          </View>

          <View style={estilos.itemFinanciero}>
            <Text style={estilos.etiquetaFinanciera}>Pagado</Text>
            <Text style={[estilos.valorFinanciero, { color: Colores.verde }]}>
              {UtilsBoleta.formatearMonto(resumen.montoPagado)}
            </Text>
          </View>

          <View style={estilos.itemFinanciero}>
            <Text style={estilos.etiquetaFinanciera}>Pendiente</Text>
            <Text style={[estilos.valorFinanciero, { color: Colores.naranja }]}>
              {UtilsBoleta.formatearMonto(resumen.montoPendiente)}
            </Text>
          </View>

          {resumen.montoVencido > 0 && (
            <View style={estilos.itemFinanciero}>
              <Text style={estilos.etiquetaFinanciera}>Vencido</Text>
              <Text style={[estilos.valorFinanciero, { color: Colores.rojo }]}>
                {UtilsBoleta.formatearMonto(resumen.montoVencido)}
              </Text>
            </View>
          )}
        </View>

        {/* Promedio mensual */}
        {resumen.promedioMensual > 0 && (
          <>
            <View style={estilos.separador} />
            <View style={estilos.promedioContainer}>
              <Ionicons
                name="trending-up"
                size={16}
                color={Colores.textoGrisMedio}
              />
              <Text style={estilos.promedioTexto}>
                Promedio mensual:{" "}
                {UtilsBoleta.formatearMonto(resumen.promedioMensual)}
              </Text>
            </View>
          </>
        )}
      </View>
    </TarjetaBase>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 20,
  },
  encabezado: {
    marginBottom: 20,
  },
  tituloContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  titulo: {
    ...Tipografia.titulo,
    marginLeft: 12,
    color: Colores.textoBlanco,
  },
  periodo: {
    ...Tipografia.cuerpo,
    color: Colores.textoGrisMedio,
    fontStyle: "italic",
  },
  metricas: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  metrica: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: "45%",
  },
  iconoMetrica: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  datosMetrica: {
    flex: 1,
  },
  valorMetrica: {
    ...Tipografia.tituloTarjeta,
    fontWeight: "700",
  },
  etiquetaMetrica: {
    ...Tipografia.pequeno,
    color: Colores.textoGrisMedio,
    marginTop: 2,
  },
  porcentajeMetrica: {
    ...Tipografia.pequeno,
    color: Colores.textoGrisMedio,
    fontWeight: "600",
    marginTop: 1,
  },
  separador: {
    height: 1,
    backgroundColor: Colores.bordeClaro,
    marginVertical: 16,
  },
  finanzas: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  itemFinanciero: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colores.fondoTarjeta,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colores.bordeClaro,
  },
  etiquetaFinanciera: {
    ...Tipografia.pequeno,
    color: Colores.textoGrisMedio,
    marginBottom: 4,
    textAlign: "center",
  },
  valorFinanciero: {
    ...Tipografia.subtitulo,
    fontWeight: "700",
    textAlign: "center",
  },
  promedioContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  promedioTexto: {
    ...Tipografia.cuerpo,
    color: Colores.textoGrisMedio,
    marginLeft: 6,
    fontWeight: "500",
  },
});
