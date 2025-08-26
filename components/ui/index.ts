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
    OpcionSelector, PropsSelector,
    PropsSelectorFecha,
    PropsSelectorOpciones
} from './Selector';

export {
    Badge, BadgeDiasRestantes, BadgeEstadoBoleta, BadgeTipoCuenta
} from './Badge';
export type { PropsBadge } from './Badge';

export { SelectorRangoFechas } from './SelectorRangoFechas';

export {
    Avatar,
    AvatarGrande,
    AvatarMediano,
    AvatarPequeno
} from './Avatar';
export type { AvatarProps } from './Avatar';
