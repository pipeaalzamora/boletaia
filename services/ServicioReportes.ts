/**
 * ServicioReportes - Servicio principal para generación y gestión de reportes PDF
 * Integra expo-print, expo-file-system y react-native-share
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import {
  BoletaInterface,
  ConfiguracionReporte,
  DatosReporte,
  EstadoBoleta,
  FiltrosReporte,
  RangoFechas,
  ReporteGuardado,
  ResumenReporte,
  TipoCuenta
} from '../types';
import { UtilsBoleta } from '../utils/validaciones';
import { PlantillaReportePDF } from './PlantillaReportePDF';

// Claves para AsyncStorage
const STORAGE_KEYS = {
  CONFIGURACIONES: '@boletaia_reportes_configuraciones',
  REPORTES_GENERADOS: '@boletaia_reportes_generados',
  PREFERENCIAS: '@boletaia_reportes_preferencias',
};

export class ServicioReportes {
  /**
   * Genera un reporte PDF completo
   */
  static async generarReporte(
    configuracion: ConfiguracionReporte,
    boletas: BoletaInterface[]
  ): Promise<string> {
    try {
      // Filtrar boletas según configuración
      const boletasFiltradas = this.filtrarBoletas(boletas, configuracion.filtros);
      
      // Generar resumen estadístico
      const resumen = this.generarResumen(boletasFiltradas);
      
      // Preparar datos del reporte
      const datosReporte: DatosReporte = {
        configuracion,
        boletas: boletasFiltradas,
        resumen,
        fechaGeneracion: new Date(),
      };
      
      // Generar HTML
      const html = PlantillaReportePDF.generarHTML(datosReporte);
      
      // Crear PDF
      const rutaArchivo = await this.crearPDF(html, configuracion.nombre);
      
      // Guardar referencia del reporte
      await this.guardarReporteGenerado({
        id: this.generarId(),
        nombre: configuracion.nombre,
        rutaArchivo,
        fechaGeneracion: new Date(),
        tamaño: await this.obtenerTamañoArchivo(rutaArchivo),
        configuracion,
      });
      
      return rutaArchivo;
    } catch (error) {
      console.error('Error al generar reporte:', error);
      throw new Error('No se pudo generar el reporte PDF');
    }
  }

  /**
   * Crea un archivo PDF desde HTML
   */
  static async crearPDF(html: string, nombreArchivo: string): Promise<string> {
    try {
      // Limpiar nombre de archivo
      const nombreLimpio = nombreArchivo.replace(/[^a-zA-Z0-9\s]/g, '_');
      const timestamp = new Date().toISOString().slice(0, 10);
      const nombreFinal = `reporte_${nombreLimpio}_${timestamp}.pdf`;
      
      // Verificar espacio disponible
      const espacioLibre = await FileSystem.getFreeDiskStorageAsync();
      if (espacioLibre < 10 * 1024 * 1024) { // Mínimo 10MB
        throw new Error('No hay suficiente espacio disponible');
      }
      
      // Crear directorio si no existe
      const directorioReportes = FileSystem.documentDirectory + 'reportes/';
      const infoDirectorio = await FileSystem.getInfoAsync(directorioReportes);
      if (!infoDirectorio.exists) {
        await FileSystem.makeDirectoryAsync(directorioReportes, { intermediates: true });
      }
      
      // Generar PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        width: 612, // Ancho de página A4 en puntos
        height: 792, // Alto de página A4 en puntos
      });
      
      // Mover archivo a directorio permanente
      const rutaFinal = directorioReportes + nombreFinal;
      await FileSystem.moveAsync({
        from: uri,
        to: rutaFinal,
      });
      
      return rutaFinal;
    } catch (error) {
      console.error('Error al crear PDF:', error);
      throw error;
    }
  }

  /**
   * Comparte un archivo PDF
   */
  static async compartirReporte(rutaArchivo: string): Promise<void> {
    try {
      const infoArchivo = await FileSystem.getInfoAsync(rutaArchivo);
      if (!infoArchivo.exists) {
        throw new Error('El archivo no existe');
      }
      
      const puedeCompartir = await Sharing.isAvailableAsync();
      if (!puedeCompartir) {
        throw new Error('La función de compartir no está disponible');
      }
      
      await Sharing.shareAsync(rutaArchivo, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir Reporte de Boletas',
      });
    } catch (error) {
      console.error('Error al compartir reporte:', error);
      throw error;
    }
  }

  /**
   * Filtra boletas según criterios específicos
   */
  static filtrarBoletas(
    boletas: BoletaInterface[], 
    filtros: FiltrosReporte
  ): BoletaInterface[] {
    return boletas.filter(boleta => {
      // Filtro por fecha
      const fechaEmision = new Date(boleta.fechaEmision);
      if (fechaEmision < filtros.fechaInicio || fechaEmision > filtros.fechaFin) {
        return false;
      }
      
      // Filtro por tipo de cuenta
      if (filtros.tiposCuenta.length > 0 && !filtros.tiposCuenta.includes(boleta.tipoCuenta)) {
        return false;
      }
      
      // Filtro por estado
      if (filtros.estados.length > 0) {
        const estadoBoleta = UtilsBoleta.calcularEstadoBoleta(boleta).estado;
        if (!filtros.estados.includes(estadoBoleta)) {
          return false;
        }
      }
      
      // Filtro por empresas
      if (filtros.empresas.length > 0 && !filtros.empresas.includes(boleta.nombreEmpresa)) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Genera resumen estadístico de boletas
   */
  static generarResumen(boletas: BoletaInterface[]): ResumenReporte {
    const totalBoletas = boletas.length;
    const boletasPagadas = boletas.filter(b => b.estaPagada).length;
    const boletasPendientes = totalBoletas - boletasPagadas;
    
    // Calcular boletas vencidas
    const boletasVencidas = boletas.filter(b => {
      if (b.estaPagada) return false;
      const estado = UtilsBoleta.calcularEstadoBoleta(b).estado;
      return estado === EstadoBoleta.VENCIDA;
    }).length;
    
    const totalMonto = boletas.reduce((sum, b) => sum + b.monto, 0);
    const montoPagado = boletas.filter(b => b.estaPagada).reduce((sum, b) => sum + b.monto, 0);
    const montoPendiente = totalMonto - montoPagado;
    const montoVencido = boletas.filter(b => {
      if (b.estaPagada) return false;
      const estado = UtilsBoleta.calcularEstadoBoleta(b).estado;
      return estado === EstadoBoleta.VENCIDA;
    }).reduce((sum, b) => sum + b.monto, 0);
    
    // Calcular promedio mensual
    const mesesUnicos = new Set(
      boletas.map(b => {
        const fecha = new Date(b.fechaEmision);
        return `${fecha.getFullYear()}-${fecha.getMonth()}`;
      })
    ).size;
    const promedioMensual = mesesUnicos > 0 ? totalMonto / mesesUnicos : 0;
    
    // Distribución por tipo de cuenta
    const distribuccionPorTipo = boletas.reduce((acc, boleta) => {
      acc[boleta.tipoCuenta] = (acc[boleta.tipoCuenta] || 0) + boleta.monto;
      return acc;
    }, {} as Record<TipoCuenta, number>);
    
    // Distribución por empresa
    const distribuccionPorEmpresa = boletas.reduce((acc, boleta) => {
      acc[boleta.nombreEmpresa] = (acc[boleta.nombreEmpresa] || 0) + boleta.monto;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalBoletas,
      totalMonto,
      boletasPagadas,
      montoPagado,
      boletasPendientes,
      montoPendiente,
      boletasVencidas,
      montoVencido,
      promedioMensual,
      distribuccionPorTipo,
      distribuccionPorEmpresa,
    };
  }

  /**
   * Genera filtros predefinidos según rango de fechas
   */
  static generarFiltrosPorRango(rango: RangoFechas): { fechaInicio: Date; fechaFin: Date } {
    const hoy = new Date();
    const fechaFin = new Date(hoy);
    let fechaInicio = new Date(hoy);
    
    switch (rango) {
      case RangoFechas.ULTIMO_MES:
        fechaInicio.setMonth(hoy.getMonth() - 1);
        break;
      case RangoFechas.ULTIMOS_TRES_MESES:
        fechaInicio.setMonth(hoy.getMonth() - 3);
        break;
      case RangoFechas.ULTIMO_SEMESTRE:
        fechaInicio.setMonth(hoy.getMonth() - 6);
        break;
      case RangoFechas.ULTIMO_ANO:
        fechaInicio.setFullYear(hoy.getFullYear() - 1);
        break;
      default:
        // Para personalizado, no modificar las fechas
        break;
    }
    
    return { fechaInicio, fechaFin };
  }

  /**
   * Guardar configuración de reporte
   */
  static async guardarConfiguracion(configuracion: ConfiguracionReporte): Promise<void> {
    try {
      const configuracionesExistentes = await this.cargarConfiguraciones();
      const nuevasConfiguraciones = [
        ...configuracionesExistentes.filter(c => c.id !== configuracion.id),
        configuracion
      ];
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.CONFIGURACIONES,
        JSON.stringify(nuevasConfiguraciones)
      );
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      throw error;
    }
  }

  /**
   * Cargar configuraciones guardadas
   */
  static async cargarConfiguraciones(): Promise<ConfiguracionReporte[]> {
    try {
      const datos = await AsyncStorage.getItem(STORAGE_KEYS.CONFIGURACIONES);
      if (!datos) return [];
      
      const configuraciones = JSON.parse(datos);
      // Convertir strings de fecha a objetos Date
      return configuraciones.map((config: any) => ({
        ...config,
        fechaCreacion: new Date(config.fechaCreacion),
        fechaActualizacion: new Date(config.fechaActualizacion),
        filtros: {
          ...config.filtros,
          fechaInicio: new Date(config.filtros.fechaInicio),
          fechaFin: new Date(config.filtros.fechaFin),
        },
      }));
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
      return [];
    }
  }

  /**
   * Eliminar configuración
   */
  static async eliminarConfiguracion(id: string): Promise<void> {
    try {
      const configuraciones = await this.cargarConfiguraciones();
      const nuevasConfiguraciones = configuraciones.filter(c => c.id !== id);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.CONFIGURACIONES,
        JSON.stringify(nuevasConfiguraciones)
      );
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
      throw error;
    }
  }

  /**
   * Guardar referencia de reporte generado
   */
  static async guardarReporteGenerado(reporte: ReporteGuardado): Promise<void> {
    try {
      const reportesExistentes = await this.cargarReportesGenerados();
      const nuevosReportes = [...reportesExistentes, reporte];
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.REPORTES_GENERADOS,
        JSON.stringify(nuevosReportes)
      );
    } catch (error) {
      console.error('Error al guardar reporte:', error);
      throw error;
    }
  }

  /**
   * Cargar reportes generados
   */
  static async cargarReportesGenerados(): Promise<ReporteGuardado[]> {
    try {
      const datos = await AsyncStorage.getItem(STORAGE_KEYS.REPORTES_GENERADOS);
      if (!datos) return [];
      
      const reportes = JSON.parse(datos);
      // Convertir strings de fecha a objetos Date
      return reportes.map((reporte: any) => ({
        ...reporte,
        fechaGeneracion: new Date(reporte.fechaGeneracion),
        configuracion: {
          ...reporte.configuracion,
          fechaCreacion: new Date(reporte.configuracion.fechaCreacion),
          fechaActualizacion: new Date(reporte.configuracion.fechaActualizacion),
          filtros: {
            ...reporte.configuracion.filtros,
            fechaInicio: new Date(reporte.configuracion.filtros.fechaInicio),
            fechaFin: new Date(reporte.configuracion.filtros.fechaFin),
          },
        },
      }));
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      return [];
    }
  }

  /**
   * Eliminar reporte
   */
  static async eliminarReporte(id: string): Promise<void> {
    try {
      const reportes = await this.cargarReportesGenerados();
      const reporte = reportes.find(r => r.id === id);
      
      if (reporte) {
        // Eliminar archivo físico
        const infoArchivo = await FileSystem.getInfoAsync(reporte.rutaArchivo);
        if (infoArchivo.exists) {
          await FileSystem.deleteAsync(reporte.rutaArchivo);
        }
        
        // Eliminar de la lista
        const nuevosReportes = reportes.filter(r => r.id !== id);
        await AsyncStorage.setItem(
          STORAGE_KEYS.REPORTES_GENERADOS,
          JSON.stringify(nuevosReportes)
        );
      }
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      throw error;
    }
  }

  /**
   * Limpiar reportes expirados (más de 30 días)
   */
  static async limpiarReportesExpirados(): Promise<void> {
    try {
      const reportes = await this.cargarReportesGenerados();
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      
      const reportesValidos = [];
      
      for (const reporte of reportes) {
        const fechaGeneracion = new Date(reporte.fechaGeneracion);
        if (fechaGeneracion >= hace30Dias) {
          reportesValidos.push(reporte);
        } else {
          // Eliminar archivo expirado
          try {
            const infoArchivo = await FileSystem.getInfoAsync(reporte.rutaArchivo);
            if (infoArchivo.exists) {
              await FileSystem.deleteAsync(reporte.rutaArchivo);
            }
          } catch (error) {
            console.warn('No se pudo eliminar archivo:', reporte.rutaArchivo);
          }
        }
      }
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.REPORTES_GENERADOS,
        JSON.stringify(reportesValidos)
      );
    } catch (error) {
      console.error('Error al limpiar reportes expirados:', error);
    }
  }

  /**
   * Obtener tamaño de archivo
   */
  static async obtenerTamañoArchivo(rutaArchivo: string): Promise<number> {
    try {
      const info = await FileSystem.getInfoAsync(rutaArchivo);
      if (info.exists && 'size' in info) {
        return (info as any).size || 0;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Generar ID único
   */
  static generarId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Validar configuración de reporte
   */
  static validarConfiguracion(config: ConfiguracionReporte): string[] {
    const errores: string[] = [];
    
    if (!config.nombre.trim()) {
      errores.push('El nombre del reporte es requerido');
    }
    
    if (config.filtros.fechaInicio > config.filtros.fechaFin) {
      errores.push('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    
    const rangoMeses = (config.filtros.fechaFin.getTime() - config.filtros.fechaInicio.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (rangoMeses > 24) {
      errores.push('El rango de fechas no puede exceder 2 años');
    }
    
    return errores;
  }
}