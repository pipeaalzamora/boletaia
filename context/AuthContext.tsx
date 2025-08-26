/**
 * Context de Autenticación para BoletaIA
 * Gestión global del estado de autenticación con Google OAuth
 */

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { Alert } from "react-native";
import { servicioAuth } from "../services/ServicioAutenticacion";
import { servicioMigracion } from "../services/ServicioMigracion";
import {
  AccionesAuth,
  ActualizacionPerfil,
  EstadoAuth,
  ResultadoMigracion,
  UsuarioInterface,
} from "../types";
import {
  validarPerfilUsuario,
  validarYSanitizarDatosUsuario,
} from "../utils/validacionAuth";

// Tipos para el reducer
type AccionAuth =
  | { type: "SET_CARGANDO"; payload: boolean }
  | { type: "SET_USUARIO"; payload: UsuarioInterface | null }
  | { type: "SET_AUTENTICADO"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_TOKEN"; payload: string | null }
  | { type: "LIMPIAR_ESTADO" };

// Estado inicial
const estadoInicialAuth: EstadoAuth = {
  estaAutenticado: false,
  usuario: null,
  cargandoAuth: true, // Iniciar como true para verificar sesión al cargar
  errorAuth: null,
  sesionToken: null,
};

// Reducer
function authReducer(estado: EstadoAuth, accion: AccionAuth): EstadoAuth {
  switch (accion.type) {
    case "SET_CARGANDO":
      return { ...estado, cargandoAuth: accion.payload };

    case "SET_USUARIO":
      return {
        ...estado,
        usuario: accion.payload,
        estaAutenticado: !!accion.payload,
        cargandoAuth: false,
      };

    case "SET_AUTENTICADO":
      return { ...estado, estaAutenticado: accion.payload };

    case "SET_ERROR":
      return { ...estado, errorAuth: accion.payload, cargandoAuth: false };

    case "SET_TOKEN":
      return { ...estado, sesionToken: accion.payload };

    case "LIMPIAR_ESTADO":
      return {
        ...estadoInicialAuth,
        cargandoAuth: false,
      };

    default:
      return estado;
  }
}

// Context
const AuthContext = createContext<(EstadoAuth & AccionesAuth) | undefined>(
  undefined
);

// Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [estado, dispatch] = useReducer(authReducer, estadoInicialAuth);

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    verificarSesionInicial();
  }, []);

  /**
   * Verifica si existe una sesión válida al iniciar la app
   */
  const verificarSesionInicial = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_CARGANDO", payload: true });

      const sesionValida = await servicioAuth.verificarSesion();

      if (sesionValida) {
        const usuario = await servicioAuth.obtenerUsuarioActual();
        if (usuario) {
          dispatch({ type: "SET_USUARIO", payload: usuario });
          console.log("Sesión restaurada para:", usuario.nombre);
        }
      }
    } catch (error) {
      console.error("Error al verificar sesión inicial:", error);
      dispatch({ type: "SET_ERROR", payload: "Error al verificar sesión" });
    } finally {
      dispatch({ type: "SET_CARGANDO", payload: false });
    }
  };

  /**
   * Inicia sesión con Google OAuth
   */
  const iniciarSesionConGoogle = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_CARGANDO", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Iniciar el proceso OAuth (no retorna usuario inmediatamente)
      await servicioAuth.iniciarConGoogle();

      // El OAuth se procesa en la pantalla de callback
      // No establecer usuario aquí, se hará en el callback
      console.log("Proceso OAuth iniciado, esperando callback...");
    } catch (error) {
      console.error("Error en iniciarSesionConGoogle:", error);
      const mensaje =
        error instanceof Error
          ? error.message
          : "Error desconocido en la autenticación";
      dispatch({ type: "SET_ERROR", payload: mensaje });

      Alert.alert("Error de Autenticación", mensaje, [{ text: "OK" }]);
    } finally {
      dispatch({ type: "SET_CARGANDO", payload: false });
    }
  };

  /**
   * Procesa el resultado del OAuth callback
   */
  const procesarCallbackOAuth = async (
    usuario: UsuarioInterface
  ): Promise<void> => {
    try {
      dispatch({ type: "SET_CARGANDO", payload: true });

      // Validar datos del usuario
      const validacion = validarPerfilUsuario(usuario);
      if (!validacion.valido) {
        throw new Error("Datos de usuario inválidos");
      }

      // Verificar si necesita migración de datos
      const estadoMigracion =
        await servicioMigracion.verificarDatosParaMigracion();

      if (estadoMigracion.requiereMigracion) {
        await mostrarDialogoMigracion(
          usuario,
          estadoMigracion.boletasSinUsuario
        );
      } else {
        dispatch({ type: "SET_USUARIO", payload: usuario });
        console.log("Autenticación OAuth exitosa:", usuario.nombre);
      }
    } catch (error) {
      console.error("Error procesando callback OAuth:", error);
      const mensaje =
        error instanceof Error
          ? error.message
          : "Error procesando autenticación";
      dispatch({ type: "SET_ERROR", payload: mensaje });
      throw error;
    } finally {
      dispatch({ type: "SET_CARGANDO", payload: false });
    }
  };

  /**
   * Muestra diálogo de migración y ejecuta el proceso
   */
  const mostrarDialogoMigracion = async (
    usuario: UsuarioInterface,
    boletasSinUsuario: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      Alert.alert(
        "Migración de Datos",
        `Encontramos ${boletasSinUsuario} boletas guardadas. ¿Quieres asociarlas a tu cuenta de Google?`,
        [
          {
            text: "No, continuar sin migrar",
            style: "cancel",
            onPress: async () => {
              dispatch({ type: "SET_USUARIO", payload: usuario });
              resolve();
            },
          },
          {
            text: "Sí, migrar datos",
            onPress: async () => {
              await ejecutarMigracion(usuario);
              resolve();
            },
          },
        ]
      );
    });
  };

  /**
   * Ejecuta el proceso de migración de datos
   */
  const ejecutarMigracion = async (
    usuario: UsuarioInterface
  ): Promise<void> => {
    try {
      dispatch({ type: "SET_CARGANDO", payload: true });

      const resultado: ResultadoMigracion =
        await servicioMigracion.migrarDatosExistentes(usuario);

      if (resultado.exito) {
        dispatch({ type: "SET_USUARIO", payload: usuario });

        Alert.alert("Migración Exitosa", resultado.mensaje, [
          { text: "Continuar" },
        ]);

        // Limpiar backup después de migración exitosa
        await servicioMigracion.limpiarBackupMigracion();
      } else {
        throw new Error(resultado.mensaje);
      }
    } catch (error) {
      console.error("Error en migración:", error);
      const mensaje =
        error instanceof Error ? error.message : "Error en la migración";

      Alert.alert(
        "Error en Migración",
        `${mensaje}. Puedes continuar sin migrar los datos.`,
        [
          {
            text: "Continuar sin migrar",
            onPress: () => {
              dispatch({ type: "SET_USUARIO", payload: usuario });
            },
          },
        ]
      );
    }
  };

  /**
   * Verifica la validez de la sesión actual
   */
  const verificarSesion = async (): Promise<boolean> => {
    try {
      const sesionValida = await servicioAuth.verificarSesion();

      if (!sesionValida) {
        await cerrarSesion();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error al verificar sesión:", error);
      return false;
    }
  };

  /**
   * Actualiza el perfil del usuario
   */
  const actualizarPerfil = async (
    datosActualizacion: ActualizacionPerfil
  ): Promise<void> => {
    try {
      dispatch({ type: "SET_CARGANDO", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      if (!estado.usuario) {
        throw new Error("No hay usuario autenticado");
      }

      // Validar y sanitizar datos de entrada
      const validacion = validarYSanitizarDatosUsuario(datosActualizacion);

      if (!validacion.valido) {
        throw new Error(`Datos inválidos: ${validacion.errores.join(", ")}`);
      }

      // Actualizar perfil
      const usuarioActualizado = await servicioAuth.actualizarPerfil(
        validacion.datosLimpios!
      );

      dispatch({ type: "SET_USUARIO", payload: usuarioActualizado });

      Alert.alert(
        "Perfil Actualizado",
        "Tus datos han sido actualizados exitosamente",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      const mensaje =
        error instanceof Error ? error.message : "Error al actualizar perfil";
      dispatch({ type: "SET_ERROR", payload: mensaje });

      Alert.alert("Error", mensaje, [{ text: "OK" }]);
    } finally {
      dispatch({ type: "SET_CARGANDO", payload: false });
    }
  };

  /**
   * Cierra la sesión del usuario
   */
  const cerrarSesion = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_CARGANDO", payload: true });

      await servicioAuth.cerrarSesion();

      dispatch({ type: "LIMPIAR_ESTADO" });

      console.log("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);

      // Limpiar estado local incluso si hay error en el servidor
      dispatch({ type: "LIMPIAR_ESTADO" });

      Alert.alert(
        "Aviso",
        "Hubo un problema al cerrar la sesión, pero has sido desconectado localmente.",
        [{ text: "OK" }]
      );
    }
  };

  // Valor del contexto
  const valorContexto: EstadoAuth & AccionesAuth = {
    // Estado
    estaAutenticado: estado.estaAutenticado,
    usuario: estado.usuario,
    cargandoAuth: estado.cargandoAuth,
    errorAuth: estado.errorAuth,
    sesionToken: estado.sesionToken,

    // Acciones
    iniciarSesionConGoogle,
    procesarCallbackOAuth,
    cerrarSesion,
    verificarSesion,
    actualizarPerfil,
  };

  return (
    <AuthContext.Provider value={valorContexto}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth() {
  const contexto = useContext(AuthContext);

  if (contexto === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }

  return contexto;
}

// Hook para verificar si el usuario está autenticado
export function useEstaAutenticado() {
  const { estaAutenticado, cargandoAuth } = useAuth();
  return { estaAutenticado, cargandoAuth };
}

// Hook para obtener datos del usuario actual
export function useUsuarioActual() {
  const { usuario, estaAutenticado } = useAuth();
  return estaAutenticado ? usuario : null;
}
