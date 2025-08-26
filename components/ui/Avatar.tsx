/**
 * Componente Avatar para BoletaIA
 * Simple avatar con iniciales y opciones de personalización
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colores } from '../../constants/Colors';

export interface AvatarProps {
  nombre?: string;
  email?: string;
  avatarUrl?: string;
  size?: number;
  mostrarBorde?: boolean;
  editable?: boolean;
  onPress?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  nombre = '',
  email = '',
  avatarUrl,
  size = 40,
  mostrarBorde = false,
  editable = false,
  onPress,
}) => {
  const obtenerIniciales = (nombre: string, email: string): string => {
    if (nombre.trim()) {
      const palabras = nombre.trim().split(' ');
      if (palabras.length >= 2) {
        return (palabras[0][0] + palabras[1][0]).toUpperCase();
      }
      return palabras[0][0].toUpperCase();
    }
    
    if (email) {
      return email[0].toUpperCase();
    }
    
    return 'U';
  };

  const iniciales = obtenerIniciales(nombre, email);
  
  const estilosAvatar = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: Colores.naranja,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: mostrarBorde ? 3 : 0,
      borderColor: Colores.naranja,
      position: 'relative',
    },
    imagen: {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    texto: {
      color: Colores.textoBlanco,
      fontSize: size * 0.4,
      fontWeight: '600',
    },
    iconoEditar: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      backgroundColor: Colores.naranja,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: Colores.fondoTarjeta,
    },
  });

  const contenidoAvatar = (
    <View style={estilosAvatar.container}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={estilosAvatar.imagen} />
      ) : (
        <Text style={estilosAvatar.texto}>{iniciales}</Text>
      )}
      
      {editable && (
        <View style={estilosAvatar.iconoEditar}>
          <Ionicons name="create" size={12} color={Colores.textoBlanco} />
        </View>
      )}
    </View>
  );

  if (onPress || editable) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {contenidoAvatar}
      </TouchableOpacity>
    );
  }

  return contenidoAvatar;
};

// Variante grande para perfil
export const AvatarGrande: React.FC<AvatarProps> = (props) => {
  return <Avatar {...props} size={100} />;
};

// Variante mediana
export const AvatarMediano: React.FC<AvatarProps> = (props) => {
  return <Avatar {...props} size={60} />;
};

// Variante pequeña
export const AvatarPequeno: React.FC<AvatarProps> = (props) => {
  return <Avatar {...props} size={32} />;
};