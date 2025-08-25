/**
 * BotonDeslizable - Componente para confirmar acciones deslizando
 * Especialmente diseñado para marcar boletas como pagadas
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    LayoutChangeEvent,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent
} from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { Colores } from '../../constants/Colors';
import { Tipografia } from '../../constants/Tipografia';
import { PropsBotonDeslizable } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_PADDING = 16;
const SLIDER_HEIGHT = 60;
const THUMB_SIZE = 50;
const SLIDE_THRESHOLD = 0.7; // 70% del recorrido para activar

export function BotonDeslizable({
  onDeslizar,
  texto,
  textoCompletado,
  color,
  deshabilitado = false,
}: PropsBotonDeslizable) {
  const [completado, setCompletado] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH - (BUTTON_PADDING * 2));
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const maxSlide = containerWidth - THUMB_SIZE - 8; // 8px de margen

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const resetSlider = () => {
    translateX.value = withSpring(0);
    opacity.value = withSpring(1);
  };

  const completeSlider = async () => {
    setCompletado(true);
    setProcesando(true);
    
    try {
      await onDeslizar();
      // Mantener completado si es exitoso
      translateX.value = withSpring(maxSlide);
      opacity.value = withSpring(0.3);
    } catch (error) {
      // Si hay error, resetear
      setCompletado(false);
      resetSlider();
    } finally {
      setProcesando(false);
    }
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number }>({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      if (completado || deshabilitado) return;
      
      const newValue = context.startX + event.translationX;
      translateX.value = Math.max(0, Math.min(newValue, maxSlide));
      
      // Fade del texto basado en la posición
      const progress = translateX.value / maxSlide;
      opacity.value = interpolate(
        progress,
        [0, 0.5, 1],
        [1, 0.5, 0.2],
        Extrapolate.CLAMP
      );
    },
    onEnd: () => {
      if (completado || deshabilitado) return;
      
      const progress = translateX.value / maxSlide;
      
      if (progress >= SLIDE_THRESHOLD) {
        // Completar deslizamiento
        translateX.value = withSpring(maxSlide);
        runOnJS(completeSlider)();
      } else {
        // Resetear posición
        runOnJS(resetSlider)();
      }
    },
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    const width = translateX.value + THUMB_SIZE;
    return {
      width: Math.max(THUMB_SIZE, width),
    };
  });

  const obtenerTextoMostrado = () => {
    if (procesando) return 'Procesando...';
    if (completado) return textoCompletado;
    return texto;
  };

  const obtenerColorFondo = () => {
    if (deshabilitado) return Colores.grisMedio;
    if (completado) return Colores.verde;
    return color;
  };

  const obtenerIcono = () => {
    if (procesando) return 'time';
    if (completado) return 'checkmark';
    return 'chevron-forward';
  };

  return (
    <View style={estilos.container} onLayout={handleLayout}>
      {/* Fondo del botón */}
      <View style={[
        estilos.background,
        { 
          backgroundColor: obtenerColorFondo(),
          opacity: deshabilitado ? 0.5 : 1,
        }
      ]}>
        {/* Barra de progreso */}
        <Animated.View 
          style={[
            estilos.progressBar,
            { backgroundColor: completado ? Colores.verde : `${color}80` },
            progressStyle,
          ]} 
        />
        
        {/* Texto del botón */}
        <Animated.View style={[estilos.textContainer, textStyle]}>
          <Text style={[
            Tipografia.botonPrimario,
            { color: Colores.textoBlanco }
          ]}>
            {obtenerTextoMostrado()}
          </Text>
        </Animated.View>
      </View>

      {/* Thumb deslizable */}
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        enabled={!deshabilitado && !completado}
      >
        <Animated.View style={[estilos.thumb, thumbStyle]}>
          <View style={[
            estilos.thumbContent,
            { 
              backgroundColor: Colores.textoBlanco,
              opacity: deshabilitado ? 0.5 : 1,
            }
          ]}>
            <Ionicons 
              name={obtenerIcono()} 
              size={24} 
              color={completado ? Colores.verde : color}
            />
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* Indicador de dirección */}
      {!completado && !deshabilitado && (
        <View style={estilos.arrowIndicator}>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={Colores.textoBlanco + '60'} 
          />
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={Colores.textoBlanco + '40'} 
            style={{ marginLeft: -8 }}
          />
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={Colores.textoBlanco + '20'} 
            style={{ marginLeft: -8 }}
          />
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    height: SLIDER_HEIGHT,
    position: 'relative',
    marginVertical: 8,
    flex: 1,
    minWidth: 200, // Ancho mínimo para funcionalidad
  },
  background: {
    height: SLIDER_HEIGHT,
    borderRadius: SLIDER_HEIGHT / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: SLIDER_HEIGHT / 2,
  },
  textContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
  },
  thumb: {
    position: 'absolute',
    left: 5,
    top: (SLIDER_HEIGHT - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
  thumbContent: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  arrowIndicator: {
    position: 'absolute',
    right: 20,
    top: (SLIDER_HEIGHT - 16) / 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
});