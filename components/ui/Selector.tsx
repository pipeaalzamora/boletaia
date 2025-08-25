/**
 * Selector - Componente de selección reutilizable
 * Para fechas, opciones y dropdowns con diseño vanguardista
 */

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { Colores } from '../../constants/Colors';
import { EstilosBase } from '../../constants/EstilosBase';
import { Tipografia } from '../../constants/Tipografia';
import { BotonPrimario } from './BotonPrimario';
import { TarjetaBase } from './TarjetaBase';

export interface OpcionSelector {
  value: string;
  label: string;
  icono?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export interface PropsSelectorBase {
  label?: string;
  error?: string;
  requerido?: boolean;
  deshabilitado?: boolean;
  estiloContenedor?: ViewStyle;
  estiloLabel?: TextStyle;
  placeholder?: string;
}

export interface PropsSelectorFecha extends PropsSelectorBase {
  tipo: 'fecha';
  value?: Date;
  onChangeValue: (fecha: Date) => void;
  fechaMinima?: Date;
  fechaMaxima?: Date;
  modo?: 'date' | 'time' | 'datetime';
}

export interface PropsSelectorOpciones extends PropsSelectorBase {
  tipo: 'opciones';
  value?: string;
  onChangeValue: (valor: string) => void;
  opciones: OpcionSelector[];
  busquedaHabilitada?: boolean;
}

export type PropsSelector = PropsSelectorFecha | PropsSelectorOpciones;

export function Selector(props: PropsSelector) {
  const [modalVisible, setModalVisible] = useState(false);
  const [fechaPickerVisible, setFechaPickerVisible] = useState(false);

  const {
    label,
    error,
    requerido = false,
    deshabilitado = false,
    estiloContenedor,
    estiloLabel,
    placeholder,
  } = props;

  const obtenerEstiloLabel = (): TextStyle => {
    const colorLabel = error ? Colores.rojo : Colores.textoGrisClaro;
    return {
      ...Tipografia.label,
      color: colorLabel,
      ...estiloLabel,
    };
  };

  const obtenerEstiloSelector = (): ViewStyle => {
    const estiloBase = {
      ...EstilosBase.inputBase,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    };

    const estiloError = error ? { borderColor: Colores.rojo, borderWidth: 2 } : {};
    const estiloDeshabilitado = deshabilitado ? { opacity: 0.5 } : {};

    return {
      ...estiloBase,
      ...estiloError,
      ...estiloDeshabilitado,
    };
  };

  const obtenerTextoMostrado = (): string => {
    if (props.tipo === 'fecha') {
      if (props.value) {
        const formatoFecha = props.modo === 'time' ? 'HH:mm' : 
                            props.modo === 'datetime' ? 'dd/MM/yyyy HH:mm' :
                            'dd/MM/yyyy';
        return props.value.toLocaleDateString('es-CL');
      }
      return placeholder || 'Seleccionar fecha';
    } else {
      const opcionSeleccionada = props.opciones.find(op => op.value === props.value);
      return opcionSeleccionada?.label || placeholder || 'Seleccionar opción';
    }
  };

  const obtenerColorTexto = (): string => {
    const tieneValor = props.tipo === 'fecha' ? !!props.value : !!props.value;
    return tieneValor ? Colores.textoBlanco : Colores.textoGrisOscuro;
  };

  const manejarPress = () => {
    if (deshabilitado) return;
    
    if (props.tipo === 'fecha') {
      setFechaPickerVisible(true);
    } else {
      setModalVisible(true);
    }
  };

  const manejarCambioFecha = (event: any, fecha?: Date) => {
    if (Platform.OS === 'android') {
      setFechaPickerVisible(false);
    }
    
    if (fecha && props.tipo === 'fecha') {
      props.onChangeValue(fecha);
    }
  };

  const manejarSeleccionOpcion = (valor: string) => {
    if (props.tipo === 'opciones') {
      props.onChangeValue(valor);
    }
    setModalVisible(false);
  };

  const renderOpcion = ({ item }: { item: OpcionSelector }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colores.bordeOscuro,
      }}
      onPress={() => manejarSeleccionOpcion(item.value)}
    >
      {item.icono && (
        <Ionicons 
          name={item.icono} 
          size={20} 
          color={item.color || Colores.naranja}
          style={{ marginRight: 12 }}
        />
      )}
      <Text style={[
        Tipografia.cuerpo,
        { 
          color: props.value === item.value ? Colores.naranja : Colores.textoGrisClaro 
        }
      ]}>
        {item.label}
      </Text>
      {props.value === item.value && (
        <Ionicons 
          name="checkmark" 
          size={20} 
          color={Colores.naranja}
          style={{ marginLeft: 'auto' }}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[{ marginBottom: 16 }, estiloContenedor]}>
      {label && (
        <Text style={obtenerEstiloLabel()}>
          {label}
          {requerido && <Text style={{ color: Colores.rojo }}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={obtenerEstiloSelector()}
        onPress={manejarPress}
        disabled={deshabilitado}
      >
        <Text style={[
          Tipografia.cuerpo,
          { color: obtenerColorTexto() }
        ]}>
          {obtenerTextoMostrado()}
        </Text>
        
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={Colores.textoGrisMedio} 
        />
      </TouchableOpacity>

      {error && (
        <Text style={[
          Tipografia.pequeno, 
          { color: Colores.rojo, marginTop: 4 }
        ]}>
          {error}
        </Text>
      )}

      {/* Modal para opciones */}
      {props.tipo === 'opciones' && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={EstilosBase.modalOverlay}>
            <TarjetaBase 
              estiloPersonalizado={{
                width: '90%',
                maxHeight: '70%',
              }}
              padding="ninguno"
            >
              <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: Colores.bordeOscuro }}>
                <Text style={Tipografia.subtitulo}>
                  {label || 'Seleccionar opción'}
                </Text>
              </View>
              
              <FlatList
                data={props.opciones}
                keyExtractor={(item) => item.value}
                renderItem={renderOpcion}
                style={{ maxHeight: 300 }}
              />
              
              <View style={{ padding: 20 }}>
                <BotonPrimario
                  titulo="Cancelar"
                  onPress={() => setModalVisible(false)}
                  tipo="secundario"
                />
              </View>
            </TarjetaBase>
          </View>
        </Modal>
      )}

      {/* DateTimePicker para fechas */}
      {props.tipo === 'fecha' && fechaPickerVisible && (
        <DateTimePicker
          value={props.value || new Date()}
          mode={props.modo || 'date'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={manejarCambioFecha}
          minimumDate={props.fechaMinima}
          maximumDate={props.fechaMaxima}
          locale="es-CL"
        />
      )}
    </View>
  );
}