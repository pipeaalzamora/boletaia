/**
 * FiltrosReportes - Componente para filtrar datos en reportes
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colores } from "../../constants/Colors";
import { Tipografia } from "../../constants/Tipografia";
import {
  EstadoBoleta,
  ESTADOS_BOLETA_LABELS,
  PropsFiltrosReportes,
  TipoCuenta,
  TIPOS_CUENTA_LABELS,
} from "../../types";
import { SelectorRangoFechas } from "../ui/SelectorRangoFechas";
import { TarjetaBase } from "../ui/TarjetaBase";

export function FiltrosReportes({
  filtros,
  onAplicarFiltros,
  onLimpiarFiltros,
}: PropsFiltrosReportes) {
  const [expandido, setExpandido] = useState(false);

  const toggleTipoCuenta = (tipo: TipoCuenta) => {
    const tiposActuales = [...filtros.tiposCuenta];
    const indice = tiposActuales.indexOf(tipo);

    if (indice > -1) {
      tiposActuales.splice(indice, 1);
    } else {
      tiposActuales.push(tipo);
    }

    onAplicarFiltros({
      ...filtros,
      tiposCuenta: tiposActuales,
    });
  };

  const toggleEstado = (estado: EstadoBoleta) => {
    const estadosActuales = [...filtros.estados];
    const indice = estadosActuales.indexOf(estado);

    if (indice > -1) {
      estadosActuales.splice(indice, 1);
    } else {
      estadosActuales.push(estado);
    }

    onAplicarFiltros({
      ...filtros,
      estados: estadosActuales,
    });
  };

  const seleccionarTodosLosTipos = () => {
    const todosTipos = Object.values(TipoCuenta);
    onAplicarFiltros({
      ...filtros,
      tiposCuenta: todosTipos,
    });
  };

  const seleccionarTodosLosEstados = () => {
    const todosEstados = Object.values(EstadoBoleta);
    onAplicarFiltros({
      ...filtros,
      estados: todosEstados,
    });
  };

  const hayFiltrosActivos = () => {
    return (
      filtros.tiposCuenta.length < Object.values(TipoCuenta).length ||
      filtros.estados.length < Object.values(EstadoBoleta).length ||
      filtros.empresas.length > 0
    );
  };

  const renderizarBotonFiltro = (
    id: string,
    etiqueta: string,
    activo: boolean,
    onPress: () => void,
    color?: string
  ) => (
    <TouchableOpacity
      key={id}
      style={[
        estilos.botonFiltro,
        activo && estilos.botonFiltroActivo,
        activo &&
          color && { backgroundColor: color + "20", borderColor: color },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          estilos.textoBotonFiltro,
          activo && estilos.textoBotonFiltroActivo,
          activo && color && { color },
        ]}
      >
        {etiqueta}
      </Text>
      {activo && (
        <Ionicons name="checkmark" size={16} color={color || Colores.naranja} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={estilos.contenedor}>
      {/* Selector de rango de fechas */}
      <SelectorRangoFechas
        rangoSeleccionado={filtros.rangoFechas}
        fechaInicio={filtros.fechaInicio}
        fechaFin={filtros.fechaFin}
        onCambiarRango={(rango, fechaInicio, fechaFin) => {
          onAplicarFiltros({
            ...filtros,
            rangoFechas: rango,
            fechaInicio: fechaInicio || filtros.fechaInicio,
            fechaFin: fechaFin || filtros.fechaFin,
          });
        }}
      />

      {/* Filtros avanzados */}
      <TarjetaBase>
        <View style={estilos.filtrosContainer}>
          {/* Encabezado con toggle */}
          <TouchableOpacity
            style={estilos.encabezadoFiltros}
            onPress={() => setExpandido(!expandido)}
          >
            <View style={estilos.tituloFiltros}>
              <Ionicons name="filter" size={20} color={Colores.naranja} />
              <Text style={estilos.textoTituloFiltros}>Filtros Avanzados</Text>
              {hayFiltrosActivos() && (
                <View style={estilos.indicadorFiltrosActivos} />
              )}
            </View>
            <Ionicons
              name={expandido ? "chevron-up" : "chevron-down"}
              size={20}
              color={Colores.textoGrisMedio}
            />
          </TouchableOpacity>

          {/* Contenido expandible */}
          {expandido && (
            <View style={estilos.contenidoFiltros}>
              {/* Filtro por tipo de cuenta */}
              <View style={estilos.seccionFiltro}>
                <View style={estilos.encabezadoSeccion}>
                  <Text style={estilos.tituloSeccion}>Tipos de Cuenta</Text>
                  <TouchableOpacity
                    onPress={seleccionarTodosLosTipos}
                    style={estilos.botonSeleccionarTodos}
                  >
                    <Text style={estilos.textoSeleccionarTodos}>
                      {filtros.tiposCuenta.length ===
                      Object.values(TipoCuenta).length
                        ? "Deseleccionar todos"
                        : "Seleccionar todos"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={estilos.scrollHorizontal}
                >
                  <View style={estilos.grupoFiltros}>
                    {Object.values(TipoCuenta).map((tipo) =>
                      renderizarBotonFiltro(
                        tipo,
                        TIPOS_CUENTA_LABELS[tipo],
                        filtros.tiposCuenta.includes(tipo),
                        () => toggleTipoCuenta(tipo),
                        Colores.azul
                      )
                    )}
                  </View>
                </ScrollView>
              </View>

              {/* Filtro por estado */}
              <View style={estilos.seccionFiltro}>
                <View style={estilos.encabezadoSeccion}>
                  <Text style={estilos.tituloSeccion}>Estados</Text>
                  <TouchableOpacity
                    onPress={seleccionarTodosLosEstados}
                    style={estilos.botonSeleccionarTodos}
                  >
                    <Text style={estilos.textoSeleccionarTodos}>
                      {filtros.estados.length ===
                      Object.values(EstadoBoleta).length
                        ? "Deseleccionar todos"
                        : "Seleccionar todos"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={estilos.grupoFiltros}>
                  {Object.values(EstadoBoleta).map((estado) => {
                    let color = Colores.textoGrisMedio;
                    switch (estado) {
                      case EstadoBoleta.PAGADA:
                        color = Colores.verde;
                        break;
                      case EstadoBoleta.PENDIENTE:
                        color = Colores.naranja;
                        break;
                      case EstadoBoleta.VENCIDA:
                        color = Colores.rojo;
                        break;
                    }

                    return renderizarBotonFiltro(
                      estado,
                      ESTADOS_BOLETA_LABELS[estado],
                      filtros.estados.includes(estado),
                      () => toggleEstado(estado),
                      color
                    );
                  })}
                </View>
              </View>

              {/* Botón limpiar filtros */}
              {hayFiltrosActivos() && (
                <TouchableOpacity
                  style={estilos.botonLimpiar}
                  onPress={onLimpiarFiltros}
                >
                  <Ionicons name="refresh" size={16} color={Colores.rojo} />
                  <Text style={estilos.textoBotonLimpiar}>Limpiar Filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TarjetaBase>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: 16,
  },
  filtrosContainer: {
    padding: 16,
  },
  encabezadoFiltros: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tituloFiltros: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textoTituloFiltros: {
    ...Tipografia.subtitulo,
    marginLeft: 8,
    color: Colores.textoBlanco,
  },
  indicadorFiltrosActivos: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colores.naranja,
    marginLeft: 8,
  },
  contenidoFiltros: {
    marginTop: 16,
    gap: 20,
  },
  seccionFiltro: {
    gap: 12,
  },
  encabezadoSeccion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tituloSeccion: {
    ...Tipografia.cuerpo,
    fontWeight: "600",
    color: Colores.textoBlanco,
  },
  botonSeleccionarTodos: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  textoSeleccionarTodos: {
    ...Tipografia.pequeno,
    color: Colores.naranja,
    fontWeight: "500",
  },
  scrollHorizontal: {
    flexGrow: 0,
  },
  grupoFiltros: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  botonFiltro: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colores.bordeClaro,
    backgroundColor: Colores.fondoSecundario,
    gap: 6,
  },
  botonFiltroActivo: {
    backgroundColor: Colores.naranja + "20",
    borderColor: Colores.naranja,
  },
  textoBotonFiltro: {
    ...Tipografia.pequeno,
    color: Colores.textoGrisMedio,
    fontWeight: "500",
  },
  textoBotonFiltroActivo: {
    color: Colores.naranja,
    fontWeight: "600",
  },
  botonLimpiar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colores.rojo,
    backgroundColor: Colores.rojo + "10",
    gap: 8,
  },
  textoBotonLimpiar: {
    ...Tipografia.cuerpo,
    color: Colores.rojo,
    fontWeight: "600",
  },
});
