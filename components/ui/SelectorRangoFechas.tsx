/**
 * SelectorRangoFechas - Componente para seleccionar rangos de fechas predefinidos o personalizados
 */

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colores } from '../../constants/Colors';
import { Tipografia } from '../../constants/Tipografia';
import { PropsSelectorRangoFechas, RangoFechas, RANGOS_FECHAS_LABELS } from '../../types';
import { UtilsBoleta } from '../../utils/validaciones';
import { TarjetaBase } from './TarjetaBase';

export function SelectorRangoFechas({
  rangoSeleccionado,
  fechaInicio,
  fechaFin,
  onCambiarRango,
}: PropsSelectorRangoFechas) {
  const [mostrarPickerInicio, setMostrarPickerInicio] = useState(false);
  const [mostrarPickerFin, setMostrarPickerFin] = useState(false);

  const manejarSeleccionRango = (rango: RangoFechas) => {
    onCambiarRango(rango);
  };

  const manejarCambioFechaInicio = (event: any, fecha: Date | undefined) => {
    setMostrarPickerInicio(false);
    if (fecha) {
      onCambiarRango(RangoFechas.PERSONALIZADO, fecha, fechaFin);
    }
  };

  const manejarCambioFechaFin = (event: any, fecha: Date | undefined) => {
    setMostrarPickerFin(false);
    if (fecha) {
      onCambiarRango(RangoFechas.PERSONALIZADO, fechaInicio, fecha);
    }
  };

  const renderizarBotonRango = (rango: RangoFechas) => {
    const esActivo = rangoSeleccionado === rango;
    
    return (
      <TouchableOpacity
        key={rango}
        style={[
          estilos.botonRango,
          esActivo && estilos.botonRangoActivo,
        ]}
        onPress={() => manejarSeleccionRango(rango)}
      >
        <Text
          style={[
            estilos.textoBotonRango,
            esActivo && estilos.textoBotonRangoActivo,
          ]}
        >
          {RANGOS_FECHAS_LABELS[rango]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <TarjetaBase>
      <View style={estilos.contenedor}>
        <View style={estilos.encabezado}>
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={Colores.naranja} 
          />
          <Text style={estilos.titulo}>Rango de Fechas</Text>
        </View>

        {/* Botones de rangos predefinidos */}
        <View style={estilos.botonesRango}>
          {Object.values(RangoFechas).map(rango => renderizarBotonRango(rango))}
        </View>

        {/* Fechas personalizadas */}
        {rangoSeleccionado === RangoFechas.PERSONALIZADO && (
          <View style={estilos.fechasPersonalizadas}>
            <View style={estilos.contenedorFecha}>
              <Text style={estilos.etiquetaFecha}>Desde</Text>
              <TouchableOpacity
                style={estilos.selectorFecha}
                onPress={() => setMostrarPickerInicio(true)}
              >
                <Text style={estilos.textoFecha}>
                  {(() => {
                    try {
                      const fecha = new Date(fechaInicio);
                      return isNaN(fecha.getTime()) ? 'Fecha inválida' : UtilsBoleta.formatearFecha(fecha);
                    } catch (error) {
                      return 'Fecha inválida';
                    }
                  })()}
                </Text>
                <Ionicons 
                  name="calendar" 
                  size={16} 
                  color={Colores.textoGrisMedio} 
                />
              </TouchableOpacity>
            </View>

            <View style={estilos.contenedorFecha}>
              <Text style={estilos.etiquetaFecha}>Hasta</Text>
              <TouchableOpacity
                style={estilos.selectorFecha}
                onPress={() => setMostrarPickerFin(true)}
              >
                <Text style={estilos.textoFecha}>
                  {(() => {
                    try {
                      const fecha = new Date(fechaFin);
                      return isNaN(fecha.getTime()) ? 'Fecha inválida' : UtilsBoleta.formatearFecha(fecha);
                    } catch (error) {
                      return 'Fecha inválida';
                    }
                  })()}
                </Text>
                <Ionicons 
                  name="calendar" 
                  size={16} 
                  color={Colores.textoGrisMedio} 
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Resumen del período seleccionado */}
        <View style={estilos.resumen}>
          <Text style={estilos.textoResumen}>
            {(() => {
              try {
                const fechaInicioObj = new Date(fechaInicio);
                const fechaFinObj = new Date(fechaFin);
                const fechaInicioStr = isNaN(fechaInicioObj.getTime()) ? 'Fecha inválida' : UtilsBoleta.formatearFecha(fechaInicioObj);
                const fechaFinStr = isNaN(fechaFinObj.getTime()) ? 'Fecha inválida' : UtilsBoleta.formatearFecha(fechaFinObj);
                return `Período: ${fechaInicioStr} - ${fechaFinStr}`;
              } catch (error) {
                return 'Período: Fechas inválidas';
              }
            })()}
          </Text>
        </View>

        {/* Date Pickers */}
        {mostrarPickerInicio && (
          <DateTimePicker
            testID="datePickerInicio"
            value={fechaInicio}
            mode="date"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={manejarCambioFechaInicio}
            maximumDate={new Date()}
          />
        )}

        {mostrarPickerFin && (
          <DateTimePicker
            testID="datePickerFin"
            value={fechaFin}
            mode="date"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={manejarCambioFechaFin}
            maximumDate={new Date()}
            minimumDate={fechaInicio}
          />
        )}
      </View>
    </TarjetaBase>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 16,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titulo: {
    ...Tipografia.subtitulo,
    marginLeft: 8,
    color: Colores.textoOscuro,
  },
  botonesRango: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  botonRango: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colores.bordeClaro,
    backgroundColor: Colores.fondoSecundario,
  },
  botonRangoActivo: {
    backgroundColor: Colores.naranja,
    borderColor: Colores.naranja,
  },
  textoBotonRango: {
    ...Tipografia.pequeno,
    color: Colores.textoGrisMedio,
    fontWeight: '500',
  },
  textoBotonRangoActivo: {
    color: Colores.textoBlanco,
  },
  fechasPersonalizadas: {
    gap: 12,
    marginBottom: 16,
  },
  contenedorFecha: {
    gap: 8,
  },
  etiquetaFecha: {
    ...Tipografia.pequeno,
    color: Colores.textoGrisMedio,
    fontWeight: '600',
  },
  selectorFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colores.bordeClaro,
    borderRadius: 8,
    backgroundColor: Colores.fondoSecundario,
  },
  textoFecha: {
    ...Tipografia.cuerpo,
    color: Colores.textoOscuro,
  },
  resumen: {
    padding: 12,
    backgroundColor: Colores.fondoTarjeta,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colores.bordeClaro,
  },
  textoResumen: {
    ...Tipografia.pequeno,
    color: Colores.textoGrisMedio,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});