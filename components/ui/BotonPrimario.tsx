/**
 * Botón Primario - Componente base reutilizable
 * Diseño vanguardista negro/naranja para BoletaIA
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { EstilosBase } from '../../constants/EstilosBase';
import { Tipografia } from '../../constants/Tipografia';
import { Colores } from '../../constants/Colors';

export interface PropsBotonPrimario {
  titulo: string;
  onPress: () => void;
  deshabilitado?: boolean;
  cargando?: boolean;
  tipo?: 'primario' | 'secundario' | 'peligro' | 'exito';
  tamano?: 'pequeno' | 'mediano' | 'grande';
  ancho?: 'completo' | 'ajustado';
  estiloPersonalizado?: ViewStyle;
  estiloTextoPersonalizado?: TextStyle;
  icono?: React.ReactNode;
  posicionIcono?: 'izquierda' | 'derecha';
}

export function BotonPrimario({
  titulo,
  onPress,
  deshabilitado = false,
  cargando = false,
  tipo = 'primario',
  tamano = 'mediano',
  ancho = 'completo',
  estiloPersonalizado,
  estiloTextoPersonalizado,
  icono,
  posicionIcono = 'izquierda',
}: PropsBotonPrimario) {
  
  const obtenerEstiloBoton = (): ViewStyle => {
    let estiloBase = EstilosBase.botonPrimario;
    
    switch (tipo) {
      case 'secundario':
        estiloBase = EstilosBase.botonSecundario;
        break;
      case 'peligro':
        estiloBase = EstilosBase.botonPeligro;
        break;
      case 'exito':
        estiloBase = EstilosBase.botonExito;
        break;
      default:
        estiloBase = EstilosBase.botonPrimario;
    }

    // Ajustar tamaño
    let paddingVertical = 14;
    let paddingHorizontal = 24;
    
    switch (tamano) {
      case 'pequeno':
        paddingVertical = 8;
        paddingHorizontal = 16;
        break;
      case 'grande':
        paddingVertical = 18;
        paddingHorizontal = 32;
        break;
    }

    // Ajustar ancho
    const anchoCompleto = ancho === 'completo' ? { width: '100%' } : {};

    // Estado deshabilitado
    const estiloDeshabilitado = (deshabilitado || cargando) ? {
      opacity: 0.5,
      backgroundColor: tipo === 'secundario' ? 'transparent' : Colores.grisMedio,
    } : {};

    return {
      ...estiloBase,
      paddingVertical,
      paddingHorizontal,
      ...anchoCompleto,
      ...estiloDeshabilitado,
      ...estiloPersonalizado,
    };
  };

  const obtenerEstiloTexto = (): TextStyle => {
    let colorTexto = Colores.textoBlanco;
    
    switch (tipo) {
      case 'secundario':
        colorTexto = Colores.naranja;
        break;
      case 'primario':
      case 'peligro':
      case 'exito':
      default:
        colorTexto = Colores.textoBlanco;
    }

    let fontSize = 16;
    switch (tamano) {
      case 'pequeno':
        fontSize = 14;
        break;
      case 'grande':
        fontSize = 18;
        break;
    }

    return {
      ...Tipografia.botonPrimario,
      color: colorTexto,
      fontSize,
      ...estiloTextoPersonalizado,
    };
  };

  const renderContenido = () => {
    if (cargando) {
      return (
        <ActivityIndicator 
          size="small" 
          color={tipo === 'secundario' ? Colores.naranja : Colores.textoBlanco} 
        />
      );
    }

    if (icono && posicionIcono === 'izquierda') {
      return (
        <>
          {icono}
          <Text style={[obtenerEstiloTexto(), { marginLeft: 8 }]}>{titulo}</Text>
        </>
      );
    }

    if (icono && posicionIcono === 'derecha') {
      return (
        <>
          <Text style={[obtenerEstiloTexto(), { marginRight: 8 }]}>{titulo}</Text>
          {icono}
        </>
      );
    }

    return <Text style={obtenerEstiloTexto()}>{titulo}</Text>;
  };

  return (
    <TouchableOpacity
      style={obtenerEstiloBoton()}
      onPress={onPress}
      disabled={deshabilitado || cargando}
      activeOpacity={0.7}
    >
      {renderContenido()}
    </TouchableOpacity>
  );
}