/**
 * Interfaces y tipos TypeScript para BoletaIA
 * Definiciones completas para la gestión de boletas de servicios básicos
 */

// Enumeraciones
export enum TipoCuenta {
  LUZ = 'luz',
  AGUA = 'agua',
  GAS = 'gas',
  INTERNET = 'internet',
  INTERNET_MOVIL = 'internet_movil',
  GASTOS_COMUNES = 'gastos_comunes',
}

export enum EstadoBoleta {
  PENDIENTE = 'pendiente',
  PAGADA = 'pagada',
  VENCIDA = 'vencida',
  PROXIMA = 'proxima',
}

export enum TipoNotificacion {
  TRES_DIAS_ANTES = 'tres_dias_antes',
  UNA_SEMANA_ANTES = 'una_semana_antes',
  EL_MISMO_DIA = 'mismo_dia',
}

// Interfaces principales
export interface BoletaInterface {
  id: string;
  usuarioId: string;
  tipoCuenta: TipoCuenta;
  nombreEmpresa: string;
  monto: number;
  fechaEmision: Date;
  fechaVencimiento: Date;
  fechaCorte: Date;
  fechaProximaLectura: Date;
  descripcion: string;
  estaPagada: boolean;
  fechaPago?: Date;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface UsuarioInterface {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  fechaRegistro: Date;
  configuracionNotificaciones: ConfiguracionNotificaciones;
}

export interface ConfiguracionNotificaciones {
  usuarioId: string;
  tresDiasAntes: boolean;
  unaSemanaAntes: boolean;
  elMismoDia: boolean;
  horaNotificacion: string; // Formato HH:mm
  habilitadas: boolean;
}

export interface NotificacionInterface {
  id: string;
  boletaId: string;
  usuarioId: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fechaProgramada: Date;
  enviada: boolean;
  fechaEnvio?: Date;
}

// Tipos para formularios
export interface NuevaBoleta {
  tipoCuenta: TipoCuenta;
  nombreEmpresa: string;
  monto: number;
  fechaEmision: Date;
  fechaVencimiento: Date;
  fechaCorte: Date;
  fechaProximaLectura: Date;
  descripcion: string;
}

export interface ActualizacionBoleta {
  nombreEmpresa?: string;
  monto?: number;
  fechaEmision?: Date;
  fechaVencimiento?: Date;
  fechaCorte?: Date;
  fechaProximaLectura?: Date;
  descripcion?: string;
  estaPagada?: boolean;
  fechaPago?: Date;
}

export interface DatosFormularioBoleta {
  tipoCuenta: TipoCuenta | '';
  nombreEmpresa: string;
  monto: string;
  fechaEmision: string;
  fechaVencimiento: string;
  fechaCorte: string;
  fechaProximaLectura: string;
  descripcion: string;
}

// Tipos para validaciones
export interface ErroresValidacion {
  tipoCuenta?: string;
  nombreEmpresa?: string;
  monto?: string;
  fechaEmision?: string;
  fechaVencimiento?: string;
  fechaCorte?: string;
  fechaProximaLectura?: string;
  descripcion?: string;
}

// Tipos para estado de la aplicación
export interface EstadoBoletasContexto {
  boletas: BoletaInterface[];
  boletasCargando: boolean;
  error: string | null;
  usuario: UsuarioInterface | null;
  configuracionNotificaciones: ConfiguracionNotificaciones | null;
}

export interface AccionesBoletasContexto {
  cargarBoletas: () => Promise<void>;
  agregarBoleta: (nuevaBoleta: NuevaBoleta) => Promise<BoletaInterface>;
  actualizarBoleta: (id: string, datos: ActualizacionBoleta) => Promise<BoletaInterface>;
  marcarComoPagada: (id: string) => Promise<BoletaInterface>;
  eliminarBoleta: (id: string) => Promise<void>;
  configurarNotificaciones: (config: ConfiguracionNotificaciones) => Promise<void>;
  setError: (error: string | null) => void;
}

// Tipos para navegación
export type RootStackParamList = {
  Dashboard: undefined;
  AgregarBoleta: undefined;
  EditarBoleta: { boleta: BoletaInterface };
  Configuracion: undefined;
  ConfiguracionNotificaciones: undefined;
};

export type TabParamList = {
  dashboard: undefined;
  configuracion: undefined;
};

// Tipos para componentes
export interface PropsTarjetaBoleta {
  boleta: BoletaInterface;
  onMarcarPagado: (id: string) => Promise<void>;
  onEditar: (boleta: BoletaInterface) => void;
  onEliminar?: (id: string) => Promise<void>;
}

export interface PropsFormularioBoleta {
  boletaInicial?: BoletaInterface;
  onGuardar: (boleta: NuevaBoleta | ActualizacionBoleta) => Promise<void>;
  onCancelar: () => void;
  modoEdicion?: boolean;
}

export interface PropsBotonDeslizable {
  onDeslizar: () => Promise<void>;
  texto: string;
  textoCompletado: string;
  color: string;
  deshabilitado?: boolean;
}

export interface PropsModalConfirmacion {
  visible: boolean;
  titulo: string;
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  textoConfirmar?: string;
  textoCancelar?: string;
}

// Tipos para API
export interface RespuestaAPI<T> {
  exito: boolean;
  datos: T;
  mensaje?: string;
  error?: string;
}

export interface ParametrosBusquedaBoletas {
  usuarioId: string;
  soloVencidas?: boolean;
  soloPagadas?: boolean;
  desde?: Date;
  hasta?: Date;
  tiposCuenta?: TipoCuenta[];
}

// Tipos para almacenamiento local
export interface DatosAlmacenamientoLocal {
  boletas: BoletaInterface[];
  usuario: UsuarioInterface;
  configuracionNotificaciones: ConfiguracionNotificaciones;
  fechaUltimaActualizacion: Date;
}

// Tipos utilitarios
export type EstadoBoletaCalculado = {
  estado: EstadoBoleta;
  diasRestantes: number;
  colorEstado: string;
  textoEstado: string;
};

export type ResumenBoletas = {
  total: number;
  pendientes: number;
  pagadas: number;
  vencidas: number;
  montoTotalPendiente: number;
  montoTotalPagado: number;
};

export type FiltrosBoletas = {
  estado?: EstadoBoleta;
  tipoCuenta?: TipoCuenta;
  fechaDesde?: Date;
  fechaHasta?: Date;
  busqueda?: string;
};

// Tipos para configuración de la aplicación
export interface ConfiguracionAplicacion {
  version: string;
  modoDesarrollo: boolean;
  urlAPI: string;
  tiempoEsperaRequest: number;
  maximoBoletasPorUsuario: number;
  formatoFecha: string;
  formatoMoneda: string;
  idioma: 'es' | 'en';
}

// Tipos para manejo de errores
export interface ErrorAplicacion {
  codigo: string;
  mensaje: string;
  detalles?: any;
  timestamp: Date;
}

export type TipoError = 
  | 'VALIDACION'
  | 'NETWORK'
  | 'AUTH'
  | 'STORAGE'
  | 'NOTIFICACION'
  | 'GENERAL';

// Constantes de tipos
export const TIPOS_CUENTA_LABELS: Record<TipoCuenta, string> = {
  [TipoCuenta.LUZ]: 'Luz',
  [TipoCuenta.AGUA]: 'Agua',
  [TipoCuenta.GAS]: 'Gas',
  [TipoCuenta.INTERNET]: 'Internet',
  [TipoCuenta.INTERNET_MOVIL]: 'Internet Móvil',
  [TipoCuenta.GASTOS_COMUNES]: 'Gastos Comunes',
};

export const ESTADOS_BOLETA_LABELS: Record<EstadoBoleta, string> = {
  [EstadoBoleta.PENDIENTE]: 'Pendiente',
  [EstadoBoleta.PAGADA]: 'Pagada',
  [EstadoBoleta.VENCIDA]: 'Vencida',
  [EstadoBoleta.PROXIMA]: 'Próxima',
};

export const TIPOS_NOTIFICACION_LABELS: Record<TipoNotificacion, string> = {
  [TipoNotificacion.TRES_DIAS_ANTES]: '3 días antes',
  [TipoNotificacion.UNA_SEMANA_ANTES]: '1 semana antes',
  [TipoNotificacion.EL_MISMO_DIA]: 'El mismo día',
};