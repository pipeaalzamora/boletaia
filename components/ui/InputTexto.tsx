/**
 * Input Texto - Componente de entrada reutilizable
 * Diseño vanguardista negro/naranja para BoletaIA
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { Colores } from '../../constants/Colors';
import { EstilosBase } from '../../constants/EstilosBase';
import { Tipografia } from '../../constants/Tipografia';

export interface PropsInputTexto extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  estiloContenedor?: ViewStyle;
  estiloInput?: TextStyle;
  estiloLabel?: TextStyle;
  icono?: keyof typeof Ionicons.glyphMap;
  iconoDerecha?: keyof typeof Ionicons.glyphMap;
  onPressIconoDerecha?: () => void;
  requerido?: boolean;
  tipo?: 'texto' | 'email' | 'telefono' | 'numero' | 'password';
  tamano?: 'pequeno' | 'mediano' | 'grande';
}

export function InputTexto({
  label,
  error,
  estiloContenedor,
  estiloInput,
  estiloLabel,
  icono,
  iconoDerecha,
  onPressIconoDerecha,
  requerido = false,
  tipo = 'texto',
  tamano = 'mediano',
  value,
  onChangeText,
  placeholder,
  ...otrasProps
}: PropsInputTexto) {
  const [isFocused, setIsFocused] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const obtenerTipoTeclado = () => {
    switch (tipo) {
      case 'email':
        return 'email-address' as const;
      case 'telefono':
        return 'phone-pad' as const;
      case 'numero':
        return 'numeric' as const;
      default:
        return 'default' as const;
    }
  };

  const obtenerEstiloInput = (): TextStyle => {
    let estiloBase = EstilosBase.inputBase;
    
    // Tamaño
    let fontSize = 16;
    let paddingVertical = 12;
    
    switch (tamano) {
      case 'pequeno':
        fontSize = 14;
        paddingVertical = 8;
        break;
      case 'grande':
        fontSize = 18;
        paddingVertical = 16;
        break;
    }

    // Estado focused
    const estiloFocused = isFocused ? EstilosBase.inputFocused : {};
    
    // Estado error
    const estiloError = error ? EstilosBase.inputError : {};

    // Padding para iconos
    const paddingLeft = icono ? 48 : 16;
    const paddingRight = (iconoDerecha || tipo === 'password') ? 48 : 16;

    return {
      ...estiloBase,
      ...estiloFocused,
      ...estiloError,
      fontSize,
      paddingVertical,
      paddingLeft,
      paddingRight,
      ...estiloInput,
    };
  };

  const obtenerEstiloLabel = (): TextStyle => {
    const colorLabel = error ? Colores.rojo : 
                      isFocused ? Colores.naranja : 
                      Colores.textoGrisClaro;

    return {
      ...Tipografia.label,
      color: colorLabel,
      ...estiloLabel,
    };
  };

  const manejarFocus = () => {
    setIsFocused(true);
  };

  const manejarBlur = () => {
    setIsFocused(false);
  };

  const alternarMostrarPassword = () => {
    setMostrarPassword(!mostrarPassword);
  };

  return (
    <View style={[{ marginBottom: 16 }, estiloContenedor]}>
      {label && (
        <Text style={obtenerEstiloLabel()}>
          {label}
          {requerido && <Text style={{ color: Colores.rojo }}> *</Text>}
        </Text>
      )}
      
      <View style={{ position: 'relative' }}>
        {icono && (
          <View style={{
            position: 'absolute',
            left: 16,
            top: tamano === 'pequeno' ? 8 : tamano === 'grande' ? 16 : 12,
            zIndex: 1,
          }}>
            <Ionicons 
              name={icono} 
              size={20} 
              color={isFocused ? Colores.naranja : Colores.textoGrisMedio} 
            />
          </View>
        )}

        <TextInput
          style={obtenerEstiloInput()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colores.textoGrisOscuro}
          onFocus={manejarFocus}
          onBlur={manejarBlur}
          keyboardType={obtenerTipoTeclado()}
          secureTextEntry={tipo === 'password' && !mostrarPassword}
          autoCapitalize={tipo === 'email' ? 'none' : 'sentences'}
          autoCorrect={tipo !== 'email' && tipo !== 'password'}
          {...otrasProps}
        />

        {(iconoDerecha || tipo === 'password') && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 16,
              top: tamano === 'pequeno' ? 8 : tamano === 'grande' ? 16 : 12,
              zIndex: 1,
            }}
            onPress={tipo === 'password' ? alternarMostrarPassword : onPressIconoDerecha}
          >
            <Ionicons 
              name={
                tipo === 'password' 
                  ? (mostrarPassword ? 'eye-off' : 'eye')
                  : (iconoDerecha || 'chevron-forward')
              } 
              size={20} 
              color={isFocused ? Colores.naranja : Colores.textoGrisMedio} 
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={[
          Tipografia.pequeno, 
          { color: Colores.rojo, marginTop: 4 }
        ]}>
          {error}
        </Text>
      )}
    </View>
  );
}