/**
 * Índice de componentes UI de BoletaIA
 * Exportaciones centralizadas de todos los componentes reutilizables
 */

export { BotonPrimario } from './BotonPrimario';
export type { PropsBotonPrimario } from './BotonPrimario';

export { 
  TarjetaBase, 
  TarjetaBoleta, 
  TarjetaConfiguracion, 
  TarjetaEstadistica 
} from './TarjetaBase';
export type { PropsTarjetaBase } from './TarjetaBase';

export { InputTexto } from './InputTexto';
export type { PropsInputTexto } from './InputTexto';

export { Selector } from './Selector';
export type { 
  PropsSelector, 
  PropsSelectorFecha, 
  PropsSelectorOpciones, 
  OpcionSelector 
} from './Selector';

export { 
  Badge, 
  BadgeEstadoBoleta, 
  BadgeDiasRestantes, 
  BadgeTipoCuenta 
} from './Badge';
export type { PropsBadge } from './Badge';

export { SelectorRangoFechas } from './SelectorRangoFechas';