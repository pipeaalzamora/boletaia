/**
 * Sistema de colores vanguardista para BoletaIA
 * Esquema principal: Negro y Naranja con acentos verde y rojo
 */

export const Colores = {
  // Colores Principales
  negro: '#000000',
  naranja: '#FF6B35',
  
  // Colores Secundarios
  verde: '#10B981',
  rojo: '#EF4444',
  azul: '#3B82F6',
  
  // Variaciones de Negro
  negroSuave: '#1A1A1A',
  grisOscuro: '#1F1F1F',
  grisMedio: '#2A2A2A',
  grisClaro: '#F5F5F5',
  blanco: '#FFFFFF',
  
  // Estados de Boletas
  pendiente: '#FF6B35',
  pagado: '#10B981',
  vencido: '#EF4444',
  proximo: '#FFA726',
  
  // Fondos
  fondoPrincipal: '#000000',
  fondoTarjeta: '#1F1F1F',
  fondoSecundario: '#2A2A2A',
  fondoInput: '#2A2A2A',
  fondoModal: 'rgba(0, 0, 0, 0.8)',
  
  // Bordes y Separadores
  bordeOscuro: '#333333',
  bordeClaro: '#404040',
  sombra: 'rgba(255, 107, 53, 0.2)',
  
  // Textos
  textoBlanco: '#FFFFFF',
  textoOscuro: '#1A1A1A',
  textoGrisClaro: '#E5E5E5',
  textoGrisMedio: '#B0B0B0',
  textoGrisOscuro: '#808080',
  textoNaranja: '#FF6B35',
};

// Para compatibilidad con el sistema existente
export const Colors = {
  light: {
    text: Colores.textoBlanco,
    background: Colores.fondoPrincipal,
    tint: Colores.naranja,
    icon: Colores.textoGrisMedio,
    tabIconDefault: Colores.textoGrisMedio,
    tabIconSelected: Colores.naranja,
  },
  dark: {
    text: Colores.textoBlanco,
    background: Colores.fondoPrincipal,
    tint: Colores.naranja,
    icon: Colores.textoGrisMedio,
    tabIconDefault: Colores.textoGrisMedio,
    tabIconSelected: Colores.naranja,
  },
};
