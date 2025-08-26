/**
 * Pantalla de Registro para BoletaIA
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
import { DatosRegistro } from '../types';

export default function RegistroScreen() {
  const [datosRegistro, setDatosRegistro] = useState<DatosRegistro>({
    nombreCompleto: '',
    email: '',
    password: '',
  });
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarRegistro = async () => {
    if (!datosRegistro.nombreCompleto.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre completo');
      return;
    }

    if (!datosRegistro.email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!validarEmail(datosRegistro.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (!datosRegistro.password) {
      Alert.alert('Error', 'Por favor ingresa una contraseña');
      return;
    }

    if (datosRegistro.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (datosRegistro.password !== confirmarPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setCargando(true);
    try {
      await servicioAuth.registrarConEmail(
        datosRegistro.email.trim(),
        datosRegistro.password,
        datosRegistro.nombreCompleto.trim()
      );
      
      Alert.alert(
        'Registro exitoso',
        'Tu cuenta ha sido creada. Revisa tu email para confirmar tu cuenta.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error) {
      console.error('Error en registro:', error);
      Alert.alert(
        'Error de registro',
        error instanceof Error ? error.message : 'No se pudo crear la cuenta'
      );
    } finally {
      setCargando(false);
    }
  };

  const validarEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const obtenerFuerzaPassword = (password: string) => {
    if (password.length === 0) return { fuerza: 0, texto: '', color: Colores.textoGrisMedio };
    if (password.length < 6) return { fuerza: 1, texto: 'Débil', color: Colores.rojo };
    if (password.length < 8) return { fuerza: 2, texto: 'Regular', color: Colores.naranja };
    
    const tieneMinuscula = /[a-z]/.test(password);
    const tieneMayuscula = /[A-Z]/.test(password);
    const tieneNumero = /\d/.test(password);
    const tieneEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const criterios = [tieneMinuscula, tieneMayuscula, tieneNumero, tieneEspecial].filter(Boolean).length;
    
    if (criterios >= 3) return { fuerza: 4, texto: 'Muy fuerte', color: Colores.verde };
    if (criterios >= 2) return { fuerza: 3, texto: 'Fuerte', color: Colores.verde };
    return { fuerza: 2, texto: 'Regular', color: Colores.naranja };
  };

  const fuerzaPassword = obtenerFuerzaPassword(datosRegistro.password);

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
          <View style={estilos.header}>
            <View style={estilos.logoContainer}>
              <Ionicons name="flash" size={48} color={Colores.naranja} />
            </View>
            <Text style={estilos.titulo}>Crear Cuenta</Text>
            <Text style={estilos.subtitulo}>
              Únete a BoletaIA y comienza a gestionar tus cuentas inteligentemente
            </Text>
          </View>

          <View style={estilos.formularioContainer}>
            <InputTexto
              placeholder="Nombre completo"
              value={datosRegistro.nombreCompleto}
              onChangeText={(texto) => 
                setDatosRegistro(prev => ({ ...prev, nombreCompleto: texto }))
              }
              autoCapitalize="words"
              icono="person"
            />

            <InputTexto
              placeholder="Email"
              value={datosRegistro.email}
              onChangeText={(texto) => 
                setDatosRegistro(prev => ({ ...prev, email: texto }))
              }
              keyboardType="email-address"
              autoCapitalize="none"
              icono="mail"
            />

            <InputTexto
              placeholder="Contraseña"
              value={datosRegistro.password}
              onChangeText={(texto) => 
                setDatosRegistro(prev => ({ ...prev, password: texto }))
              }
              tipo="password"
              icono="lock-closed"
            />

            {datosRegistro.password.length > 0 && (
              <View style={estilos.passwordStrengthContainer}>
                <View style={estilos.passwordStrengthBar}>
                  {[1, 2, 3, 4].map((nivel) => (
                    <View
                      key={nivel}
                      style={[
                        estilos.passwordStrengthSegment,
                        {
                          backgroundColor: nivel <= fuerzaPassword.fuerza 
                            ? fuerzaPassword.color 
                            : Colores.bordeClaro,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[estilos.passwordStrengthText, { color: fuerzaPassword.color }]}>
                  {fuerzaPassword.texto}
                </Text>
              </View>
            )}

            <InputTexto
              placeholder="Confirmar contraseña"
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
              tipo="password"
              icono="checkmark-circle"
            />

            <BotonPrimario
              titulo="Crear Cuenta"
              onPress={manejarRegistro}
              cargando={cargando}
              icono={<Ionicons name="person-add" size={20} color={Colores.textoBlanco} />}
            />
          </View>

          <View style={estilos.footer}>
            <Text style={estilos.footerTexto}>
              ¿Ya tienes cuenta?{' '}
              <Text 
                style={estilos.linkLogin}
                onPress={() => router.back()}
              >
                Inicia sesión
              </Text>
            </Text>
            
            <Text style={estilos.terminosTexto}>
              Al registrarte, aceptas nuestros{' '}
              <Text style={estilos.linkTerminos}>
                Términos de Servicio
              </Text>
              {' '}y{' '}
              <Text style={estilos.linkTerminos}>
                Política de Privacidad
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
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colores.fondoTarjeta,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colores.naranja,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  titulo: {
    ...Tipografia.titulo,
    color: Colores.textoBlanco,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    ...Tipografia.cuerpo,
    color: Colores.textoGrisMedio,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  formularioContainer: {
    marginBottom: 24,
  },
  passwordStrengthContainer: {
    marginTop: -12,
    marginBottom: 16,
  },
  passwordStrengthBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  passwordStrengthSegment: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  passwordStrengthText: {
    ...Tipografia.pequeno,
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  footerTexto: {
    ...Tipografia.cuerpo,
    color: Colores.textoGrisMedio,
    textAlign: 'center',
    marginBottom: 16,
  },
  linkLogin: {
    color: Colores.naranja,
    fontWeight: '600',
  },
  terminosTexto: {
    ...Tipografia.pequeno,
    color: Colores.textoGrisMedio,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  linkTerminos: {
    color: Colores.naranja,
    textDecorationLine: 'underline',
  },
});