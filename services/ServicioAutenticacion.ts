/**
 * Servicio de Autenticación para BoletaIA
 * Maneja la autenticación con Supabase y gestión de sesiones
 */

import { User } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../lib/supabase";
import { UsuarioInterface } from "../types";

// Configurar WebBrowser para OAuth
WebBrowser.maybeCompleteAuthSession();

export class ServicioAutenticacion {
  private static instance: ServicioAutenticacion;

  constructor() {
    this.inicializarAutenticacion();
  }

  public static getInstance(): ServicioAutenticacion {
    if (!ServicioAutenticacion.instance) {
      ServicioAutenticacion.instance = new ServicioAutenticacion();
    }
    return ServicioAutenticacion.instance;
  }

  /**
   * Inicializa el servicio de autenticación
   */
  private async inicializarAutenticacion(): Promise<void> {
    try {
      console.log("Inicializando Supabase Auth...");

      // Evitar inicialización en entorno servidor (SSR)
      if (typeof window === "undefined") {
        console.log(
          "Entorno servidor detectado, omitiendo inicialización de auth"
        );
        return;
      }

      // Verificar la sesión actual solo en cliente
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        console.log("Sesión existente encontrada:", session.user.email);
      } else {
        console.log("No hay sesión activa");
      }

      console.log("Supabase Auth inicializado correctamente");
    } catch (error) {
      console.error("Error al inicializar Supabase Auth:", error);
    }
  }

  /**
   * Registra un nuevo usuario con email y contraseña
   */
  public async registrarConEmail(
    email: string,
    password: string,
    nombreCompleto: string
  ): Promise<UsuarioInterface> {
    try {
      console.log("Registrando usuario con email:", email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error("No se pudo crear el usuario");
      }

      console.log("Usuario registrado exitosamente");
      return this.crearUsuarioDesdeSupabase(data.user, nombreCompleto);
    } catch (error) {
      console.error("Error en registrarConEmail:", error);
      throw error;
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  public async iniciarSesionConEmail(
    email: string,
    password: string
  ): Promise<UsuarioInterface> {
    try {
      console.log("Iniciando sesión con email:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error("No se pudo iniciar sesión");
      }

      console.log("Sesión iniciada exitosamente");
      return this.crearUsuarioDesdeSupabase(data.user);
    } catch (error) {
      console.error("Error en iniciarSesionConEmail:", error);
      throw error;
    }
  }

  /**
   * Inicia sesión con Google usando Supabase OAuth
   */
  public async iniciarConGoogle(): Promise<void> {
    try {
      console.log("Iniciando sesión con Google via Supabase...");

      // Configurar la URL de redirección para la pantalla de callback
      // Forzar el esquema personalizado para evitar localhost
      const redirectTo = "boletaia://auth/callback";

      console.log("🔍 Redirect URL:", redirectTo);
      console.log("🔍 Supabase manejará el redirect desde Google");

      // Iniciar OAuth con Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true, // Importante para React Native
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw new Error(`Error de OAuth: ${error.message}`);
      }

      if (!data?.url) {
        throw new Error("No se pudo obtener la URL de autenticación");
      }

      console.log("Abriendo navegador para OAuth...");

      // Abrir el navegador para OAuth
      const authResult = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      if (authResult.type !== "success") {
        throw new Error("Autenticación cancelada o fallida");
      }

      console.log("OAuth completado, procesando callback...");

      // El callback será manejado por la pantalla auth/callback
      // Esta función solo inicia el proceso
    } catch (error) {
      console.error("Error en iniciarConGoogle:", error);
      throw error;
    }
  }

  /**
   * Procesa el callback OAuth desde una URL de deep linking
   */
  public async procesarCallbackOAuth(
    url: string
  ): Promise<UsuarioInterface | null> {
    try {
      console.log("Procesando callback OAuth desde URL:", url);

      // Extraer parámetros de la URL
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.hash.substring(1)); // Remover el #

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken) {
        console.log("No se encontró access_token en la URL");
        return null;
      }

      console.log("Tokens encontrados, estableciendo sesión...");

      // Establecer la sesión con los tokens
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      });

      if (error) {
        throw new Error(`Error al establecer sesión: ${error.message}`);
      }

      if (!data.user) {
        throw new Error("No se pudo obtener el usuario después del OAuth");
      }

      console.log("Sesión OAuth establecida exitosamente");
      return this.crearUsuarioDesdeSupabase(data.user);
    } catch (error) {
      console.error("Error procesando callback OAuth:", error);
      throw error;
    }
  }

  /**
   * Verifica si existe una sesión válida
   */
  public async verificarSesion(): Promise<boolean> {
    try {
      // No verificar sesión en entorno servidor
      if (typeof window === "undefined") {
        return false;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error("Error al verificar sesión:", error);
      return false;
    }
  }

  /**
   * Obtiene el usuario actual
   */
  public async obtenerUsuarioActual(): Promise<UsuarioInterface | null> {
    try {
      // No obtener usuario en entorno servidor
      if (typeof window === "undefined") {
        return null;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      return this.crearUsuarioDesdeSupabase(user);
    } catch (error) {
      console.error("Error al obtener usuario actual:", error);
      return null;
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  public async cerrarSesion(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      console.log("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  }

  /**
   * Envía email de recuperación de contraseña
   */
  public async recuperarContrasena(email: string): Promise<void> {
    try {
      console.log("Enviando email de recuperación a:", email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "boletaia://auth/reset-password",
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("Email de recuperación enviado exitosamente");
    } catch (error) {
      console.error("Error al enviar email de recuperación:", error);
      throw error;
    }
  }

  /**
   * Actualiza la contraseña del usuario
   */
  public async actualizarContrasena(nuevaContrasena: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: nuevaContrasena,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("Contraseña actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      throw error;
    }
  }

  /**
   * Escucha cambios en la autenticación
   */
  public escucharCambiosAuth(
    callback: (usuario: UsuarioInterface | null) => void
  ) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Cambio en auth:", event, session?.user?.email);

      if (session?.user) {
        const usuario = this.crearUsuarioDesdeSupabase(session.user);
        callback(usuario);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Crea un objeto UsuarioInterface desde los datos de Supabase
   */
  private crearUsuarioDesdeSupabase(
    user: User,
    nombreCompleto?: string
  ): UsuarioInterface {
    const ahora = new Date();

    return {
      id: user.id,
      nombre:
        nombreCompleto ||
        user.user_metadata?.nombre_completo ||
        user.email?.split("@")[0] ||
        "Usuario",
      email: user.email || "",
      fechaRegistro: new Date(user.created_at),
      ultimaConexion: ahora,
      tipoAutenticacion:
        user.app_metadata?.provider === "google" ? "google" : "email",
      avatarUrl: user.user_metadata?.avatar_url,
      configuracionNotificaciones: {
        usuarioId: user.id,
        tresDiasAntes: true,
        unaSemanaAntes: true,
        elMismoDia: true,
        horaNotificacion: "09:00",
        habilitadas: true,
      },
      configuracionPrivacidad: {
        compartirEmail: false,
        compartirNombre: true,
        respaldoAutomatico: true,
        sincronizacionDispositivos: true,
      },
    };
  }
}

// Exportar instancia singleton
export const servicioAuth = ServicioAutenticacion.getInstance();
