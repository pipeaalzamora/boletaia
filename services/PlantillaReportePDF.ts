/**
 * PlantillaReportePDF - Servicio para generar plantillas HTML para reportes PDF
 * Incluye estilos CSS y estructura HTML optimizada para impresión
 */

import { DatosReporte, BoletaInterface, TipoCuenta, EstadoBoleta } from '../types';
import { UtilsBoleta } from '../utils/validaciones';
import { Colores } from '../constants/Colors';

export class PlantillaReportePDF {
  /**
   * Genera el HTML completo del reporte
   */
  static generarHTML(datos: DatosReporte): string {
    const estilos = this.obtenerEstilosCSS();
    const contenido = this.generarContenidoHTML(datos);
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Boletas - ${datos.configuracion.nombre}</title>
    <style>
        ${estilos}
    </style>
</head>
<body>
    ${contenido}
</body>
</html>`;
  }

  /**
   * Genera los estilos CSS optimizados para PDF
   */
  static obtenerEstilosCSS(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
            padding: 20px;
        }

        .encabezado {
            border-bottom: 3px solid ${Colores.naranja};
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .titulo-principal {
            font-size: 24px;
            font-weight: bold;
            color: ${Colores.naranja};
            margin-bottom: 8px;
        }

        .subtitulo {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
        }

        .info-reporte {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }

        .info-item {
            display: flex;
            flex-direction: column;
        }

        .info-label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            font-weight: 600;
        }

        .info-valor {
            font-size: 12px;
            font-weight: 600;
            color: #333;
            margin-top: 2px;
        }

        .resumen-ejecutivo {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }

        .resumen-titulo {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
        }

        .metricas-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }

        .metrica-card {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 15px;
            text-align: center;
        }

        .metrica-valor {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .metrica-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
        }

        .metrica-pagada { color: ${Colores.verde}; }
        .metrica-pendiente { color: ${Colores.naranja}; }
        .metrica-vencida { color: ${Colores.rojo}; }
        .metrica-total { color: #333; }

        .tabla-container {
            margin-bottom: 30px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
        }

        .tabla-titulo {
            background: ${Colores.naranja};
            color: white;
            padding: 15px;
            font-size: 14px;
            font-weight: bold;
        }

        .tabla {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }

        .tabla th,
        .tabla td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
            font-size: 11px;
        }

        .tabla th {
            background: #f8f9fa;
            font-weight: 600;
            color: #495057;
            text-transform: uppercase;
        }

        .tabla tr:nth-child(even) {
            background: #f8f9fa;
        }

        .tabla tr:hover {
            background: #e9ecef;
        }

        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .badge-pagada {
            background: ${Colores.verde}20;
            color: ${Colores.verde};
            border: 1px solid ${Colores.verde}40;
        }

        .badge-pendiente {
            background: ${Colores.naranja}20;
            color: ${Colores.naranja};
            border: 1px solid ${Colores.naranja}40;
        }

        .badge-vencida {
            background: ${Colores.rojo}20;
            color: ${Colores.rojo};
            border: 1px solid ${Colores.rojo}40;
        }

        .tipo-cuenta {
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .tipo-icono {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: inline-block;
        }

        .tipo-luz { background: #FFD700; }
        .tipo-agua { background: #4A90E2; }
        .tipo-gas { background: #FF6B35; }
        .tipo-internet { background: #7B68EE; }
        .tipo-internet-movil { background: #20B2AA; }
        .tipo-gastos-comunes { background: #32CD32; }

        .monto {
            font-weight: 600;
            text-align: right;
        }

        .monto-positivo { color: ${Colores.verde}; }
        .monto-negativo { color: ${Colores.rojo}; }

        .footer {
            border-top: 2px solid #dee2e6;
            padding-top: 20px;
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 10px;
        }

        .footer-info {
            margin-bottom: 10px;
        }

        @media print {
            body { padding: 10px; }
            .tabla-container { break-inside: avoid; }
            .resumen-ejecutivo { break-inside: avoid; }
        }

        @page {
            margin: 20mm;
            size: A4;
        }
    `;
  }

  /**
   * Genera el contenido HTML principal del reporte
   */
  static generarContenidoHTML(datos: DatosReporte): string {
    const encabezado = this.generarEncabezado(datos);
    const resumenEjecutivo = this.generarResumenEjecutivo(datos.resumen);
    const tablaBoletas = this.generarTablaBoletas(datos.boletas);
    const footer = this.generarFooter(datos.fechaGeneracion);

    return `
        ${encabezado}
        ${resumenEjecutivo}
        ${tablaBoletas}
        ${footer}
    `;
  }

  /**
   * Genera el encabezado del reporte
   */
  static generarEncabezado(datos: DatosReporte): string {
    const periodoTexto = this.generarTextoPeriodo(
      datos.configuracion.filtros.fechaInicio,
      datos.configuracion.filtros.fechaFin
    );

    return `
        <div class="encabezado">
            <h1 class="titulo-principal">Reporte de Boletas</h1>
            <p class="subtitulo">${datos.configuracion.nombre}</p>
            
            <div class="info-reporte">
                <div class="info-item">
                    <span class="info-label">Período</span>
                    <span class="info-valor">${periodoTexto}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Total Boletas</span>
                    <span class="info-valor">${datos.boletas.length}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha Generación</span>
                    <span class="info-valor">${UtilsBoleta.formatearFecha(datos.fechaGeneracion)}</span>
                </div>
            </div>
        </div>
    `;
  }

