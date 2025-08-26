/**
 * Pantalla de Perfil de Usuario para BoletaIA
 * Gestión de datos personales, configuración y cuenta de usuario
 */

import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BotonPrimario, TarjetaBase } from '../components/ui';
import { AvatarGrande } from '../components/ui/Avatar';
import { Colores } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

export default function PantallaPerfil() {
  const { usuario, estaAutenticado, cerrarSesion, cargandoAuth } = useAuth();
  const [cargandoCerrarSesion, setCargandoCerrarSesion] = useState(false);

  // Si no está autenticado, redirigir al login
  React.useEffect(() => {
    if (!estaAutenticado && !cargandoAuth) {
      router.replace('/login');
    }
  }, [estaAutenticado, cargandoAuth]);

  const manejarCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión? Tus datos locales se mantendrán.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              setCargandoCerrarSesion(true);
              await cerrarSesion();
              router.replace('/login');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            } finally {
              setCargandoCerrarSesion(false);
            }
          },
        },
      ]
    );
  };

  const manejarEditarPerfil = () => {
    Alert.alert(
      'Editar Perfil',
      'La edición de perfil estará disponible en una próxima actualización.',
      [{ text: 'OK' }]
    );
  };

  const manejarEliminarCuenta = () => {
    Alert.alert(
      'Eliminar Cuenta',
      'Esta acción no se puede deshacer. ¿Estás seguro que quieres eliminar tu cuenta permanentemente?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Funcionalidad en Desarrollo',
              'La eliminación de cuenta estará disponible en una próxima actualización.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const manejarConfiguracionPrivacidad = () => {
    Alert.alert(
      'Configuración de Privacidad',
      'Las opciones de privacidad estarán disponibles en una próxima actualización.',
      [{ text: 'OK' }]
    );
  };

  if (!usuario || !estaAutenticado) {
    return (
      <View style={[estilos.contenedor, estilos.centrado]}>
        <StatusBar barStyle="light-content" backgroundColor={Colores.negro} />
        <Text style={estilos.textoCargando}>Cargando perfil...</Text>
      </View>
    );
  }

  const fechaRegistroFormateada = format(
    new Date(usuario.fechaRegistro),
    "d 'de' MMMM 'de' yyyy",
    { locale: es }
  );

  const ultimaConexionFormateada = format(
    new Date(usuario.ultimaConexion),
    "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
    { locale: es }
  );

  return (
    <SafeAreaView style={estilos.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor={Colores.negro} />
      
      <ScrollView 
        style={estilos.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={estilos.header}>
          <TouchableOpacity 
            style={estilos.botonVolver}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colores.textoBlanco} />
          </TouchableOpacity>
          
          <Text style={estilos.titulo}>Mi Perfil</Text>
          
          <TouchableOpacity 
            style={estilos.botonEditar}
            onPress={manejarEditarPerfil}
          >
            <Ionicons name="create-outline" size={24} color={Colores.naranja} />
          </TouchableOpacity>
        </View>

        {/* Información del Usuario */}
        <TarjetaBase style={estilos.tarjetaPerfil}>
          <View style={estilos.avatarContainer}>
            <AvatarGrande
              nombre={usuario.nombre}
              email={usuario.email}
              avatarUrl={usuario.avatarUrl}
              mostrarBorde={true}
              editable={true}
              onPress={manejarEditarPerfil}
            />
          </View>
          
          <View style={estilos.infoUsuario}>
            <Text style={estilos.nombreUsuario}>{usuario.nombre}</Text>
            <Text style={estilos.emailUsuario}>{usuario.email}</Text>
            {usuario.telefono && (
              <Text style={estilos.telefonoUsuario}>{usuario.telefono}</Text>
            )}
            
            <View style={estilos.tipoAutenticacion}>
              <Ionicons 
                name={usuario.tipoAutenticacion === 'google' ? 'logo-google' : 'person'} 
                size={16} 
                color={Colores.naranja} 
              />
              <Text style={estilos.textoTipoAuth}>
                {usuario.tipoAutenticacion === 'google' ? 'Cuenta de Google' : 'Usuario invitado'}
              </Text>
            </View>
          </View>
        </TarjetaBase>

        {/* Estadísticas */}
        <TarjetaBase style={estilos.tarjetaEstadisticas}>
          <Text style={estilos.tituloSeccion}>Información de la Cuenta</Text>
          
          <View style={estilos.estadistica}>
            <Ionicons name="calendar" size={20} color={Colores.azul} />
            <View style={estilos.textoEstadistica}>
              <Text style={estilos.labelEstadistica}>Fecha de registro</Text>
              <Text style={estilos.valorEstadistica}>{fechaRegistroFormateada}</Text>
            </View>
          </View>
          
          <View style={estilos.estadistica}>
            <Ionicons name="time" size={20} color={Colores.verde} />
            <View style={estilos.textoEstadistica}>
              <Text style={estilos.labelEstadistica}>Última conexión</Text>
              <Text style={estilos.valorEstadistica}>{ultimaConexionFormateada}</Text>
            </View>
          </View>
        </TarjetaBase>

        {/* Configuración de Privacidad */}
        {usuario.configuracionPrivacidad && (
          <TarjetaBase style={estilos.tarjetaPrivacidad}>
            <Text style={estilos.tituloSeccion}>Configuración de Privacidad</Text>
            
            <View style={estilos.opcionPrivacidad}>
              <View style={estilos.infoOpcion}>
                <Ionicons name="cloud-upload" size={20} color={Colores.naranja} />
                <View style={estilos.textoOpcion}>
                  <Text style={estilos.nombreOpcion}>Respaldo automático</Text>
                  <Text style={estilos.descripcionOpcion}>
                    Sincronizar datos en la nube
                  </Text>
                </View>
              </View>
              <Switch
                value={usuario.configuracionPrivacidad.respaldoAutomatico}
                onValueChange={manejarConfiguracionPrivacidad}
                trackColor={{ false: Colores.grisOscuro, true: Colores.naranja }}
                thumbColor={Colores.textoBlanco}
              />
            </View>
            
            <View style={estilos.opcionPrivacidad}>
              <View style={estilos.infoOpcion}>
                <Ionicons name="sync" size={20} color={Colores.azul} />
                <View style={estilos.textoOpcion}>
                  <Text style={estilos.nombreOpcion}>Sincronización entre dispositivos</Text>
                  <Text style={estilos.descripcionOpcion}>
                    Mantener datos sincronizados
                  </Text>
                </View>
              </View>
              <Switch
                value={usuario.configuracionPrivacidad.sincronizacionDispositivos}
                onValueChange={manejarConfiguracionPrivacidad}
                trackColor={{ false: Colores.grisOscuro, true: Colores.azul }}
                thumbColor={Colores.textoBlanco}
              />
            </View>
          </TarjetaBase>
        )}

        {/* Acciones */}
        <TarjetaBase style={estilos.tarjetaAcciones}>
          <Text style={estilos.tituloSeccion}>Acciones de Cuenta</Text>
          
          <TouchableOpacity 
            style={estilos.accion}
            onPress={manejarConfiguracionPrivacidad}
          >
            <Ionicons name="shield-checkmark" size={20} color={Colores.verde} />
            <Text style={estilos.textoAccion}>Configuración de Privacidad</Text>
            <Ionicons name="chevron-forward" size={20} color={Colores.textoGrisMedio} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={estilos.accion}
            onPress={() => router.push('/configuracion-notificaciones')}
          >
            <Ionicons name="notifications" size={20} color={Colores.azul} />
            <Text style={estilos.textoAccion}>Configuración de Notificaciones</Text>
            <Ionicons name="chevron-forward" size={20} color={Colores.textoGrisMedio} />
          </TouchableOpacity>
        </TarjetaBase>

        {/* Zona de Peligro */}
        <TarjetaBase style={estilos.tarjetaPeligro}>
          <Text style={estilos.tituloSeccion}>Zona de Peligro</Text>
          
          <BotonPrimario
            titulo="Cerrar Sesión"
            onPress={manejarCerrarSesion}
            deshabilitado={cargandoCerrarSesion}
            tipo="secundario"
            icono={<Ionicons name="log-out" size={16} color={Colores.textoBlanco} />}
            estiloPersonalizado={estilos.botonCerrarSesion}
          />
          
          <TouchableOpacity 
            style={estilos.botonEliminar}
            onPress={manejarEliminarCuenta}
          >
            <Ionicons name="trash" size={16} color={Colores.rojo} />
            <Text style={estilos.textoEliminar}>Eliminar cuenta permanentemente</Text>
          </TouchableOpacity>
        </TarjetaBase>

        <View style={estilos.espacioFinal} />
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: Colores.fondoPrincipal,
  },

  centrado: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },

  textoCargando: {
    color: Colores.textoBlanco,
    fontSize: 16,
    fontWeight: '500',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingTop: 20,
  },

  botonVolver: {
    padding: 8,
  },

  titulo: {
    fontSize: 20,
    fontWeight: '600',
    color: Colores.textoBlanco,
  },

  botonEditar: {
    padding: 8,
  },

  // Tarjeta de Perfil
  tarjetaPerfil: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 32,
  },

  avatarContainer: {
    marginBottom: 20,
  },

  infoUsuario: {
    alignItems: 'center',
  },

  nombreUsuario: {
    fontSize: 24,
    fontWeight: '700',
    color: Colores.textoBlanco,
    marginBottom: 8,
    textAlign: 'center',
  },

  emailUsuario: {
    fontSize: 16,
    color: Colores.textoGrisMedio,
    marginBottom: 4,
    textAlign: 'center',
  },

  telefonoUsuario: {
    fontSize: 14,
    color: Colores.textoGrisOscuro,
    marginBottom: 16,
  },

  tipoAutenticacion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colores.fondoSecundario,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  textoTipoAuth: {
    fontSize: 12,
    color: Colores.textoGrisClaro,
    marginLeft: 6,
    fontWeight: '500',
  },

  // Estadísticas
  tarjetaEstadisticas: {
    marginBottom: 20,
  },

  tituloSeccion: {
    fontSize: 18,
    fontWeight: '600',
    color: Colores.textoBlanco,
    marginBottom: 16,
  },

  estadistica: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  textoEstadistica: {
    flex: 1,
    marginLeft: 12,
  },

  labelEstadistica: {
    fontSize: 14,
    color: Colores.textoGrisMedio,
    marginBottom: 2,
  },

  valorEstadistica: {
    fontSize: 16,
    color: Colores.textoBlanco,
    fontWeight: '500',
  },

  // Privacidad
  tarjetaPrivacidad: {
    marginBottom: 20,
  },

  opcionPrivacidad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  infoOpcion: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  textoOpcion: {
    flex: 1,
    marginLeft: 12,
  },

  nombreOpcion: {
    fontSize: 16,
    color: Colores.textoBlanco,
    fontWeight: '500',
    marginBottom: 2,
  },

  descripcionOpcion: {
    fontSize: 12,
    color: Colores.textoGrisMedio,
  },

  // Acciones
  tarjetaAcciones: {
    marginBottom: 20,
  },

  accion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colores.bordeOscuro,
  },

  textoAccion: {
    flex: 1,
    fontSize: 16,
    color: Colores.textoBlanco,
    marginLeft: 12,
  },

  // Zona de Peligro
  tarjetaPeligro: {
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colores.rojo,
  },

  botonCerrarSesion: {
    marginBottom: 16,
  },

  botonEliminar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },

  textoEliminar: {
    fontSize: 14,
    color: Colores.rojo,
    marginLeft: 8,
    fontWeight: '500',
  },

  espacioFinal: {
    height: 40,
  },
});