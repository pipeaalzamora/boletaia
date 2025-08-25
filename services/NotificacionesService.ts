/**
 * Servicio de Notificaciones Locales para BoletaIA
 * Gestiona recordatorios y alertas de vencimiento de boletas
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, subDays, setHours, setMinutes, isAfter, isBefore } from 'date-fns';

import { 
  BoletaInterface, 
  ConfiguracionNotificaciones,
  TipoNotificacion,
  NotificacionInterface 
} from '../types';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class ServicioNotificaciones {
  
  /**
   * Solicita permisos para notificaciones
   */
  static async solicitarPermisos(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('boletas', {
          name: 'Recordatorios de Boletas',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B35',
          sound: true,
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error al solicitar permisos de notificación:', error);
      return false;
    }
  }

  /**
   * Programa notificaciones para una boleta específica
   */
  static async programarNotificacionesBoleta(
    boleta: BoletaInterface,
    configuracion: ConfiguracionNotificaciones
  ): Promise<void> {
    if (!configuracion.habilitadas || boleta.estaPagada) {
      return;
    }

    try {
      // Cancelar notificaciones existentes para esta boleta
      await this.cancelarNotificacionesBoleta(boleta.id);

      const fechaVencimiento = new Date(boleta.fechaVencimiento);
      const ahora = new Date();
      
      // Configurar hora de notificación
      const [hora, minutos] = configuracion.horaNotificacion.split(':').map(Number);

      const notificacionesProgramar: Array<{
        id: string;
        fecha: Date;
        tipo: TipoNotificacion;
        titulo: string;
        mensaje: string;
      }> = [];

      // Notificación 1 semana antes
      if (configuracion.unaSemanaAntes) {
        const fechaNotificacion = setMinutes(
          setHours(subDays(fechaVencimiento, 7), hora),
          minutos
        );
        
        if (isAfter(fechaNotificacion, ahora)) {
          notificacionesProgramar.push({
            id: `${boleta.id}_semana`,
            fecha: fechaNotificacion,
            tipo: TipoNotificacion.UNA_SEMANA_ANTES,
            titulo: '📅 Recordatorio de Boleta',
            mensaje: `Tu boleta de ${boleta.nombreEmpresa} vence en 1 semana (${fechaVencimiento.toLocaleDateString('es-CL')})`,
          });
        }
      }

      // Notificación 3 días antes
      if (configuracion.tresDiasAntes) {
        const fechaNotificacion = setMinutes(
          setHours(subDays(fechaVencimiento, 3), hora),
          minutos
        );
        
        if (isAfter(fechaNotificacion, ahora)) {
          notificacionesProgramar.push({
            id: `${boleta.id}_tres_dias`,
            fecha: fechaNotificacion,
            tipo: TipoNotificacion.TRES_DIAS_ANTES,
            titulo: '⚡ Boleta por Vencer',
            mensaje: `¡Atención! Tu boleta de ${boleta.nombreEmpresa} vence en 3 días. Monto: $${boleta.monto.toLocaleString('es-CL')}`,
          });
        }
      }

      // Notificación el mismo día
      if (configuracion.elMismoDia) {
        const fechaNotificacion = setMinutes(
          setHours(fechaVencimiento, hora),
          minutos
        );
        
        if (isAfter(fechaNotificacion, ahora)) {
          notificacionesProgramar.push({
            id: `${boleta.id}_mismo_dia`,
            fecha: fechaNotificacion,
            tipo: TipoNotificacion.EL_MISMO_DIA,
            titulo: '🚨 ¡Boleta Vence Hoy!',
            mensaje: `Tu boleta de ${boleta.nombreEmpresa} vence HOY. No olvides pagarla. Monto: $${boleta.monto.toLocaleString('es-CL')}`,
          });
        }
      }

      // Programar todas las notificaciones
      for (const notif of notificacionesProgramar) {
        await Notifications.scheduleNotificationAsync({
          identifier: notif.id,
          content: {
            title: notif.titulo,
            body: notif.mensaje,
            data: {
              boletaId: boleta.id,
              tipo: notif.tipo,
              tipoCuenta: boleta.tipoCuenta,
              nombreEmpresa: boleta.nombreEmpresa,
              monto: boleta.monto,
            },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            ...(Platform.OS === 'android' && {
              channelId: 'boletas',
            }),
          },
          trigger: {
            date: notif.fecha,
          },
        });
      }

      console.log(`Programadas ${notificacionesProgramar.length} notificaciones para boleta ${boleta.nombreEmpresa}`);
    } catch (error) {
      console.error('Error al programar notificaciones:', error);
    }
  }

  /**
   * Cancela todas las notificaciones de una boleta específica
   */
  static async cancelarNotificacionesBoleta(boletaId: string): Promise<void> {
    try {
      const identificadores = [
        `${boletaId}_semana`,
        `${boletaId}_tres_dias`,
        `${boletaId}_mismo_dia`,
      ];

      for (const id of identificadores) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    } catch (error) {
      console.error('Error al cancelar notificaciones:', error);
    }
  }

  /**
   * Reprograma notificaciones para todas las boletas
   */
  static async reprogramarTodasLasNotificaciones(
    boletas: BoletaInterface[],
    configuracion: ConfiguracionNotificaciones
  ): Promise<void> {
    try {
      // Cancelar todas las notificaciones existentes
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Programar notificaciones para boletas pendientes
      const boletasPendientes = boletas.filter(b => !b.estaPagada);
      
      for (const boleta of boletasPendientes) {
        await this.programarNotificacionesBoleta(boleta, configuracion);
      }

      console.log(`Reprogramadas notificaciones para ${boletasPendientes.length} boletas`);
    } catch (error) {
      console.error('Error al reprogramar notificaciones:', error);
    }
  }

  /**
   * Obtiene todas las notificaciones programadas
   */
  static async obtenerNotificacionesProgramadas(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error al obtener notificaciones programadas:', error);
      return [];
    }
  }

  /**
   * Cancela todas las notificaciones
   */
  static async cancelarTodasLasNotificaciones(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Todas las notificaciones han sido canceladas');
    } catch (error) {
      console.error('Error al cancelar todas las notificaciones:', error);
    }
  }

  /**
   * Maneja la respuesta a una notificación
   */
  static async manejarRespuestaNotificacion(
    response: Notifications.NotificationResponse
  ): Promise<void> {
    try {
      const { data } = response.notification.request.content;
      
      if (data?.boletaId) {
        // Aquí puedes implementar lógica para navegar a la boleta específica
        // o realizar acciones adicionales
        console.log('Notificación tocada para boleta:', data.boletaId);
      }
    } catch (error) {
      console.error('Error al manejar respuesta de notificación:', error);
    }
  }

  /**
   * Envía una notificación de prueba
   */
  static async enviarNotificacionPrueba(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Notificación de Prueba',
          body: 'Las notificaciones de BoletaIA están funcionando correctamente',
          data: { tipo: 'prueba' },
          sound: true,
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Error al enviar notificación de prueba:', error);
    }
  }

  /**
   * Obtiene estadísticas de notificaciones
   */
  static async obtenerEstadisticasNotificaciones(): Promise<{
    programadas: number;
    porBoleta: Record<string, number>;
  }> {
    try {
      const notificaciones = await this.obtenerNotificacionesProgramadas();
      const porBoleta: Record<string, number> = {};

      notificaciones.forEach(notif => {
        const boletaId = notif.content.data?.boletaId;
        if (boletaId) {
          porBoleta[boletaId] = (porBoleta[boletaId] || 0) + 1;
        }
      });

      return {
        programadas: notificaciones.length,
        porBoleta,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { programadas: 0, porBoleta: {} };
    }
  }
}