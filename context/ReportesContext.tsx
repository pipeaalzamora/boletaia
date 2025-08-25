/**
 * ReportesContext - Contexto para gestión de estado de reportes
 * Maneja generación, almacenamiento y filtrado de reportes PDF
 */

import React, { createContext, useContext, useEffect, useReducer } from 'react';

import { ServicioReportes } from '../services/ServicioReportes';
import {
    AccionesReportesContexto,
    ConfiguracionReporte,
    EstadoBoleta,
    EstadoReportesContexto,
    FiltrosReporte,
    RangoFechas,
    ReporteGuardado,
    TipoCuenta,
} from '../types';
import { useBoletasContext } from './BoletasContext';

// Estado inicial
const estadoInicial: EstadoReportesContexto = {
  reportesGenerados: [],
  configuracionesGuardadas: [],
  cargandoReporte: false,
  errorReporte: null,
  filtrosActivos: {
    fechaInicio: (() => {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - 1);
      return fecha;
    })(),
    fechaFin: new Date(),
    tiposCuenta: Object.values(TipoCuenta),
    estados: Object.values(EstadoBoleta),
    empresas: [],
    rangoFechas: RangoFechas.ULTIMO_MES,
  },
};

// Tipos de acciones
type AccionReportes =
  | { tipo: 'SET_CARGANDO'; payload: boolean }
  | { tipo: 'SET_ERROR'; payload: string | null }
  | { tipo: 'SET_REPORTES_GENERADOS'; payload: ReporteGuardado[] }
  | { tipo: 'SET_CONFIGURACIONES'; payload: ConfiguracionReporte[] }
  | { tipo: 'SET_FILTROS_ACTIVOS'; payload: FiltrosReporte }
  | { tipo: 'AGREGAR_REPORTE'; payload: ReporteGuardado }
  | { tipo: 'ELIMINAR_REPORTE'; payload: string }
  | { tipo: 'AGREGAR_CONFIGURACION'; payload: ConfiguracionReporte }
  | { tipo: 'ELIMINAR_CONFIGURACION'; payload: string }
  | { tipo: 'LIMPIAR_FILTROS' };

// Reducer
function reportesReducer(
  estado: EstadoReportesContexto,
  accion: AccionReportes
): EstadoReportesContexto {
  switch (accion.tipo) {
    case 'SET_CARGANDO':
      return { ...estado, cargandoReporte: accion.payload };

    case 'SET_ERROR':
      return { ...estado, errorReporte: accion.payload };

    case 'SET_REPORTES_GENERADOS':
      return { ...estado, reportesGenerados: accion.payload };

    case 'SET_CONFIGURACIONES':
      return { ...estado, configuracionesGuardadas: accion.payload };

    case 'SET_FILTROS_ACTIVOS':
      return { ...estado, filtrosActivos: accion.payload };

    case 'AGREGAR_REPORTE':
      return {
        ...estado,
        reportesGenerados: [...estado.reportesGenerados, accion.payload],
      };

    case 'ELIMINAR_REPORTE':
      return {
        ...estado,
        reportesGenerados: estado.reportesGenerados.filter(
          r => r.id !== accion.payload
        ),
      };

    case 'AGREGAR_CONFIGURACION':
      return {
        ...estado,
        configuracionesGuardadas: [
          ...estado.configuracionesGuardadas.filter(
            c => c.id !== accion.payload.id
          ),
          accion.payload,
        ],
      };

    case 'ELIMINAR_CONFIGURACION':
      return {
        ...estado,
        configuracionesGuardadas: estado.configuracionesGuardadas.filter(
          c => c.id !== accion.payload
        ),
      };

    case 'LIMPIAR_FILTROS':
      const fechaFin = new Date();
      const fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - 1);
      
      return {
        ...estado,
        filtrosActivos: {
          ...estadoInicial.filtrosActivos,
          fechaInicio,
          fechaFin,
        },
      };

    default:
      return estado;
  }
}

// Contexto
const ReportesContext = createContext<
  (EstadoReportesContexto & AccionesReportesContexto) | undefined
>(undefined);

// Hook personalizado
export function useReportesContext() {
  const contexto = useContext(ReportesContext);
  if (contexto === undefined) {
    throw new Error('useReportesContext debe ser usado dentro de ReportesProvider');
  }
  return contexto;
}

// Provider
interface ReportesProviderProps {
  children: React.ReactNode;
}

