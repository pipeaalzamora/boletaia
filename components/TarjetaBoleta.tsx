/**
 * TarjetaBoleta - Componente para mostrar información resumida de boletas
 * Incluye acciones para editar y marcar como pagada
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colores } from "../constants/Colors";
import { Tipografia } from "../constants/Tipografia";
import { PropsTarjetaBoleta } from "../types";
import { UtilsBoleta } from "../utils/validaciones";
import { BadgeDiasRestantes, BadgeEstadoBoleta } from "./ui/Badge";
import { BotonDeslizable } from "./ui/BotonDeslizable";
import { TarjetaBase } from "./ui/TarjetaBase";

export function TarjetaBoleta({
  boleta,
  onMarcarPagado,
  onEditar,
  onEliminar,
}: PropsTarjetaBoleta) {
  const [procesandoPago, setProcesandoPago] = useState(false);

  const estadoCalculado = UtilsBoleta.calcularEstadoBoleta(boleta);
  const colorTipo = UtilsBoleta.obtenerColorTipoCuenta(boleta.tipoCuenta);
  const iconoTipo = UtilsBoleta.obtenerIconoTipoCuenta(boleta.tipoCuenta);

  const manejarMarcarPagado = async () => {
    if (boleta.estaPagada || procesandoPago) return;

    Alert.alert(
      "Confirmar Pago",
      `¿Confirmas que has pagado la boleta de ${boleta.nombreEmpresa}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          style: "default",
          onPress: async () => {
            try {
              setProcesandoPago(true);
              await onMarcarPagado(boleta.id);
            } catch (error) {
              console.error("Error al marcar como pagado:", error);
              Alert.alert(
                "Error",
                "No se pudo marcar la boleta como pagada. Intenta nuevamente.",
                [{ text: "OK" }]
              );
            } finally {
              setProcesandoPago(false);
            }
          },
        },
      ]
    );
  };

  const manejarEliminar = () => {
    if (!onEliminar) return;

    Alert.alert(
      "Eliminar Boleta",
      `¿Estás seguro de eliminar la boleta de ${boleta.nombreEmpresa}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onEliminar(boleta.id),
        },
      ]
    );
  };

  const obtenerTextoTiempoRestante = () => {
    if (boleta.estaPagada) {
      if (boleta.fechaPago) {
        try {
          const fechaPago = new Date(boleta.fechaPago);
          if (isNaN(fechaPago.getTime())) {
            return "Pagada";
          }
          return `Pagada el ${UtilsBoleta.formatearFecha(fechaPago)}`;
        } catch (error) {
          console.error("Error al formatear fecha de pago:", error);
          return "Pagada";
        }
      }
      return "Pagada";
    }
    return UtilsBoleta.obtenerTextoTiempoRestante(
      estadoCalculado.diasRestantes
    );
  };

  return (
    <TarjetaBase
      elevada={true}
      estiloPersonalizado={
        [estilos.tarjeta, boleta.estaPagada && estilos.tarjetaPagada].filter(
          Boolean
        ) as any
      }
    >
      {/* Header con tipo de cuenta y estado */}
      <View style={estilos.header}>
        <View style={estilos.tipoEmpresa}>
          <View style={[estilos.iconoTipo, { backgroundColor: colorTipo }]}>
            <Ionicons
              name={iconoTipo as any}
              size={16}
              color={Colores.textoBlanco}
            />
          </View>
          <View style={estilos.infoEmpresa}>
            <Text style={Tipografia.tituloTarjeta} numberOfLines={1}>
              {boleta.nombreEmpresa}
            </Text>
            <Text style={[Tipografia.pequeno, { color: Colores.textoBlanco }]}>
              {boleta.tipoCuenta.toUpperCase().replace("_", " ")}
            </Text>
          </View>
        </View>
        <BadgeEstadoBoleta estado={estadoCalculado.estado} />
      </View>

      {/* Monto principal */}
      <View style={estilos.montoContainer}>
        <Text
          style={[
            Tipografia.montoTarjeta,
            boleta.estaPagada && { color: Colores.verde },
          ]}
        >
          {UtilsBoleta.formatearMonto(boleta.monto)}
        </Text>
        {!boleta.estaPagada && (
          <BadgeDiasRestantes dias={estadoCalculado.diasRestantes} />
        )}
      </View>

      {/* Información de fechas */}
      <View style={estilos.fechasContainer}>
        {/* Primera fila: Emisión y Vencimiento */}
        <View style={estilos.filaFechas}>
          <View style={estilos.fechaItem}>
            <Text style={[Tipografia.pequeno, { color: Colores.textoBlanco }]}>
              Emisión
            </Text>
            <Text style={Tipografia.fechaTarjeta}>
              {(() => {
                try {
                  const fechaEmision = new Date(boleta.fechaEmision);
                  return isNaN(fechaEmision.getTime())
                    ? "N/A"
                    : UtilsBoleta.formatearFecha(fechaEmision);
                } catch (error) {
                  return "N/A";
                }
              })()}
            </Text>
          </View>
          <View style={estilos.fechaItem}>
            <Text style={[Tipografia.pequeno, { color: Colores.textoBlanco }]}>
              Vencimiento
            </Text>
            <Text
              style={[
                Tipografia.fechaTarjeta,
                { color: estadoCalculado.colorEstado },
              ]}
            >
              {(() => {
                try {
                  const fechaVenc = new Date(boleta.fechaVencimiento);
                  return isNaN(fechaVenc.getTime())
                    ? "N/A"
                    : UtilsBoleta.formatearFecha(fechaVenc);
                } catch (error) {
                  return "N/A";
                }
              })()}
            </Text>
          </View>
        </View>

        {/* Segunda fila: Corte y Próxima Lectura (solo si existen) */}
        {(boleta.fechaCorte || boleta.fechaProximaLectura) && (
          <View style={estilos.filaFechas}>
            {boleta.fechaCorte && (
              <View style={estilos.fechaItem}>
                <Text
                  style={[Tipografia.pequeno, { color: Colores.textoBlanco }]}
                >
                  Corte
                </Text>
                <Text style={Tipografia.fechaTarjeta}>
                  {(() => {
                    try {
                      const fechaCorte = new Date(boleta.fechaCorte);
                      return isNaN(fechaCorte.getTime())
                        ? "N/A"
                        : UtilsBoleta.formatearFecha(fechaCorte);
                    } catch (error) {
                      return "N/A";
                    }
                  })()}
                </Text>
              </View>
            )}
            {boleta.fechaProximaLectura && (
              <View style={estilos.fechaItem}>
                <Text
                  style={[Tipografia.pequeno, { color: Colores.textoBlanco }]}
                >
                  Próx. Lectura
                </Text>
                <Text style={Tipografia.fechaTarjeta}>
                  {(() => {
                    try {
                      const fechaProxLectura = new Date(
                        boleta.fechaProximaLectura
                      );
                      return isNaN(fechaProxLectura.getTime())
                        ? "N/A"
                        : UtilsBoleta.formatearFecha(fechaProxLectura);
                    } catch (error) {
                      return "N/A";
                    }
                  })()}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Información adicional */}
      <View style={estilos.infoAdicional}>
        <Text style={[Tipografia.pequeno, { color: Colores.textoGrisClaro }]}>
          {obtenerTextoTiempoRestante()}
        </Text>
        {boleta.descripcion && (
          <Text
            style={[
              Tipografia.pequeno,
              estilos.descripcion,
              { color: Colores.textoGrisMedio },
            ]}
            numberOfLines={2}
          >
            {boleta.descripcion}
          </Text>
        )}
      </View>

      {/* Separador */}
      <View style={estilos.separador} />

      {/* Acciones */}
      <View style={estilos.accionesContainer}>
        <View style={estilos.filaSuperior}>
          <TouchableOpacity
            style={[estilos.botonAccion, estilos.botonEditar]}
            onPress={() => onEditar(boleta)}
          >
            <Ionicons name="pencil" size={16} color={Colores.naranja} />
            <Text
              style={[
                Tipografia.pequeno,
                { color: Colores.naranja, marginLeft: 4 },
              ]}
            >
              Editar
            </Text>
          </TouchableOpacity>

          {onEliminar && (
            <TouchableOpacity
              style={[estilos.botonAccion, estilos.botonEliminar]}
              onPress={manejarEliminar}
            >
              <Ionicons name="trash" size={16} color={Colores.rojo} />
            </TouchableOpacity>
          )}
        </View>

        {!boleta.estaPagada && (
          <View style={estilos.filaDeslizable}>
            <BotonDeslizable
              onDeslizar={() => manejarMarcarPagado()}
              texto="Marcar como pagada"
              textoCompletado="Boleta marcada como pagada"
              color={Colores.verde}
              deshabilitado={procesandoPago}
            />
          </View>
        )}
      </View>
    </TarjetaBase>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    marginBottom: 16,
  },
  tarjetaPagada: {
    opacity: 0.8,
    borderColor: Colores.verde,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  tipoEmpresa: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconoTipo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoEmpresa: {
    flex: 1,
  },
  montoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  fechasContainer: {
    marginBottom: 12,
  },
  filaFechas: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  fechaItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  infoAdicional: {
    marginBottom: 12,
  },
  descripcion: {
    marginTop: 4,
    fontStyle: "italic",
  },
  separador: {
    height: 1,
    backgroundColor: Colores.bordeOscuro,
    marginVertical: 12,
  },
  separadorPequeno: {
    height: 8,
  },
  accionesContainer: {
    flexDirection: "column",
  },
  filaSuperior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filaDeslizable: {
    width: "100%",
  },
  botonAccion: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  botonEditar: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colores.naranja,
  },
  botonPagar: {
    backgroundColor: Colores.verde,
  },
  botonEliminar: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colores.rojo,
    paddingHorizontal: 8,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
});
