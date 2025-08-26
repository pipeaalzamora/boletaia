/**
 * Utilidades de Validación para Autenticación
 * Funciones para validar datos de autenticación y perfiles de usuario
 */

import { UsuarioInterface, DatosGoogleAuth, ConfiguracionPrivacidad } from '../types';

/**
 * Valida un email usando expresión regular
 */
export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida el nombre de usuario
 */
export const validarNombre = (nombre: string): { valido: boolean; error?: string } => {
  if (!nombre || nombre.trim().length === 0) {
    return { valido: false, error: 'El nombre es requerido' };
  }

  if (nombre.trim().length < 2) {
    return { valido: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (nombre.trim().length > 50) {
    return { valido: false, error: 'El nombre no puede tener más de 50 caracteres' };
  }

  // Verificar que solo contenga letras, espacios y algunos caracteres especiales
  const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
  if (!nombreRegex.test(nombre.trim())) {
    return { valido: false, error: 'El nombre solo puede contener letras, espacios, apostrofes y guiones' };
  }

  return { valido: true };
};

/**
 * Valida el número de teléfono
 */
export const validarTelefono = (telefono: string): { valido: boolean; error?: string } => {
  if (!telefono || telefono.trim().length === 0) {
    // El teléfono es opcional
    return { valido: true };
  }

  // Remover espacios y caracteres especiales para validación
  const telefonoLimpio = telefono.replace(/[\s\-\(\)\+]/g, '');

  if (telefonoLimpio.length < 8) {
    return { valido: false, error: 'El teléfono debe tener al menos 8 dígitos' };
  }

  if (telefonoLimpio.length > 15) {
    return { valido: false, error: 'El teléfono no puede tener más de 15 dígitos' };
  }

  // Verificar que solo contenga números
  const telefonoRegex = /^\d+$/;
  if (!telefonoRegex.test(telefonoLimpio)) {
    return { valido: false, error: 'El teléfono solo puede contener números' };
  }

  return { valido: true };
};

/**
 * Valida los datos de un perfil de usuario completo
 */
export const validarPerfilUsuario = (usuario: Partial<UsuarioInterface>): {
  valido: boolean;
  errores: { [campo: string]: string };
} => {
  const errores: { [campo: string]: string } = {};

  // Validar ID
  if (!usuario.id) {
    errores.id = 'ID de usuario es requerido';
  }

  // Validar nombre
  if (usuario.nombre !== undefined) {
    const validacionNombre = validarNombre(usuario.nombre);
    if (!validacionNombre.valido) {
      errores.nombre = validacionNombre.error!;
    }
  }

  // Validar email
  if (usuario.email !== undefined) {
    if (!usuario.email || !validarEmail(usuario.email)) {
      errores.email = 'Email inválido';
    }
  }

  // Validar teléfono
  if (usuario.telefono !== undefined) {
    const validacionTelefono = validarTelefono(usuario.telefono);
    if (!validacionTelefono.valido) {
      errores.telefono = validacionTelefono.error!;
    }
  }

  // Validar tipo de autenticación
  if (usuario.tipoAutenticacion !== undefined) {
    if (!['google', 'invitado'].includes(usuario.tipoAutenticacion)) {
      errores.tipoAutenticacion = 'Tipo de autenticación inválido';
    }
  }

  // Validar Google ID si es usuario de Google
  if (usuario.tipoAutenticacion === 'google' && !usuario.googleId) {
    errores.googleId = 'Google ID es requerido para usuarios de Google';
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  };
};

/**
 * Valida los datos recibidos de Google OAuth
 */
export const validarDatosGoogleAuth = (datos: any): {
  valido: boolean;
  errores: string[];
  datosLimpios?: DatosGoogleAuth;
} => {
  const errores: string[] = [];

  // Verificar campos requeridos
  if (!datos.id) {
    errores.push('ID de Google faltante');
  }

  if (!datos.email) {
    errores.push('Email faltante');
  } else if (!validarEmail(datos.email)) {
    errores.push('Email inválido');
  }

  if (!datos.name) {
    errores.push('Nombre faltante');
  }

  if (errores.length > 0) {
    return { valido: false, errores };
  }

  // Crear objeto con datos limpios
  const datosLimpios: DatosGoogleAuth = {
    id: datos.id.toString(),
    email: datos.email.toLowerCase().trim(),
    name: datos.name.trim(),
    given_name: datos.given_name?.trim() || '',
    family_name: datos.family_name?.trim() || '',
    picture: datos.picture || undefined,
    locale: datos.locale || undefined,
  };

  return {
    valido: true,
    errores: [],
    datosLimpios,
  };
};

/**
 * Valida la configuración de privacidad
 */
export const validarConfiguracionPrivacidad = (config: Partial<ConfiguracionPrivacidad>): {
  valido: boolean;
  errores: string[];
} => {
  const errores: string[] = [];

  // Verificar tipos de datos
  if (config.compartirEmail !== undefined && typeof config.compartirEmail !== 'boolean') {
    errores.push('compartirEmail debe ser un valor booleano');
  }

  if (config.compartirNombre !== undefined && typeof config.compartirNombre !== 'boolean') {
    errores.push('compartirNombre debe ser un valor booleano');
  }

  if (config.respaldoAutomatico !== undefined && typeof config.respaldoAutomatico !== 'boolean') {
    errores.push('respaldoAutomatico debe ser un valor booleano');
  }

  if (config.sincronizacionDispositivos !== undefined && typeof config.sincronizacionDispositivos !== 'boolean') {
    errores.push('sincronizacionDispositivos debe ser un valor booleano');
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};

/**
 * Valida un token de acceso
 */
export const validarTokenAcceso = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Verificar que no esté vacío
  if (token.trim().length === 0) {
    return false;
  }

  // Verificar longitud mínima (los tokens de Google suelen ser largos)
  if (token.length < 20) {
    return false;
  }

  return true;
};

/**
 * Valida la integridad de una sesión
 */
export const validarIntegridadSesion = (datos: {
  token?: string;
  usuario?: UsuarioInterface;
  expiracion?: number;
}): {
  valido: boolean;
  motivo?: string;
} => {
  // Verificar token
  if (!datos.token || !validarTokenAcceso(datos.token)) {
    return { valido: false, motivo: 'Token inválido' };
  }

  // Verificar usuario
  if (!datos.usuario) {
    return { valido: false, motivo: 'Datos de usuario faltantes' };
  }

  const validacionUsuario = validarPerfilUsuario(datos.usuario);
  if (!validacionUsuario.valido) {
    return { valido: false, motivo: 'Datos de usuario inválidos' };
  }

  // Verificar expiración
  if (datos.expiracion && Date.now() > datos.expiracion) {
    return { valido: false, motivo: 'Sesión expirada' };
  }

  return { valido: true };
};

/**
 * Sanitiza una cadena de texto para evitar inyecciones
 */
export const sanitizarTexto = (texto: string): string => {
  if (typeof texto !== 'string') {
    return '';
  }

  return texto
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '');
};

/**
 * Valida y sanitiza datos de entrada del usuario
 */
export const validarYSanitizarDatosUsuario = (datos: any): {
  valido: boolean;
  datosLimpios?: Partial<UsuarioInterface>;
  errores: string[];
} => {
  const errores: string[] = [];
  const datosLimpios: Partial<UsuarioInterface> = {};

  try {
    // Sanitizar y validar nombre
    if (datos.nombre !== undefined) {
      const nombreSanitizado = sanitizarTexto(datos.nombre);
      const validacionNombre = validarNombre(nombreSanitizado);
      
      if (validacionNombre.valido) {
        datosLimpios.nombre = nombreSanitizado;
      } else {
        errores.push(validacionNombre.error!);
      }
    }

    // Sanitizar y validar email
    if (datos.email !== undefined) {
      const emailSanitizado = sanitizarTexto(datos.email).toLowerCase();
      
      if (validarEmail(emailSanitizado)) {
        datosLimpios.email = emailSanitizado;
      } else {
        errores.push('Email inválido');
      }
    }

    // Sanitizar y validar teléfono
    if (datos.telefono !== undefined) {
      const telefonoSanitizado = sanitizarTexto(datos.telefono);
      const validacionTelefono = validarTelefono(telefonoSanitizado);
      
      if (validacionTelefono.valido) {
        datosLimpios.telefono = telefonoSanitizado;
      } else {
        errores.push(validacionTelefono.error!);
      }
    }

    return {
      valido: errores.length === 0,
      datosLimpios: errores.length === 0 ? datosLimpios : undefined,
      errores,
    };
  } catch (error) {
    return {
      valido: false,
      errores: ['Error al procesar los datos'],
    };
  }
};

/**
 * Genera un ID único para usuario
 */
export const generarIdUsuario = (prefijo: string = 'user'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefijo}_${timestamp}_${random}`;
};

/**
 * Valida que una URL de avatar sea segura
 */
export const validarUrlAvatar = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    
    // Solo permitir HTTPS
    if (urlObj.protocol !== 'https:') {
      return false;
    }

    // Verificar dominios permitidos (Google, etc.)
    const dominiosPermitidos = [
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
    ];

    return dominiosPermitidos.some(dominio => urlObj.hostname === dominio);
  } catch {
    return false;
  }
};