  /**
   * Genera el resumen ejecutivo con métricas principales
   */
  static generarResumenEjecutivo(resumen: any): string {
    return `
        <div class="resumen-ejecutivo">
            <h2 class="resumen-titulo">Resumen Ejecutivo</h2>
            
            <div class="metricas-grid">
                <div class="metrica-card">
                    <div class="metrica-valor metrica-total">
                        ${UtilsBoleta.formatearMonto(resumen.totalMonto)}
                    </div>
                    <div class="metrica-label">Monto Total</div>
                </div>
                
                <div class="metrica-card">
                    <div class="metrica-valor metrica-pagada">
                        ${UtilsBoleta.formatearMonto(resumen.montoPagado)}
                    </div>
                    <div class="metrica-label">Pagado (${resumen.boletasPagadas})</div>
                </div>
                
                <div class="metrica-card">
                    <div class="metrica-valor metrica-pendiente">
                        ${UtilsBoleta.formatearMonto(resumen.montoPendiente)}
                    </div>
                    <div class="metrica-label">Pendiente (${resumen.boletasPendientes})</div>
                </div>
                
                <div class="metrica-card">
                    <div class="metrica-valor metrica-vencida">
                        ${UtilsBoleta.formatearMonto(resumen.montoVencido || 0)}
                    </div>
                    <div class="metrica-label">Vencido (${resumen.boletasVencidas || 0})</div>
                </div>
                
                <div class="metrica-card">
                    <div class="metrica-valor metrica-total">
                        ${UtilsBoleta.formatearMonto(resumen.promedioMensual)}
                    </div>
                    <div class="metrica-label">Promedio Mensual</div>
                </div>
            </div>
        </div>
    `;
  }

  /**
   * Genera la tabla de boletas
   */
  static generarTablaBoletas(boletas: BoletaInterface[]): string {
    const filasBoletas = boletas.map(boleta => this.generarFilaBoleta(boleta)).join('');

    return `
        <div class="tabla-container">
            <div class="tabla-titulo">Detalle de Boletas</div>
            <table class="tabla">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Empresa</th>
                        <th>Monto</th>
                        <th>Emisión</th>
                        <th>Vencimiento</th>
                        <th>Estado</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasBoletas}
                </tbody>
            </table>
        </div>
    `;
  }

  /**
   * Genera una fila de la tabla para una boleta
   */
  static generarFilaBoleta(boleta: BoletaInterface): string {
    const estadoCalculado = UtilsBoleta.calcularEstadoBoleta(boleta);
    const colorTipo = this.obtenerClaseTipoCuenta(boleta.tipoCuenta);
    const badgeEstado = this.obtenerBadgeEstado(estadoCalculado.estado);

    return `
        <tr>
            <td>
                <div class="tipo-cuenta">
                    <span class="tipo-icono ${colorTipo}"></span>
                    ${boleta.tipoCuenta.replace('_', ' ').toUpperCase()}
                </div>
            </td>
            <td>${boleta.nombreEmpresa}</td>
            <td class="monto">${UtilsBoleta.formatearMonto(boleta.monto)}</td>
            <td>${UtilsBoleta.formatearFecha(new Date(boleta.fechaEmision))}</td>
            <td>${UtilsBoleta.formatearFecha(new Date(boleta.fechaVencimiento))}</td>
            <td>${badgeEstado}</td>
            <td>${boleta.descripcion || '-'}</td>
        </tr>
    `;
  }

  /**
   * Genera el footer del reporte
   */
  static generarFooter(fechaGeneracion: Date): string {
    return `
        <div class="footer">
            <div class="footer-info">
                Reporte generado el ${UtilsBoleta.formatearFecha(fechaGeneracion)} 
                a las ${fechaGeneracion.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div class="footer-info">
                BoletaIA - Sistema de Gestión de Boletas de Servicios Básicos
            </div>
        </div>
    `;
  }

  /**
   * Obtiene la clase CSS para el tipo de cuenta
   */
  static obtenerClaseTipoCuenta(tipo: TipoCuenta): string {
    switch (tipo) {
      case TipoCuenta.LUZ: return 'tipo-luz';
      case TipoCuenta.AGUA: return 'tipo-agua';
      case TipoCuenta.GAS: return 'tipo-gas';
      case TipoCuenta.INTERNET: return 'tipo-internet';
      case TipoCuenta.INTERNET_MOVIL: return 'tipo-internet-movil';
      case TipoCuenta.GASTOS_COMUNES: return 'tipo-gastos-comunes';
      default: return 'tipo-luz';
    }
  }

  /**
   * Obtiene el HTML del badge de estado
   */
  static obtenerBadgeEstado(estado: EstadoBoleta): string {
    let claseEstado = '';
    let textoEstado = '';

    switch (estado) {
      case EstadoBoleta.PAGADA:
        claseEstado = 'badge-pagada';
        textoEstado = 'Pagada';
        break;
      case EstadoBoleta.PENDIENTE:
        claseEstado = 'badge-pendiente';
        textoEstado = 'Pendiente';
        break;
      case EstadoBoleta.VENCIDA:
        claseEstado = 'badge-vencida';
        textoEstado = 'Vencida';
        break;
      default:
        claseEstado = 'badge-pendiente';
        textoEstado = 'Pendiente';
    }

    return `<span class="badge ${claseEstado}">${textoEstado}</span>`;
  }

  /**
   * Genera texto descriptivo del período
   */
  static generarTextoPeriodo(fechaInicio: Date, fechaFin: Date): string {
    const inicio = UtilsBoleta.formatearFecha(fechaInicio);
    const fin = UtilsBoleta.formatearFecha(fechaFin);
    return `${inicio} - ${fin}`;
  }
}