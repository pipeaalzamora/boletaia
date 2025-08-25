/**
 * Badge - Componente para mostrar estados y etiquetas
 * Diseño vanguardista negro/naranja para BoletaIA
 */

import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tipografia } from '../../constants/Tipografia';
import { Colores } from '../../constants/Colors';
import { EstadoBoleta } from '../../types';

export interface PropsBadge {
  texto: string;
  tipo?: 'pagado' | 'pendiente' | 'vencido' | 'proximo' | 'personalizado';
  color?: string;
  colorTexto?: string;
  icono?: keyof typeof Ionicons.glyphMap;
  tamano?: 'pequeno' | 'mediano' | 'grande';
  estilo?: ViewStyle;
  estiloTexto?: TextStyle;
}

export function Badge({
  texto,
  tipo = 'personalizado',
  color,
  colorTexto,
  icono,
  tamano = 'mediano',
  estilo,
  estiloTexto,
}: PropsBadge) {

  const obtenerConfiguracionTipo = () => {
    switch (tipo) {
      case 'pagado':
        return {
          backgroundColor: Colores.verde,
          color: Colores.textoBlanco,
          icono: icono || 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
        };
      case 'pendiente':
        return {
          backgroundColor: Colores.naranja,
          color: Colores.textoBlanco,
          icono: icono || 'time' as keyof typeof Ionicons.glyphMap,
        };
      case 'vencido':
        return {
          backgroundColor: Colores.rojo,
          color: Colores.textoBlanco,
          icono: icono || 'warning' as keyof typeof Ionicons.glyphMap,
        };
      case 'proximo':
        return {
          backgroundColor: Colores.proximo,
          color: Colores.textoBlanco,
          icono: icono || 'alert-circle' as keyof typeof Ionicons.glyphMap,
        };
      default:
        return {
          backgroundColor: color || Colores.grisMedio,
          color: colorTexto || Colores.textoBlanco,
          icono: icono,
        };
    }
  };

  const obtenerTamanos = () => {
    switch (tamano) {
      case 'pequeno':
        return {
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 8,
          fontSize: 10,
          iconSize: 12,
        };
      case 'grande':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          fontSize: 14,
          iconSize: 16,
        };
      default: // mediano
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          fontSize: 12,
          iconSize: 14,
        };
    }
  };

  const configuracion = obtenerConfiguracionTipo();
  const tamanos = obtenerTamanos();

  const estiloContenedor: ViewStyle = {
    backgroundColor: configuracion.backgroundColor,
    paddingHorizontal: tamanos.paddingHorizontal,
    paddingVertical: tamanos.paddingVertical,
    borderRadius: tamanos.borderRadius,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    ...estilo,
  };

  const estiloTextoFinal: TextStyle = {
    color: configuracion.color,
    fontSize: tamanos.fontSize,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    ...estiloTexto,
  };

  return (
    <View style={estiloContenedor}>
      {configuracion.icono && (
        <Ionicons 
          name={configuracion.icono} 
          size={tamanos.iconSize} 
          color={configuracion.color}
          style={{ marginRight: texto ? 4 : 0 }}
        />
      )}
      {texto && (
        <Text style={estiloTextoFinal}>
          {texto}
        </Text>
      )}
    </View>
  );
}

// Componentes específicos para estados de boletas
export function BadgeEstadoBoleta({ estado }: { estado: EstadoBoleta }) {
  const configuraciones = {
    [EstadoBoleta.PAGADA]: { tipo: 'pagado' as const, texto: 'Pagada' },
    [EstadoBoleta.PENDIENTE]: { tipo: 'pendiente' as const, texto: 'Pendiente' },
    [EstadoBoleta.VENCIDA]: { tipo: 'vencido' as const, texto: 'Vencida' },
    [EstadoBoleta.PROXIMA]: { tipo: 'proximo' as const, texto: 'Próxima' },
  };

  const config = configuraciones[estado];
  
  return (
    <Badge 
      tipo={config.tipo}
      texto={config.texto}
      tamano="pequeno"
    />
  );
}

// Badge para mostrar días restantes
export function BadgeDiasRestantes({ dias }: { dias: number }) {
  let tipo: PropsBadge['tipo'] = 'pendiente';
  let texto = '';

  if (dias < 0) {
    tipo = 'vencido';
    texto = `${Math.abs(dias)}d vencida`;
  } else if (dias === 0) {
    tipo = 'proximo';
    texto = 'Hoy';
  } else if (dias <= 3) {
    tipo = 'proximo';
    texto = `${dias}d restantes`;
  } else {
    tipo = 'pendiente';
    texto = `${dias}d restantes`;
  }

  return (
    <Badge 
      tipo={tipo}
      texto={texto}
      tamano="pequeno"
    />
  );
}

// Badge para tipos de cuenta
export function BadgeTipoCuenta({ tipo }: { tipo: string }) {
  return (
    <Badge 
      texto={tipo.toUpperCase()}
      color={Colores.fondoInput}
      colorTexto={Colores.naranja}
      tamano="pequeno"
    />
  );
}