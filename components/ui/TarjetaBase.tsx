/**
 * Tarjeta Base - Componente contenedor reutilizable
 * Diseño vanguardista negro/naranja para BoletaIA
 */

import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { Colores } from '../../constants/Colors';
import { EstilosBase } from '../../constants/EstilosBase';

export interface PropsTarjetaBase {
  children: React.ReactNode;
  elevada?: boolean;
  onPress?: () => void;
  deshabilitada?: boolean;
  estiloPersonalizado?: ViewStyle;
  colorBorde?: string;
  colorFondo?: string;
  margen?: 'ninguno' | 'pequeno' | 'mediano' | 'grande';
  padding?: 'ninguno' | 'pequeno' | 'mediano' | 'grande';
  borderRadius?: number;
  sombra?: boolean;
}

export function TarjetaBase({
  children,
  elevada = false,
  onPress,
  deshabilitada = false,
  estiloPersonalizado,
  colorBorde,
  colorFondo,
  margen = 'mediano',
  padding = 'mediano',
  borderRadius,
  sombra = true,
}: PropsTarjetaBase) {
  
  const obtenerEstiloBase = (): ViewStyle => {
    const estiloBase = elevada ? EstilosBase.tarjetaElevada : EstilosBase.tarjetaBase;
    
    // Configurar márgenes
    let marginVertical = 8;
    switch (margen) {
      case 'ninguno':
        marginVertical = 0;
        break;
      case 'pequeno':
        marginVertical = 4;
        break;
      case 'grande':
        marginVertical = 16;
        break;
    }

    // Configurar padding
    let paddingValue = 16;
    switch (padding) {
      case 'ninguno':
        paddingValue = 0;
        break;
      case 'pequeno':
        paddingValue = 8;
        break;
      case 'grande':
        paddingValue = 24;
        break;
    }

    // Configurar colores personalizados
    const fondoPersonalizado = colorFondo ? { backgroundColor: colorFondo } : {};
    const bordePersonalizado = colorBorde ? { borderColor: colorBorde } : {};
    
    // Configurar border radius personalizado
    const radiusPersonalizado = borderRadius !== undefined ? { borderRadius } : {};

    // Configurar sombra
    const sombrasPersonalizadas = !sombra ? {
      shadowOpacity: 0,
      elevation: 0,
    } : {};

    // Estado deshabilitado
    const estiloDeshabilitado = deshabilitada ? {
      opacity: 0.5,
    } : {};

    return {
      ...estiloBase,
      marginVertical,
      padding: paddingValue,
      ...fondoPersonalizado,
      ...bordePersonalizado,
      ...radiusPersonalizado,
      ...sombrasPersonalizadas,
      ...estiloDeshabilitado,
      ...estiloPersonalizado,
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={obtenerEstiloBase()}
        onPress={onPress}
        disabled={deshabilitada}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={obtenerEstiloBase()}>
      {children}
    </View>
  );
}

// Variaciones específicas de la tarjeta base
export function TarjetaBoleta({ children, ...props }: Omit<PropsTarjetaBase, 'elevada'>) {
  return (
    <TarjetaBase elevada={true} {...props}>
      {children}
    </TarjetaBase>
  );
}

export function TarjetaConfiguracion({ children, ...props }: Omit<PropsTarjetaBase, 'elevada' | 'colorBorde'>) {
  return (
    <TarjetaBase 
      elevada={false} 
      colorBorde={Colores.bordeClaro}
      {...props}
    >
      {children}
    </TarjetaBase>
  );
}

export function TarjetaEstadistica({ children, ...props }: Omit<PropsTarjetaBase, 'elevada' | 'colorFondo'>) {
  return (
    <TarjetaBase 
      elevada={true}
      colorFondo={Colores.negroSuave}
      {...props}
    >
      {children}
    </TarjetaBase>
  );
}