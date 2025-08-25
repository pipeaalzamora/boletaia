/**
 * Pantalla Configuración de Notificaciones
 * Configuración detallada de alertas y recordatorios
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Switch,
  StyleSheet,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useBoletasContext } from '../context/BoletasContext';
import { EstilosBase } from '../constants/EstilosBase';
import { Tipografia } from '../constants/Tipografia';
import { Colores } from '../constants/Colors';
import { TarjetaConfiguracion } from '../components/ui/TarjetaBase';
import { BotonPrimario } from '../components/ui/BotonPrimario';
import { Selector, OpcionSelector } from '../components/ui/Selector';
import { ConfiguracionNotificaciones } from '../types';

export default function ConfiguracionNotificacionesScreen() {
  const router = useRouter();
  const { 
    configuracionNotificaciones,
    configurarNotificaciones 
  } = useBoletasContext();

  const [config, setConfig] = useState<ConfiguracionNotificaciones>({
    usuarioId: configuracionNotificaciones?.usuarioId || '',
    tresDiasAntes: configuracionNotificaciones?.tresDiasAntes || true,
    unaSemanaAntes: configuracionNotificaciones?.unaSemanaAntes || true,
    elMismoDia: configuracionNotificaciones?.elMismoDia || true,
    horaNotificacion: configuracionNotificaciones?.horaNotificacion || '09:00',
    habilitadas: configuracionNotificaciones?.habilitadas || true,
  });

  const [guardando, setGuardando] = useState(false);

  // Opciones de horarios predefinidos
  const opcionesHorario: OpcionSelector[] = [
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '20:00', label: '8:00 PM' },
  ];

  const actualizarConfiguracion = (campo: keyof ConfiguracionNotificaciones, valor: any) => {
    setConfig(prev => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const manejarGuardar = async () => {
    try {
      setGuardando(true);
      await configurarNotificaciones(config);
      
      Alert.alert(
        'Configuración Guardada',
        'Las preferencias de notificaciones han sido actualizadas.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      Alert.alert(
        'Error',
        'No se pudo guardar la configuración. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setGuardando(false);
    }
  };

  const OpcionSwitch = ({ 
    titulo, 
    descripcion, 
    icono, 
    valor, 
    onCambio,
    deshabilitado = false
  }: {
    titulo: string;
    descripcion: string;
    icono: string;
    valor: boolean;
    onCambio: (valor: boolean) => void;
    deshabilitado?: boolean;
  }) => (
    <TarjetaConfiguracion estiloPersonalizado={estilos.opcionContainer}>
      <View style={[
        estilos.opcionContent,
        deshabilitado && { opacity: 0.5 }
      ]}>
        <View style={estilos.opcionInfo}>
          <View style={[estilos.iconoContainer, { backgroundColor: valor ? Colores.naranja : Colores.grisMedio }]}>
            <Ionicons 
              name={icono as any} 
              size={20} 
              color={Colores.textoBlanco} 
            />
          </View>
          <View style={estilos.opcionTexto}>
            <Text style={Tipografia.cuerpo}>{titulo}</Text>
            <Text style={Tipografia.pequeno}>{descripcion}</Text>
          </View>
        </View>
        
        <Switch
          value={valor}
          onValueChange={onCambio}
          disabled={deshabilitado}
          trackColor={{ false: Colores.grisMedio, true: Colores.naranja + '80' }}
          thumbColor={valor ? Colores.naranja : Colores.grisClaro}
        />
      </View>
    </TarjetaConfiguracion>
  );

  return (
    <SafeAreaView style={EstilosBase.contenedorPrincipal}>
      <ScrollView 
        style={EstilosBase.contenedorConPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={estilos.header}>
          <Text style={Tipografia.tituloGrande}>Notificaciones</Text>
          <Text style={Tipografia.descripcion}>
            Configura cuándo y cómo recibir recordatorios de tus boletas
          </Text>
        </View>

        {/* Configuración Principal */}
        <View style={estilos.seccion}>
          <Text style={Tipografia.subtitulo}>Configuración General</Text>
          
          <OpcionSwitch
            titulo="Activar Notificaciones"
            descripcion="Habilitar todas las notificaciones de la aplicación"
            icono="notifications"
            valor={config.habilitadas}
            onCambio={(valor) => actualizarConfiguracion('habilitadas', valor)}
          />

          {config.habilitadas && (
            <TarjetaConfiguracion estiloPersonalizado={estilos.horarioContainer}>
              <Text style={[Tipografia.cuerpo, { marginBottom: 16 }]}>
                Horario de Notificaciones
              </Text>
              <Selector
                tipo="opciones"
                placeholder="Selecciona la hora"
                value={config.horaNotificacion}
                onChangeValue={(valor) => actualizarConfiguracion('horaNotificacion', valor)}
                opciones={opcionesHorario}
              />
              <Text style={[Tipografia.pequeno, { marginTop: 8 }]}>
                Las notificaciones se enviarán a esta hora
              </Text>
            </TarjetaConfiguracion>
          )}
        </View>

        {/* Tipos de Recordatorios */}
        <View style={estilos.seccion}>
          <Text style={Tipografia.subtitulo}>Recordatorios</Text>
          <Text style={[Tipografia.pequeno, { marginBottom: 16 }]}>
            Selecciona cuándo recibir alertas antes del vencimiento
          </Text>
          
          <OpcionSwitch
            titulo="1 Semana Antes"
            descripcion="Recordatorio 7 días antes del vencimiento"
            icono="calendar"
            valor={config.unaSemanaAntes}
            onCambio={(valor) => actualizarConfiguracion('unaSemanaAntes', valor)}
            deshabilitado={!config.habilitadas}
          />

          <OpcionSwitch
            titulo="3 Días Antes"
            descripcion="Recordatorio 3 días antes del vencimiento"
            icono="time"
            valor={config.tresDiasAntes}
            onCambio={(valor) => actualizarConfiguracion('tresDiasAntes', valor)}
            deshabilitado={!config.habilitadas}
          />

          <OpcionSwitch
            titulo="El Mismo Día"
            descripcion="Recordatorio el día del vencimiento"
            icono="alarm"
            valor={config.elMismoDia}
            onCambio={(valor) => actualizarConfiguracion('elMismoDia', valor)}
            deshabilitado={!config.habilitadas}
          />
        </View>

        {/* Información Adicional */}
        <TarjetaConfiguracion estiloPersonalizado={estilos.infoContainer}>
          <View style={estilos.infoHeader}>
            <Ionicons name="information-circle" size={24} color={Colores.naranja} />
            <Text style={[Tipografia.cuerpo, { marginLeft: 12 }]}>
              Información Importante
            </Text>
          </View>
          <Text style={[Tipografia.pequeno, { marginTop: 12, lineHeight: 20 }]}>
            • Las notificaciones son locales y no requieren conexión a internet{'\n'}
            • Puedes personalizar cada tipo de recordatorio independientemente{'\n'}
            • La hora se aplicará a todos los tipos de notificaciones{'\n'}
            • Los recordatorios se programan automáticamente al guardar una boleta
          </Text>
        </TarjetaConfiguracion>

        {/* Botones de Acción */}
        <View style={estilos.botonesContainer}>
          <BotonPrimario
            titulo="Cancelar"
            tipo="secundario"
            onPress={() => router.back()}
            ancho="ajustado"
            estiloPersonalizado={{ flex: 1, marginRight: 8 }}
            deshabilitado={guardando}
          />
          <BotonPrimario
            titulo="Guardar"
            onPress={manejarGuardar}
            ancho="ajustado"
            estiloPersonalizado={{ flex: 1, marginLeft: 8 }}
            cargando={guardando}
            deshabilitado={guardando}
          />
        </View>

        {/* Espacio adicional */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  header: {
    marginBottom: 32,
  },
  seccion: {
    marginBottom: 32,
  },
  opcionContainer: {
    marginBottom: 12,
  },
  opcionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opcionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  opcionTexto: {
    flex: 1,
  },
  horarioContainer: {
    marginTop: 16,
  },
  infoContainer: {
    marginBottom: 32,
    backgroundColor: Colores.negroSuave,
    borderColor: Colores.naranja + '30',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botonesContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
});