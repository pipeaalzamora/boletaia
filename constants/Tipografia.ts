/**
 * Sistema de tipografía vanguardista para BoletaIA
 * Estilos de texto modernos y elegantes
 */

import { TextStyle } from 'react-native';
import { Colores } from './Colors';

export const Tipografia = {
  // Títulos principales
  tituloGrande: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colores.textoBlanco,
    letterSpacing: -0.5,
  } as TextStyle,

  titulo: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colores.textoBlanco,
    letterSpacing: -0.3,
  } as TextStyle,

  subtitulo: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colores.textoBlanco,
    letterSpacing: -0.2,
  } as TextStyle,

  // Texto de cuerpo
  cuerpo: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    color: Colores.textoGrisClaro,
    lineHeight: 24,
  } as TextStyle,

  cuerpoMedio: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    color: Colores.textoGrisClaro,
    lineHeight: 20,
  } as TextStyle,

  pequeno: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    color: Colores.textoGrisMedio,
    lineHeight: 18,
  } as TextStyle,

  // Texto de énfasis
  enfasis: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colores.naranja,
  } as TextStyle,

  enfasisVerde: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colores.verde,
  } as TextStyle,

  enfasisRojo: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colores.rojo,
  } as TextStyle,

  // Texto para botones
  botonPrimario: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colores.textoBlanco,
    textAlign: 'center' as const,
  } as TextStyle,

  botonSecundario: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colores.naranja,
    textAlign: 'center' as const,
  } as TextStyle,

  // Texto para tarjetas
  tituloTarjeta: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colores.textoBlanco,
  } as TextStyle,

  montoTarjeta: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colores.naranja,
  } as TextStyle,

  fechaTarjeta: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    color: Colores.textoGrisMedio,
  } as TextStyle,

  // Labels y descripciones
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colores.textoGrisClaro,
    marginBottom: 4,
  } as TextStyle,

  descripcion: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    color: Colores.textoGrisMedio,
    lineHeight: 20,
  } as TextStyle,

  // Estados especiales
  estado: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  } as TextStyle,

  estadoPagado: {
    ...{
      fontSize: 12,
      fontWeight: '600' as const,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
    color: Colores.verde,
  } as TextStyle,

  estadoPendiente: {
    ...{
      fontSize: 12,
      fontWeight: '600' as const,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
    color: Colores.naranja,
  } as TextStyle,

  estadoVencido: {
    ...{
      fontSize: 12,
      fontWeight: '600' as const,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
    color: Colores.rojo,
  } as TextStyle,
};