export function ReportesProvider({ children }: ReportesProviderProps) {
  const [estado, dispatch] = useReducer(reportesReducer, estadoInicial);
  const { boletas } = useBoletasContext();

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
    limpiarReportesExpirados();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      dispatch({ tipo: 'SET_CARGANDO', payload: true });
      
      const [reportes, configuraciones] = await Promise.all([
        ServicioReportes.cargarReportesGenerados(),
        ServicioReportes.cargarConfiguraciones(),
      ]);
      
      dispatch({ tipo: 'SET_REPORTES_GENERADOS', payload: reportes });
      dispatch({ tipo: 'SET_CONFIGURACIONES', payload: configuraciones });
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      dispatch({ 
        tipo: 'SET_ERROR', 
        payload: 'Error al cargar datos de reportes' 
      });
    } finally {
      dispatch({ tipo: 'SET_CARGANDO', payload: false });
    }
  };

  const limpiarReportesExpirados = async () => {
    try {
      await ServicioReportes.limpiarReportesExpirados();
    } catch (error) {
      console.warn('Error al limpiar reportes expirados:', error);
    }
  };

  /**
   * Genera un nuevo reporte PDF
   */
  const generarReporte = async (configuracion: ConfiguracionReporte): Promise<string> => {
    try {
      dispatch({ tipo: 'SET_CARGANDO', payload: true });
      dispatch({ tipo: 'SET_ERROR', payload: null });

      // Validar configuración
      const errores = ServicioReportes.validarConfiguracion(configuracion);
      if (errores.length > 0) {
        throw new Error(errores.join(', '));
      }

      // Generar reporte
      const rutaArchivo = await ServicioReportes.generarReporte(configuracion, boletas);
      
      // Recargar lista de reportes
      const reportesActualizados = await ServicioReportes.cargarReportesGenerados();
      dispatch({ tipo: 'SET_REPORTES_GENERADOS', payload: reportesActualizados });

      return rutaArchivo;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al generar reporte';
      dispatch({ tipo: 'SET_ERROR', payload: mensaje });
      throw error;
    } finally {
      dispatch({ tipo: 'SET_CARGANDO', payload: false });
    }
  };

  /**
   * Guarda una configuración de reporte
   */
  const guardarConfiguracion = async (configuracion: ConfiguracionReporte): Promise<void> => {
    try {
      await ServicioReportes.guardarConfiguracion(configuracion);
      dispatch({ tipo: 'AGREGAR_CONFIGURACION', payload: configuracion });
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      throw new Error('No se pudo guardar la configuración');
    }
  };

  /**
   * Carga todas las configuraciones guardadas
   */
  const cargarConfiguraciones = async (): Promise<void> => {
    try {
      const configuraciones = await ServicioReportes.cargarConfiguraciones();
      dispatch({ tipo: 'SET_CONFIGURACIONES', payload: configuraciones });
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
      throw new Error('No se pudieron cargar las configuraciones');
    }
  };

  /**
   * Elimina una configuración guardada
   */
  const eliminarConfiguracion = async (id: string): Promise<void> => {
    try {
      await ServicioReportes.eliminarConfiguracion(id);
      dispatch({ tipo: 'ELIMINAR_CONFIGURACION', payload: id });
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
      throw new Error('No se pudo eliminar la configuración');
    }
  };

  /**
   * Aplica filtros de búsqueda
   */
  const aplicarFiltros = (filtros: FiltrosReporte): void => {
    // Actualizar fechas si el rango cambió
    if (filtros.rangoFechas !== estado.filtrosActivos.rangoFechas) {
      const { fechaInicio, fechaFin } = ServicioReportes.generarFiltrosPorRango(filtros.rangoFechas);
      if (filtros.rangoFechas !== RangoFechas.PERSONALIZADO) {
        filtros = { ...filtros, fechaInicio, fechaFin };
      }
    }

    dispatch({ tipo: 'SET_FILTROS_ACTIVOS', payload: filtros });
  };

  /**
   * Limpia todos los filtros
   */
  const limpiarFiltros = (): void => {
    dispatch({ tipo: 'LIMPIAR_FILTROS' });
  };

  /**
   * Comparte un reporte
   */
  const compartirReporte = async (rutaArchivo: string): Promise<void> => {
    try {
      await ServicioReportes.compartirReporte(rutaArchivo);
    } catch (error) {
      console.error('Error al compartir reporte:', error);
      throw new Error('No se pudo compartir el reporte');
    }
  };

  /**
   * Elimina un reporte
   */
  const eliminarReporte = async (id: string): Promise<void> => {
    try {
      await ServicioReportes.eliminarReporte(id);
      dispatch({ tipo: 'ELIMINAR_REPORTE', payload: id });
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      throw new Error('No se pudo eliminar el reporte');
    }
  };

  /**
   * Establece un error
   */
  const setError = (error: string | null): void => {
    dispatch({ tipo: 'SET_ERROR', payload: error });
  };

  /**
   * Genera una configuración rápida basada en filtros actuales
   */
  const generarConfiguracionRapida = (): ConfiguracionReporte => {
    const ahora = new Date();
    const id = `config_${Date.now()}`;
    
    return {
      id,
      nombre: `Reporte ${ahora.toLocaleDateString('es-CL')}`,
      descripcion: 'Reporte generado automáticamente',
      filtros: estado.filtrosActivos,
      incluirGraficos: false,
      incluirResumen: true,
      formatoFecha: 'dd/mm/yyyy',
      formatoMoneda: 'CLP',
      fechaCreacion: ahora,
      fechaActualizacion: ahora,
    };
  };

  /**
   * Obtiene resumen de boletas filtradas
   */
  const obtenerResumenFiltrado = () => {
    const boletasFiltradas = ServicioReportes.filtrarBoletas(boletas, estado.filtrosActivos);
    return ServicioReportes.generarResumen(boletasFiltradas);
  };

  const valorContexto = {
    ...estado,
    generarReporte,
    guardarConfiguracion,
    cargarConfiguraciones,
    eliminarConfiguracion,
    aplicarFiltros,
    limpiarFiltros,
    compartirReporte,
    eliminarReporte,
    setError,
    // Funciones adicionales útiles
    generarConfiguracionRapida,
    obtenerResumenFiltrado,
  };

  return (
    <ReportesContext.Provider value={valorContexto}>
      {children}
    </ReportesContext.Provider>
  );
}