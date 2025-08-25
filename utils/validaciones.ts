/**
 * Utilidades de validación para BoletaIA
 * Validaciones de lógica de negocio para fechas, montos y formularios
 */

import { differenceInDays, format, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { Colores } from '../constants/Colors';
import {
  BoletaInterface,
  DatosFormularioBoleta,
  ErroresValidacion,
  EstadoBoleta,
  EstadoBoletaCalculado,
  NuevaBoleta,
  TipoCuenta,
} from '../types';

export class ValidadorBoleta {
  /**
   * Valida las fechas de una boleta
   */
  static validarFechas(boleta: Partial<NuevaBoleta>): ErroresValidacion {
    const errores: ErroresValidacion = {};
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (!boleta.fechaEmision) {
      errores.fechaEmision = 'La fecha de emisión es requerida';
    } else {
      const fechaEmision = new Date(boleta.fechaEmision);
      
      // La fecha de emisión no puede ser más de 3 meses en el futuro
      const treseMesesFuturo = new Date();
      treseMesesFuturo.setMonth(treseMesesFuturo.getMonth() + 3);
      
      if (isAfter(fechaEmision, treseMesesFuturo)) {
        errores.fechaEmision = 'La fecha de emisión no puede ser más de 3 meses en el futuro';
      }
    }

    if (!boleta.fechaVencimiento) {
      errores.fechaVencimiento = 'La fecha de vencimiento es requerida';
    } else if (boleta.fechaEmision) {
      const fechaEmision = new Date(boleta.fechaEmision);
      const fechaVencimiento = new Date(boleta.fechaVencimiento);
      
      if (!isAfter(fechaVencimiento, fechaEmision)) {
        errores.fechaVencimiento = 'La fecha de vencimiento debe ser posterior a la fecha de emisión';
      }

      // El vencimiento no puede ser más de 6 meses desde la emisión
      const seiseMesesDespues = new Date(fechaEmision);
      seiseMesesDespues.setMonth(seiseMesesDespues.getMonth() + 6);
      
      if (isAfter(fechaVencimiento, seiseMesesDespues)) {
        errores.fechaVencimiento = 'El vencimiento no puede ser más de 6 meses después de la emisión';
      }
    }

    if (!boleta.fechaCorte) {
      errores.fechaCorte = 'La fecha de corte es requerida';
    } else if (boleta.fechaVencimiento) {
      const fechaCorte = new Date(boleta.fechaCorte);
      const fechaVencimiento = new Date(boleta.fechaVencimiento);
      
      if (!isAfter(fechaCorte, fechaVencimiento)) {
        errores.fechaCorte = 'La fecha de corte debe ser posterior a la fecha de vencimiento';
      }
    }

    if (!boleta.fechaProximaLectura) {
      errores.fechaProximaLectura = 'La fecha de próxima lectura es requerida';
    } else if (boleta.fechaVencimiento) {
      const fechaProximaLectura = new Date(boleta.fechaProximaLectura);
      const fechaVencimiento = new Date(boleta.fechaVencimiento);
      
      if (!isAfter(fechaProximaLectura, fechaVencimiento)) {
        errores.fechaProximaLectura = 'La próxima lectura debe ser posterior al vencimiento';
      }
    }

    return errores;
  }

  /**
   * Valida el monto de una boleta
   */
  static validarMonto(monto: number | string): string | null {
    const montoNumerico = typeof monto === 'string' ? parseFloat(monto) : monto;
    
    if (isNaN(montoNumerico)) {
      return 'El monto debe ser un número válido';
    }
    
    if (montoNumerico <= 0) {
      return 'El monto debe ser mayor a 0';
    }
    
    if (montoNumerico > 10000000) {
      return 'El monto no puede ser mayor a $10,000,000';
    }
    
    // Validar que tenga máximo 2 decimales
    const decimales = montoNumerico.toString().split('.')[1];
    if (decimales && decimales.length > 2) {
      return 'El monto no puede tener más de 2 decimales';
    }
    
    return null;
  }

  /**
   * Valida el nombre de la empresa
   */
  static validarNombreEmpresa(nombre: string): string | null {
    if (!nombre || nombre.trim().length === 0) {
      return 'El nombre de la empresa es requerido';
    }
    
    if (nombre.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (nombre.length > 100) {
      return 'El nombre no puede tener más de 100 caracteres';
    }
    
    return null;
  }

  /**
   * Valida la descripción (opcional)
   */
  static validarDescripcion(descripcion: string): string | null {
    if (descripcion && descripcion.length > 500) {
      return 'La descripción no puede tener más de 500 caracteres';
    }
    
    return null;
  }

  /**
   * Valida un formulario completo de boleta
   */
  static validarFormularioBoleta(datos: DatosFormularioBoleta): ErroresValidacion {
    const errores: ErroresValidacion = {};

    // Validar tipo de cuenta
    if (!datos.tipoCuenta || datos.tipoCuenta.trim() === '') {
      errores.tipoCuenta = 'Debe seleccionar un tipo de cuenta';
    }

    // Validar nombre de empresa
    const errorNombre = this.validarNombreEmpresa(datos.nombreEmpresa);
    if (errorNombre) {
      errores.nombreEmpresa = errorNombre;
    }

    // Validar monto
    const errorMonto = this.validarMonto(datos.monto);
    if (errorMonto) {
      errores.monto = errorMonto;
    }

    // Validar descripción
    const errorDescripcion = this.validarDescripcion(datos.descripcion);
    if (errorDescripcion) {
      errores.descripcion = errorDescripcion;
    }

    // Validar fechas
    const boletaParcial: Partial<NuevaBoleta> = {};
    
    if (datos.fechaEmision) {
      boletaParcial.fechaEmision = new Date(datos.fechaEmision);
    }
    if (datos.fechaVencimiento) {
      boletaParcial.fechaVencimiento = new Date(datos.fechaVencimiento);
    }
    if (datos.fechaCorte) {
      boletaParcial.fechaCorte = new Date(datos.fechaCorte);
    }
    if (datos.fechaProximaLectura) {
      boletaParcial.fechaProximaLectura = new Date(datos.fechaProximaLectura);
    }

    const erroresFechas = this.validarFechas(boletaParcial);
    return { ...errores, ...erroresFechas };
  }
}

export class UtilsBoleta {
  /**
   * Calcula el estado de una boleta basado en fechas
   */
  static calcularEstadoBoleta(boleta: BoletaInterface): EstadoBoletaCalculado {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaVencimiento = new Date(boleta.fechaVencimiento);
    fechaVencimiento.setHours(0, 0, 0, 0);
    
    const diasRestantes = differenceInDays(fechaVencimiento, hoy);

    if (boleta.estaPagada) {
      return {
        estado: EstadoBoleta.PAGADA,
        diasRestantes,
        colorEstado: Colores.verde,
        textoEstado: 'Pagada',
      };
    }

    if (diasRestantes < 0) {
      return {
        estado: EstadoBoleta.VENCIDA,
        diasRestantes,
        colorEstado: Colores.rojo,
        textoEstado: 'Vencida',
      };
    }

    if (diasRestantes <= 3) {
      return {
        estado: EstadoBoleta.PROXIMA,
        diasRestantes,
        colorEstado: Colores.proximo,
        textoEstado: 'Próxima a vencer',
      };
    }

    return {
      estado: EstadoBoleta.PENDIENTE,
      diasRestantes,
      colorEstado: Colores.naranja,
      textoEstado: 'Pendiente',
    };
  }

  /**
   * Formatea un monto en pesos chilenos
   */
  static formatearMonto(monto: number): string {
    // Primero intentamos con formato CLP nativo
    try {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(monto);
    } catch (error) {
      // Fallback si no funciona el formato nativo
      const montoFormateado = new Intl.NumberFormat('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(monto);
      return `$${montoFormateado} CLP`;
    }
  }

  /**
   * Formatea una fecha en español
   */
  static formatearFecha(fecha: Date, formato: string = 'dd/MM/yyyy'): string {
    return format(fecha, formato, { locale: es });
  }

  /**
   * Obtiene el texto descriptivo para días restantes
   */
  static obtenerTextoTiempoRestante(diasRestantes: number): string {
    if (diasRestantes < 0) {
      const diasVencidos = Math.abs(diasRestantes);
      return diasVencidos === 1 
        ? 'Vencida hace 1 día' 
        : `Vencida hace ${diasVencidos} días`;
    }
    
    if (diasRestantes === 0) {
      return 'Vence hoy';
    }
    
    if (diasRestantes === 1) {
      return 'Vence mañana';
    }
    
    return `Vence en ${diasRestantes} días`;
  }

  /**
   * Convierte datos del formulario a objeto NuevaBoleta
   */
  static convertirFormularioABoleta(datos: DatosFormularioBoleta): NuevaBoleta {
    return {
      tipoCuenta: datos.tipoCuenta as TipoCuenta,
      nombreEmpresa: datos.nombreEmpresa.trim(),
      monto: parseFloat(datos.monto),
      fechaEmision: new Date(datos.fechaEmision),
      fechaVencimiento: new Date(datos.fechaVencimiento),
      fechaCorte: new Date(datos.fechaCorte),
      fechaProximaLectura: new Date(datos.fechaProximaLectura),
      descripcion: datos.descripcion.trim(),
    };
  }

  /**
   * Convierte una boleta a datos de formulario
   */
  static convertirBoletaAFormulario(boleta: BoletaInterface): DatosFormularioBoleta {
    return {
      tipoCuenta: boleta.tipoCuenta,
      nombreEmpresa: boleta.nombreEmpresa,
      monto: boleta.monto.toString(),
      fechaEmision: format(new Date(boleta.fechaEmision), 'yyyy-MM-dd'),
      fechaVencimiento: format(new Date(boleta.fechaVencimiento), 'yyyy-MM-dd'),
      fechaCorte: format(new Date(boleta.fechaCorte), 'yyyy-MM-dd'),
      fechaProximaLectura: format(new Date(boleta.fechaProximaLectura), 'yyyy-MM-dd'),
      descripcion: boleta.descripcion,
    };
  }

  /**
   * Obtiene el color de icono según el tipo de cuenta
   */
  static obtenerColorTipoCuenta(tipo: TipoCuenta): string {
    const colores = {
      [TipoCuenta.LUZ]: '#FFD700',
      [TipoCuenta.AGUA]: '#00BFFF',
      [TipoCuenta.GAS]: '#FF6347',
      [TipoCuenta.INTERNET]: '#9370DB',
      [TipoCuenta.INTERNET_MOVIL]: '#32CD32',
      [TipoCuenta.GASTOS_COMUNES]: '#FFA500',
    };
    
    return colores[tipo] || Colores.naranja;
  }

  /**
   * Obtiene el icono según el tipo de cuenta
   */
  static obtenerIconoTipoCuenta(tipo: TipoCuenta): string {
    const iconos = {
      [TipoCuenta.LUZ]: 'flash',
      [TipoCuenta.AGUA]: 'water',
      [TipoCuenta.GAS]: 'flame',
      [TipoCuenta.INTERNET]: 'wifi',
      [TipoCuenta.INTERNET_MOVIL]: 'phone-portrait',
      [TipoCuenta.GASTOS_COMUNES]: 'home',
    };
    
    return iconos[tipo] || 'document-text';
  }
}