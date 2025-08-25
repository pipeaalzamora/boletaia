/**
 * Estilos base reutilizables para BoletaIA
 * Componentes de estilo vanguardistas negro/naranja
 */

import { StyleSheet } from "react-native";
import { Colores } from "./Colors";

export const EstilosBase = StyleSheet.create({
  // Contenedores principales
  contenedorPrincipal: {
    flex: 1,
    backgroundColor: Colores.fondoPrincipal,
  },

  contenedorCentrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colores.fondoPrincipal,
  },

  contenedorConPadding: {
    flex: 1,
    padding: 16,
    backgroundColor: Colores.fondoPrincipal,
  },

  // Tarjetas base
  tarjetaBase: {
    backgroundColor: Colores.fondoTarjeta,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: Colores.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colores.bordeOscuro,
  },

  tarjetaElevada: {
    backgroundColor: Colores.fondoTarjeta,
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    shadowColor: Colores.naranja,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colores.bordeClaro,
  },

  // Botones
  botonPrimario: {
    backgroundColor: Colores.naranja,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colores.naranja,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  botonSecundario: {
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colores.naranja,
  },

  botonPeligro: {
    backgroundColor: Colores.rojo,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colores.rojo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  botonExito: {
    backgroundColor: Colores.verde,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colores.verde,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  botonFlotante: {
    position: "absolute",
    bottom: 90, // Aumentado para evitar superposición con tab bar
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

  // Inputs
  inputBase: {
    backgroundColor: Colores.fondoInput,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colores.textoBlanco,
    borderWidth: 1,
    borderColor: Colores.bordeOscuro,
  },

  inputFocused: {
    borderColor: Colores.naranja,
    borderWidth: 2,
  },

  inputError: {
    borderColor: Colores.rojo,
    borderWidth: 2,
  },

  // Separadores y divisores
  separador: {
    height: 1,
    backgroundColor: Colores.bordeOscuro,
    marginVertical: 16,
  },

  separadorGrueso: {
    height: 2,
    backgroundColor: Colores.bordeClaro,
    marginVertical: 20,
  },

  // Estados de carga
  indicadorCarga: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colores.fondoPrincipal,
  },

  // Badges y etiquetas
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  badgePagado: {
    backgroundColor: Colores.verde,
  },

  badgePendiente: {
    backgroundColor: Colores.naranja,
  },

  badgeVencido: {
    backgroundColor: Colores.rojo,
  },

  // Layouts de grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridItem: {
    width: "48%",
    marginBottom: 16,
  },

  gridItemCompleto: {
    width: "100%",
    marginBottom: 16,
  },

  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: Colores.fondoModal,
    justifyContent: "center",
    alignItems: "center",
  },

  modalContenido: {
    backgroundColor: Colores.fondoTarjeta,
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    shadowColor: Colores.negro,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },

  // Filas y columnas
  fila: {
    flexDirection: "row",
    alignItems: "center",
  },

  filaJustificada: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  columna: {
    flexDirection: "column",
  },

  columnaCentrada: {
    flexDirection: "column",
    alignItems: "center",
  },

  // Espaciado
  margenPequeno: {
    margin: 8,
  },

  margenMedio: {
    margin: 16,
  },

  margenGrande: {
    margin: 24,
  },

  paddingPequeno: {
    padding: 8,
  },

  paddingMedio: {
    padding: 16,
  },

  paddingGrande: {
    padding: 24,
  },
});
