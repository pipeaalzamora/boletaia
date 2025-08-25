/**
 * Context Provider para BoletaIA
 * Gestión global de estado para boletas, usuarios y configuraciones
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BoletaInterface,
  UsuarioInterface,
  ConfiguracionNotificaciones,
  NuevaBoleta,
  ActualizacionBoleta,
  EstadoBoletasContexto,
  AccionesBoletasContexto,
} from '../types';
import { ServicioNotificaciones } from '../services/NotificacionesService';

// Tipos para el reducer
type AccionBoletas =
  | { type: 'SET_CARGANDO'; payload: boolean }
  | { type: 'SET_BOLETAS'; payload: BoletaInterface[] }
  | { type: 'AGREGAR_BOLETA'; payload: BoletaInterface }
  | { type: 'ACTUALIZAR_BOLETA'; payload: BoletaInterface }
  | { type: 'ELIMINAR_BOLETA'; payload: string }
  | { type: 'SET_USUARIO'; payload: UsuarioInterface | null }
  | { type: 'SET_CONFIGURACION_NOTIFICACIONES'; payload: ConfiguracionNotificaciones | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CARGAR_DATOS_LOCALES'; payload: { boletas: BoletaInterface[]; usuario: UsuarioInterface | null; configuracion: ConfiguracionNotificaciones | null } };

// Estado inicial
const estadoInicial: EstadoBoletasContexto = {
  boletas: [],
  boletasCargando: false,
  error: null,
  usuario: null,
  configuracionNotificaciones: null,
};

// Reducer
function boletasReducer(estado: EstadoBoletasContexto, accion: AccionBoletas): EstadoBoletasContexto {
  switch (accion.type) {
    case 'SET_CARGANDO':
      return { ...estado, boletasCargando: accion.payload };
    
    case 'SET_BOLETAS':
      return { ...estado, boletas: accion.payload, boletasCargando: false };
    
    case 'AGREGAR_BOLETA':
      return { 
        ...estado, 
        boletas: [...estado.boletas, accion.payload],
        boletasCargando: false,
      };
    
    case 'ACTUALIZAR_BOLETA':
      return {
        ...estado,
        boletas: estado.boletas.map(boleta =>
          boleta.id === accion.payload.id ? accion.payload : boleta
        ),
        boletasCargando: false,
      };
    
    case 'ELIMINAR_BOLETA':
      return {
        ...estado,
        boletas: estado.boletas.filter(boleta => boleta.id !== accion.payload),
        boletasCargando: false,
      };
    
    case 'SET_USUARIO':
      return { ...estado, usuario: accion.payload };
    
    case 'SET_CONFIGURACION_NOTIFICACIONES':
      return { ...estado, configuracionNotificaciones: accion.payload };
    
    case 'SET_ERROR':
      return { ...estado, error: accion.payload, boletasCargando: false };
    
    case 'CARGAR_DATOS_LOCALES':
      return {
        ...estado,
        boletas: accion.payload.boletas,
        usuario: accion.payload.usuario,
        configuracionNotificaciones: accion.payload.configuracion,
        boletasCargando: false,
      };
    
    default:
      return estado;
  }
}

// Context
const BoletasContext = createContext<(EstadoBoletasContexto & AccionesBoletasContexto) | undefined>(undefined);

// Keys para AsyncStorage
const STORAGE_KEYS = {
  BOLETAS: '@boletaia_boletas',
  USUARIO: '@boletaia_usuario',
  CONFIGURACION: '@boletaia_configuracion',
};

// Utilidades de almacenamiento
const StorageUtils = {
  async guardarBoletas(boletas: BoletaInterface[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BOLETAS, JSON.stringify(boletas));
    } catch (error) {
      console.error('Error al guardar boletas:', error);
    }
  },

  async cargarBoletas(): Promise<BoletaInterface[]> {
    try {
      const boletasJson = await AsyncStorage.getItem(STORAGE_KEYS.BOLETAS);
      if (boletasJson) {
        const boletas = JSON.parse(boletasJson);
        // Convertir strings de fecha a objetos Date
        return boletas.map((boleta: any) => ({
          ...boleta,
          fechaEmision: new Date(boleta.fechaEmision),
          fechaVencimiento: new Date(boleta.fechaVencimiento),
          fechaCorte: new Date(boleta.fechaCorte),
          fechaProximaLectura: new Date(boleta.fechaProximaLectura),
          fechaCreacion: new Date(boleta.fechaCreacion),
          fechaActualizacion: new Date(boleta.fechaActualizacion),
          fechaPago: boleta.fechaPago ? new Date(boleta.fechaPago) : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error al cargar boletas:', error);
      return [];
    }
  },

  async guardarUsuario(usuario: UsuarioInterface): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuario));
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  },

  async cargarUsuario(): Promise<UsuarioInterface | null> {
    try {
      const usuarioJson = await AsyncStorage.getItem(STORAGE_KEYS.USUARIO);
      if (usuarioJson) {
        const usuario = JSON.parse(usuarioJson);
        return {
          ...usuario,
          fechaRegistro: new Date(usuario.fechaRegistro),
        };
      }
      return null;
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      return null;
    }
  },

  async guardarConfiguracion(configuracion: ConfiguracionNotificaciones): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONFIGURACION, JSON.stringify(configuracion));
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    }
  },

  async cargarConfiguracion(): Promise<ConfiguracionNotificaciones | null> {
    try {
      const configJson = await AsyncStorage.getItem(STORAGE_KEYS.CONFIGURACION);
      return configJson ? JSON.parse(configJson) : null;
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      return null;
    }
  },
};

// Provider Component
interface BoletasProviderProps {
  children: ReactNode;
}

export function BoletasProvider({ children }: BoletasProviderProps) {
  const [estado, dispatch] = useReducer(boletasReducer, estadoInicial);

  // Cargar datos al inicializar
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Guardar boletas cuando cambien
  useEffect(() => {
    if (estado.boletas.length > 0) {
      StorageUtils.guardarBoletas(estado.boletas);
    }
  }, [estado.boletas]);

  // Guardar usuario cuando cambie
  useEffect(() => {
    if (estado.usuario) {
      StorageUtils.guardarUsuario(estado.usuario);
    }
  }, [estado.usuario]);

  // Guardar configuración cuando cambie
  useEffect(() => {
    if (estado.configuracionNotificaciones) {
      StorageUtils.guardarConfiguracion(estado.configuracionNotificaciones);
    }
  }, [estado.configuracionNotificaciones]);

  const cargarDatosIniciales = async () => {
    try {
      dispatch({ type: 'SET_CARGANDO', payload: true });
      
      // Solicitar permisos de notificaciones
      await ServicioNotificaciones.solicitarPermisos();
      
      const [boletas, usuario, configuracion] = await Promise.all([
        StorageUtils.cargarBoletas(),
        StorageUtils.cargarUsuario(),
        StorageUtils.cargarConfiguracion(),
      ]);

      dispatch({
        type: 'CARGAR_DATOS_LOCALES',
        payload: { boletas, usuario, configuracion },
      });
      
      // Reprogramar notificaciones si hay configuración
      if (configuracion && configuracion.habilitadas) {
        await ServicioNotificaciones.reprogramarTodasLasNotificaciones(boletas, configuracion);
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar datos de la aplicación' });
    }
  };

  const cargarBoletas = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_CARGANDO', payload: true });
      const boletas = await StorageUtils.cargarBoletas();
      dispatch({ type: 'SET_BOLETAS', payload: boletas });
    } catch (error) {
      console.error('Error al cargar boletas:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar las boletas' });
    }
  };

  const agregarBoleta = async (nuevaBoleta: NuevaBoleta): Promise<BoletaInterface> => {
    try {
      dispatch({ type: 'SET_CARGANDO', payload: true });
      
      // Crear la boleta con datos completos
      const boleta: BoletaInterface = {
        id: `boleta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        usuarioId: estado.usuario?.id || 'usuario_temporal',
        ...nuevaBoleta,
        estaPagada: false,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      };

      dispatch({ type: 'AGREGAR_BOLETA', payload: boleta });
      
      // Programar notificaciones si están habilitadas
      if (estado.configuracionNotificaciones?.habilitadas) {
        await ServicioNotificaciones.programarNotificacionesBoleta(
          boleta, 
          estado.configuracionNotificaciones
        );
      }
      
      return boleta;
    } catch (error) {
      console.error('Error al agregar boleta:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al agregar la boleta' });
      throw error;
    }
  };

  const actualizarBoleta = async (id: string, datos: ActualizacionBoleta): Promise<BoletaInterface> => {
    try {
      dispatch({ type: 'SET_CARGANDO', payload: true });
      
      const boletaActual = estado.boletas.find(b => b.id === id);
      if (!boletaActual) {
        throw new Error('Boleta no encontrada');
      }

      const boletaActualizada: BoletaInterface = {
        ...boletaActual,
        ...datos,
        fechaActualizacion: new Date(),
      };

      dispatch({ type: 'ACTUALIZAR_BOLETA', payload: boletaActualizada });
      return boletaActualizada;
    } catch (error) {
      console.error('Error al actualizar boleta:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al actualizar la boleta' });
      throw error;
    }
  };

  const marcarComoPagada = async (id: string): Promise<BoletaInterface> => {
    try {
      const actualizacion: ActualizacionBoleta = {
        estaPagada: true,
        fechaPago: new Date(),
      };
      
      const boletaActualizada = await actualizarBoleta(id, actualizacion);
      
      // Cancelar notificaciones de la boleta pagada
      await ServicioNotificaciones.cancelarNotificacionesBoleta(id);
      
      return boletaActualizada;
    } catch (error) {
      console.error('Error al marcar como pagada:', error);
      throw error;
    }
  };

  const eliminarBoleta = async (id: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_CARGANDO', payload: true });
      
      // Cancelar notificaciones de la boleta
      await ServicioNotificaciones.cancelarNotificacionesBoleta(id);
      
      dispatch({ type: 'ELIMINAR_BOLETA', payload: id });
    } catch (error) {
      console.error('Error al eliminar boleta:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al eliminar la boleta' });
      throw error;
    }
  };

  const configurarNotificaciones = async (config: ConfiguracionNotificaciones): Promise<void> => {
    try {
      dispatch({ type: 'SET_CONFIGURACION_NOTIFICACIONES', payload: config });
      
      // Reprogramar todas las notificaciones con la nueva configuración
      if (config.habilitadas) {
        await ServicioNotificaciones.reprogramarTodasLasNotificaciones(estado.boletas, config);
      } else {
        // Si se deshabilitaron, cancelar todas las notificaciones
        await ServicioNotificaciones.cancelarTodasLasNotificaciones();
      }
    } catch (error) {
      console.error('Error al configurar notificaciones:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al configurar las notificaciones' });
      throw error;
    }
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  // Crear usuario temporal si no existe
  useEffect(() => {
    if (!estado.usuario && !estado.boletasCargando) {
      const usuarioTemporal: UsuarioInterface = {
        id: `usuario_${Date.now()}`,
        nombre: 'Usuario',
        email: 'usuario@boletaia.app',
        fechaRegistro: new Date(),
        configuracionNotificaciones: {
          usuarioId: `usuario_${Date.now()}`,
          tresDiasAntes: true,
          unaSemanaAntes: true,
          elMismoDia: true,
          horaNotificacion: '09:00',
          habilitadas: true,
        },
      };
      
      dispatch({ type: 'SET_USUARIO', payload: usuarioTemporal });
      dispatch({ type: 'SET_CONFIGURACION_NOTIFICACIONES', payload: usuarioTemporal.configuracionNotificaciones });
    }
  }, [estado.usuario, estado.boletasCargando]);

  const valor = {
    ...estado,
    cargarBoletas,
    agregarBoleta,
    actualizarBoleta,
    marcarComoPagada,
    eliminarBoleta,
    configurarNotificaciones,
    setError,
  };

  return (
    <BoletasContext.Provider value={valor}>
      {children}
    </BoletasContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useBoletasContext() {
  const contexto = useContext(BoletasContext);
  if (contexto === undefined) {
    throw new Error('useBoletasContext debe ser usado dentro de un BoletasProvider');
  }
  return contexto;
}