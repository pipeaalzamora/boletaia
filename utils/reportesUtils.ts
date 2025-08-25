/**
 * UtilsReportes - Utilidades para el sistema de reportes
 * Funciones auxiliares para procesamiento de datos y validaciones
 */

import {
  BoletaInterface,
  FiltrosReporte,
  ResumenReporte,
  ConfiguracionReporte,
  TipoCuenta,
  EstadoBoleta,
  RangoFechas,
} from '../types';
import { UtilsBoleta } from './validaciones';

export class UtilsReportes {
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
   * Valida configuración de reporte
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

  /**
   * Genera nombre de archivo único
   */
  static generarNombreArchivo(config: ConfiguracionReporte): string {
    const fecha = new Date().toISOString().split('T')[0];
    const nombreLimpio = config.nombre.replace(/[^a-zA-Z0-9]/g, '_');
    return `reporte_${nombreLimpio}_${fecha}.pdf`;
  }

  /**
   * Formatea el texto del período para mostrar
   */
  static formatearPeriodo(fechaInicio: Date, fechaFin: Date): string {
    const inicio = fechaInicio.toLocaleDateString('es-CL');
    const fin = fechaFin.toLocaleDateString('es-CL');
    return `${inicio} - ${fin}`;
  }

  /**
   * Calcula el porcentaje de un valor respecto al total
   */
  static calcularPorcentaje(valor: number, total: number): number {
    return total > 0 ? Math.round((valor / total) * 100) : 0;
  }

  /**
   * Obtiene lista única de empresas de las boletas
   */
  static obtenerEmpresasUnicas(boletas: BoletaInterface[]): string[] {
    const empresas = new Set(boletas.map(b => b.nombreEmpresa));
    return Array.from(empresas).sort();
  }

  /**
   * Genera ID único para reportes
   */
  static generarId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Formatea el tamaño de archivo en formato legible
   */
  static formatearTamañoArchivo(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}