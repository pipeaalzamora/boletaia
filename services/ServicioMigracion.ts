/**
 * Servicio de Migración para BoletaIA
 * Gestiona la migración de datos existentes cuando un usuario se autentica por primera vez
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BoletaInterface, UsuarioInterface, ResultadoMigracion } from '../types';

// Keys para AsyncStorage
const STORAGE_KEYS = {
  BOLETAS: '@boletaia_boletas',
  USUARIO: '@boletaia_usuario',
  CONFIGURACION: '@boletaia_configuracion',
  BACKUP_PRE_MIGRACION: '@boletaia_backup_migracion',
  MIGRACION_COMPLETADA: '@boletaia_migracion_completada',
};

export class ServicioMigracion {
  private static instance: ServicioMigracion;

  public static getInstance(): ServicioMigracion {
    if (!ServicioMigracion.instance) {
      ServicioMigracion.instance = new ServicioMigracion();
    }
    return ServicioMigracion.instance;
  }

  /**
   * Verifica si existen datos que necesitan migración
   */
  public async verificarDatosParaMigracion(): Promise<{
    boletasSinUsuario: number;
    requiereMigracion: boolean;
  }> {
    try {
      const boletasJson = await AsyncStorage.getItem(STORAGE_KEYS.BOLETAS);
      const usuarioJson = await AsyncStorage.getItem(STORAGE_KEYS.USUARIO);
      
      if (!boletasJson) {
        return { boletasSinUsuario: 0, requiereMigracion: false };
      }

      const boletas: BoletaInterface[] = JSON.parse(boletasJson);
      
      // Si no hay usuario previo o las boletas no tienen usuarioId válido
      const boletasSinUsuario = boletas.filter(boleta => 
        !boleta.usuarioId || 
        boleta.usuarioId === 'invitado' || 
        boleta.usuarioId === 'temp'
      ).length;

      const requiereMigracion = boletasSinUsuario > 0 && !usuarioJson;

      return { boletasSinUsuario, requiereMigracion };
    } catch (error) {
      console.error('Error al verificar datos para migración:', error);
      return { boletasSinUsuario: 0, requiereMigracion: false };
    }
  }

  /**
   * Migra datos existentes al nuevo usuario autenticado
   */
  public async migrarDatosExistentes(nuevoUsuario: UsuarioInterface): Promise<ResultadoMigracion> {
    try {
      // Crear backup antes de la migración
      await this.crearBackupPreMigracion();

      const verificacion = await this.verificarDatosParaMigracion();
      
      if (!verificacion.requiereMigracion) {
        return {
          exito: true,
          boletasMigradas: 0,
          errores: [],
          mensaje: 'No hay datos que requieran migración',
        };
      }

      // Migrar boletas
      const resultadoBoletas = await this.migrarBoletas(nuevoUsuario.id);
      
      // Migrar configuraciones si no existen
      await this.migrarConfiguraciones(nuevoUsuario);

      // Marcar migración como completada
      await this.marcarMigracionCompletada(nuevoUsuario.id);

      return {
        exito: true,
        boletasMigradas: resultadoBoletas.boletasMigradas,
        errores: resultadoBoletas.errores,
        mensaje: `Migración completada exitosamente. ${resultadoBoletas.boletasMigradas} boletas asociadas a tu cuenta.`,
      };

    } catch (error) {
      console.error('Error durante la migración:', error);
      
      // Intentar restaurar backup en caso de error
      await this.restaurarBackup();
      
      return {
        exito: false,
        boletasMigradas: 0,
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
        mensaje: 'Error durante la migración. Se han restaurado los datos originales.',
      };
    }
  }

  /**
   * Migra las boletas existentes al nuevo usuario
   */
  private async migrarBoletas(nuevoUsuarioId: string): Promise<{
    boletasMigradas: number;
    errores: string[];
  }> {
    try {
      const boletasJson = await AsyncStorage.getItem(STORAGE_KEYS.BOLETAS);
      
      if (!boletasJson) {
        return { boletasMigradas: 0, errores: [] };
      }

      const boletas: BoletaInterface[] = JSON.parse(boletasJson);
      const errores: string[] = [];
      let boletasMigradas = 0;

      const boletasActualizadas = boletas.map(boleta => {
        try {
          // Actualizar boletas sin usuario o con usuario temporal
          if (!boleta.usuarioId || boleta.usuarioId === 'invitado' || boleta.usuarioId === 'temp') {
            boletasMigradas++;
            return {
              ...boleta,
              usuarioId: nuevoUsuarioId,
              fechaActualizacion: new Date(),
            };
          }
          return boleta;
        } catch (error) {
          errores.push(`Error al migrar boleta ${boleta.id}: ${error}`);
          return boleta;
        }
      });

      // Guardar boletas actualizadas
      await AsyncStorage.setItem(STORAGE_KEYS.BOLETAS, JSON.stringify(boletasActualizadas));

      return { boletasMigradas, errores };
    } catch (error) {
      console.error('Error al migrar boletas:', error);
      throw new Error('No se pudieron migrar las boletas');
    }
  }

  /**
   * Migra configuraciones existentes al nuevo usuario
   */
  private async migrarConfiguraciones(nuevoUsuario: UsuarioInterface): Promise<void> {
    try {
      // Verificar si ya existe configuración
      const configExistente = await AsyncStorage.getItem(STORAGE_KEYS.CONFIGURACION);
      
      if (!configExistente && nuevoUsuario.configuracionNotificaciones) {
        // Guardar la configuración del nuevo usuario
        await AsyncStorage.setItem(
          STORAGE_KEYS.CONFIGURACION, 
          JSON.stringify(nuevoUsuario.configuracionNotificaciones)
        );
      }
    } catch (error) {
      console.error('Error al migrar configuraciones:', error);
      // No es crítico si falla la migración de configuraciones
    }
  }

  /**
   * Crea un backup de los datos antes de la migración
   */
  private async crearBackupPreMigracion(): Promise<void> {
    try {
      const datos = {
        boletas: await AsyncStorage.getItem(STORAGE_KEYS.BOLETAS),
        usuario: await AsyncStorage.getItem(STORAGE_KEYS.USUARIO),
        configuracion: await AsyncStorage.getItem(STORAGE_KEYS.CONFIGURACION),
        fechaBackup: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.BACKUP_PRE_MIGRACION, 
        JSON.stringify(datos)
      );
    } catch (error) {
      console.error('Error al crear backup:', error);
      throw new Error('No se pudo crear el backup de seguridad');
    }
  }

  /**
   * Restaura el backup en caso de error durante la migración
   */
  private async restaurarBackup(): Promise<void> {
    try {
      const backupJson = await AsyncStorage.getItem(STORAGE_KEYS.BACKUP_PRE_MIGRACION);
      
      if (!backupJson) {
        console.warn('No se encontró backup para restaurar');
        return;
      }

      const backup = JSON.parse(backupJson);

      // Restaurar datos originales
      if (backup.boletas) {
        await AsyncStorage.setItem(STORAGE_KEYS.BOLETAS, backup.boletas);
      }
      if (backup.usuario) {
        await AsyncStorage.setItem(STORAGE_KEYS.USUARIO, backup.usuario);
      }
      if (backup.configuracion) {
        await AsyncStorage.setItem(STORAGE_KEYS.CONFIGURACION, backup.configuracion);
      }

      console.log('Backup restaurado exitosamente');
    } catch (error) {
      console.error('Error al restaurar backup:', error);
    }
  }

  /**
   * Marca la migración como completada para el usuario
   */
  private async marcarMigracionCompletada(usuarioId: string): Promise<void> {
    try {
      const datosCompletos = {
        usuarioId,
        fechaCompletada: new Date().toISOString(),
        version: '1.0',
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.MIGRACION_COMPLETADA, 
        JSON.stringify(datosCompletos)
      );
    } catch (error) {
      console.error('Error al marcar migración completada:', error);
    }
  }

  /**
   * Verifica si la migración ya fue completada para un usuario
   */
  public async verificarMigracionCompletada(usuarioId: string): Promise<boolean> {
    try {
      const migracionJson = await AsyncStorage.getItem(STORAGE_KEYS.MIGRACION_COMPLETADA);
      
      if (!migracionJson) {
        return false;
      }

      const datosMigracion = JSON.parse(migracionJson);
      return datosMigracion.usuarioId === usuarioId;
    } catch (error) {
      console.error('Error al verificar migración completada:', error);
      return false;
    }
  }

  /**
   * Limpia los datos de backup después de una migración exitosa
   */
  public async limpiarBackupMigracion(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.BACKUP_PRE_MIGRACION);
    } catch (error) {
      console.error('Error al limpiar backup:', error);
    }
  }

  /**
   * Verifica la integridad de los datos después de la migración
   */
  public async verificarIntegridadDatos(usuarioId: string): Promise<{
    esIntegro: boolean;
    problemas: string[];
  }> {
    try {
      const problemas: string[] = [];

      // Verificar boletas
      const boletasJson = await AsyncStorage.getItem(STORAGE_KEYS.BOLETAS);
      if (boletasJson) {
        const boletas: BoletaInterface[] = JSON.parse(boletasJson);
        
        const boletasSinUsuario = boletas.filter(boleta => !boleta.usuarioId);
        if (boletasSinUsuario.length > 0) {
          problemas.push(`${boletasSinUsuario.length} boletas sin usuario asignado`);
        }

        const boletasUsuarioIncorrecto = boletas.filter(
          boleta => boleta.usuarioId && boleta.usuarioId !== usuarioId && boleta.usuarioId !== 'invitado'
        );
        if (boletasUsuarioIncorrecto.length > 0) {
          problemas.push(`${boletasUsuarioIncorrecto.length} boletas con usuario incorrecto`);
        }
      }

      // Verificar configuraciones
      const configJson = await AsyncStorage.getItem(STORAGE_KEYS.CONFIGURACION);
      if (configJson) {
        const config = JSON.parse(configJson);
        if (config.usuarioId !== usuarioId) {
          problemas.push('Configuración de notificaciones con usuario incorrecto');
        }
      }

      return {
        esIntegro: problemas.length === 0,
        problemas,
      };
    } catch (error) {
      console.error('Error al verificar integridad:', error);
      return {
        esIntegro: false,
        problemas: ['Error al verificar integridad de datos'],
      };
    }
  }

  /**
   * Obtiene estadísticas de la migración
   */
  public async obtenerEstadisticasMigracion(): Promise<{
    totalBoletas: number;
    boletasMigradas: number;
    fechaMigracion?: string;
  }> {
    try {
      const boletasJson = await AsyncStorage.getItem(STORAGE_KEYS.BOLETAS);
      const migracionJson = await AsyncStorage.getItem(STORAGE_KEYS.MIGRACION_COMPLETADA);

      const totalBoletas = boletasJson ? JSON.parse(boletasJson).length : 0;
      let boletasMigradas = 0;
      let fechaMigracion: string | undefined;

      if (migracionJson) {
        const datosMigracion = JSON.parse(migracionJson);
        fechaMigracion = datosMigracion.fechaCompletada;
        
        if (boletasJson) {
          const boletas: BoletaInterface[] = JSON.parse(boletasJson);
          boletasMigradas = boletas.filter(
            boleta => boleta.usuarioId === datosMigracion.usuarioId
          ).length;
        }
      }

      return {
        totalBoletas,
        boletasMigradas,
        fechaMigracion,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        totalBoletas: 0,
        boletasMigradas: 0,
      };
    }
  }
}

// Exportar instancia singleton
export const servicioMigracion = ServicioMigracion.getInstance();