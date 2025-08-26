/**
 * Pantalla de Login para BoletaIA
 * Diseño vanguardista con autenticación Supabase
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BotonPrimario } from '../components/ui/BotonPrimario';
import { InputTexto } from '../components/ui/InputTexto';
import { Colores } from '../constants/Colors';
import { Tipografia } from '../constants/Tipografia';
import { servicioAuth } from '../services/ServicioAutenticacion';
import { DatosLogin } from '../types';

export default function LoginScreen() {
  const [datosLogin, setDatosLogin] = useState<DatosLogin>({
    email: '',
    password: '',
  });
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const manejarLogin = async () => {
    if (!datosLogin.email.trim() || !datosLogin.password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!validarEmail(datosLogin.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setCargando(true);
    try {
      await servicioAuth.iniciarSesionConEmail(
        datosLogin.email.trim(),
        datosLogin.password
      );
      
      // Navegar a la pantalla principal
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert(
        'Error de autenticación',
        error instanceof Error ? error.message : 'No se pudo iniciar sesión'
      );
    } finally {
      setCargando(false);
    }
  };

  const manejarLoginGoogle = async () => {
    setCargando(true);
    try {
      await servicioAuth.iniciarConGoogle();
      // Si llegamos aquí, OAuth fue exitoso
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error en login con Google:', error);
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      
      // Si el error es sobre OAuth en proceso, no mostrar alerta
      if (mensaje.includes('OAuth en proceso')) {
        console.log('OAuth iniciado, esperando callback...');
        return; // El usuario será redirigido por el callback
      }
      
      if (mensaje.includes('OAuth') || mensaje.includes('configuración')) {
        Alert.alert(
          'Configuración Requerida',
          'Para usar Google OAuth necesitas:\n\n1. Configurar Google OAuth en Supabase\n2. Agregar tus credenciales de Google\n\nPor ahora, usa email y contraseña.',
          [{ text: 'Entendido' }]
        );
      } else {
        Alert.alert(
          'Error de Autenticación',
          `No se pudo iniciar sesión con Google:\n${mensaje}`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setCargando(false);
    }
  };

  const manejarRecuperarPassword = async () => {
    if (!datosLogin.email.trim()) {
      Alert.alert('Error', 'Ingresa tu email para recuperar la contraseña');
      return;
    }

    try {
      await servicioAuth.recuperarContrasena(datosLogin.email.trim());
      Alert.alert(
        'Email enviado',
        'Revisa tu correo para restablecer tu contraseña'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'No se pudo enviar el email'
      );
    }
  };

  const validarEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^@\s]+\.[^\s@]+$/;
    return regex.test(email);
  };

  return (
    <LinearGradient
      colors={[Colores.negro, Colores.grisOscuro]}
      style={estilos.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={estilos.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={estilos.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={estilos.header}>
            <View style={estilos.logoContainer}>
              <Ionicons name="flash" size={60} color={Colores.naranja} />
            </View>
            <Text style={estilos.titulo}>BoletaIA</Text>
            <Text style={estilos.subtitulo}>
              Gestiona tus cuentas de servicios con inteligencia artificial
            </Text>
          </View>

          {/* Formulario */}
          <View style={estilos.formularioContainer}>
            <InputTexto
              placeholder="Email"
              value={datosLogin.email}
              onChangeText={(texto) => 
                setDatosLogin(prev => ({ ...prev, email: texto }))
              }
              keyboardType="email-address"
              autoCapitalize="none"
              icono="mail"
            />

            <InputTexto
              placeholder="Contraseña"
              value={datosLogin.password}
              onChangeText={(texto) => 
                setDatosLogin(prev => ({ ...prev, password: texto }))
              }
              secureTextEntry={!mostrarPassword}
              icono="lock-closed"
              iconoDerecha={mostrarPassword ? "eye-off" : "eye"}
              onPressIconoDerecha={() => setMostrarPassword(!mostrarPassword)}
            />

            {/* Botón de recuperar contraseña */}
            <Text 
              style={estilos.linkRecuperar}
              onPress={manejarRecuperarPassword}
            >
              ¿Olvidaste tu contraseña?
            </Text>

            {/* Botón de login */}
            <BotonPrimario
              titulo="Iniciar Sesión"
              onPress={manejarLogin}
              cargando={cargando}
              icono={<Ionicons name="log-in" size={20} color={Colores.textoBlanco} />}
            />

            {/* Divider */}
            <View style={estilos.dividerContainer}>
              <View style={estilos.dividerLine} />
              <Text style={estilos.dividerTexto}>o continua con</Text>
              <View style={estilos.dividerLine} />
            </View>

            {/* Botón Google */}
            <BotonPrimario
              titulo="Continuar con Google"
              onPress={manejarLoginGoogle}
              tipo="secundario"
              cargando={cargando}
              icono={<Ionicons name="logo-google" size={20} color={Colores.textoBlanco} />}
            />
          </View>

          {/* Footer */}
          <View style={estilos.footer}>
            <Text style={estilos.footerTexto}>
              ¿No tienes cuenta?{' '}
              <Text 
                style={estilos.linkRegistro}
                onPress={() => router.push('/registro')}
              >
                Regístrate
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colores.naranja,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  titulo: {
    ...Tipografia.tituloGrande,
    color: Colores.textoBlanco,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitulo: {
    ...Tipografia.cuerpo,
    color: Colores.textoGrisMedio,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  formularioContainer: {
    marginBottom: 32,
  },
  linkRecuperar: {
    ...Tipografia.pequeno,
    color: Colores.naranja,
    textAlign: 'right',
    marginBottom: 24,
    marginTop: -8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colores.bordeClaro,
  },
  dividerTexto: {
    ...Tipografia.pequeno,
    color: Colores.textoGrisMedio,
    marginHorizontal: 16,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerTexto: {
    ...Tipografia.cuerpo,
    color: Colores.textoGrisMedio,
    textAlign: 'center',
  },
  linkRegistro: {
    color: Colores.naranja,
    fontWeight: '600',
  },
});
