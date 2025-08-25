/**
 * FormularioBoleta - Componente para agregar y editar boletas
 * Incluye validaciones completas de fechas y campos
 */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EstilosBase } from '../constants/EstilosBase';
import { Tipografia } from '../constants/Tipografia';
import {
  DatosFormularioBoleta,
  ErroresValidacion,
  PropsFormularioBoleta,
  TipoCuenta,
  TIPOS_CUENTA_LABELS
} from '../types';
import { UtilsBoleta, ValidadorBoleta } from '../utils/validaciones';
import { BotonPrimario } from './ui/BotonPrimario';
import { InputTexto } from './ui/InputTexto';
import { OpcionSelector, Selector } from './ui/Selector';
import { TarjetaBase } from './ui/TarjetaBase';

export function FormularioBoleta({
  boletaInicial,
  onGuardar,
  onCancelar,
  modoEdicion = false,
}: PropsFormularioBoleta) {
  const [datosFormulario, setDatosFormulario] = useState<DatosFormularioBoleta>({
    tipoCuenta: '',
    nombreEmpresa: '',
    monto: '',
    fechaEmision: '',
    fechaVencimiento: '',
    fechaCorte: '',
    fechaProximaLectura: '',
    descripcion: '',
  });

  const [errores, setErrores] = useState<ErroresValidacion>({});
  const [guardando, setGuardando] = useState(false);

  // Cargar datos iniciales si está en modo edición
  useEffect(() => {
    if (boletaInicial && modoEdicion) {
      const datosConvertidos = UtilsBoleta.convertirBoletaAFormulario(boletaInicial);
      setDatosFormulario(datosConvertidos);
    }
  }, [boletaInicial, modoEdicion]);

  // Opciones para el selector de tipo de cuenta
  const opcionesTipoCuenta: OpcionSelector[] = Object.entries(TIPOS_CUENTA_LABELS).map(([valor, etiqueta]) => ({
    value: valor,
    label: etiqueta,
    icono: UtilsBoleta.obtenerIconoTipoCuenta(valor as TipoCuenta) as any,
    color: UtilsBoleta.obtenerColorTipoCuenta(valor as TipoCuenta),
  }));

  const actualizarCampo = (campo: keyof DatosFormularioBoleta, valor: string) => {
    setDatosFormulario(prev => ({
      ...prev,
      [campo]: valor,
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errores[campo]) {
      setErrores(prev => ({
        ...prev,
        [campo]: undefined,
      }));
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores = ValidadorBoleta.validarFormularioBoleta(datosFormulario);
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarGuardar = async () => {
    if (!validarFormulario()) {
      Alert.alert(
        'Errores en el formulario',
        'Por favor corrige los errores antes de continuar',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setGuardando(true);
      
      if (modoEdicion && boletaInicial) {
        // Modo edición: solo actualizar campos modificados
        const datosActualizados = UtilsBoleta.convertirFormularioABoleta(datosFormulario);
        await onGuardar(datosActualizados);
      } else {
        // Modo creación: crear nueva boleta
        const nuevaBoleta = UtilsBoleta.convertirFormularioABoleta(datosFormulario);
        await onGuardar(nuevaBoleta);
      }

      Alert.alert(
        'Éxito',
        modoEdicion ? 'Boleta actualizada correctamente' : 'Boleta creada correctamente',
        [
          {
            text: 'OK',
            onPress: onCancelar, // Cerrar formulario después del éxito
          }
        ]
      );
    } catch (error) {
      console.error('Error al guardar boleta:', error);
      Alert.alert(
        'Error',
        'No se pudo guardar la boleta. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setGuardando(false);
    }
  };

  const obtenerFechaMinima = () => {
    const fechaHoy = new Date();
    fechaHoy.setMonth(fechaHoy.getMonth() - 3); // Permitir hasta 3 meses atrás
    return fechaHoy;
  };

  const obtenerFechaMaxima = () => {
    const fechaHoy = new Date();
    fechaHoy.setMonth(fechaHoy.getMonth() + 12); // Permitir hasta 12 meses adelante
    return fechaHoy;
  };

  return (
    <SafeAreaView style={EstilosBase.contenedorPrincipal}>
      <ScrollView 
        style={EstilosBase.contenedorConPadding}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={estilos.header}>
          <Text style={Tipografia.tituloGrande}>
            {modoEdicion ? 'Editar Boleta' : 'Nueva Boleta'}
          </Text>
          <Text style={Tipografia.descripcion}>
            {modoEdicion 
              ? 'Modifica los datos de tu boleta' 
              : 'Ingresa los datos de tu boleta de servicio básico'
            }
          </Text>
        </View>

        <TarjetaBase padding="grande" estiloPersonalizado={{ marginBottom: 24 }}>
          {/* Tipo de Cuenta */}
          <Selector
            tipo="opciones"
            label="Tipo de Cuenta"
            placeholder="Selecciona el tipo de cuenta"
            value={datosFormulario.tipoCuenta}
            onChangeValue={(valor) => actualizarCampo('tipoCuenta', valor)}
            opciones={opcionesTipoCuenta}
            error={errores.tipoCuenta}
            requerido
          />

          {/* Nombre de la Empresa */}
          <InputTexto
            label="Nombre de la Empresa"
            placeholder="Ej: CFE, CMAS, Naturgy"
            value={datosFormulario.nombreEmpresa}
            onChangeText={(texto) => actualizarCampo('nombreEmpresa', texto)}
            error={errores.nombreEmpresa}
            requerido
            icono="business"
            maxLength={100}
            autoCapitalize="words"
          />

          {/* Monto */}
          <InputTexto
            label="Monto"
            placeholder="0.00"
            value={datosFormulario.monto}
            onChangeText={(texto) => actualizarCampo('monto', texto)}
            error={errores.monto}
            requerido
            tipo="numero"
            icono="cash"
          />

          {/* Descripción */}
          <InputTexto
            label="Descripción (Opcional)"
            placeholder="Notas adicionales sobre la boleta"
            value={datosFormulario.descripcion}
            onChangeText={(texto) => actualizarCampo('descripcion', texto)}
            error={errores.descripcion}
            multiline
            numberOfLines={3}
            maxLength={500}
            icono="document-text"
          />
        </TarjetaBase>

        {/* Sección de Fechas */}
        <TarjetaBase padding="grande" estiloPersonalizado={{ marginBottom: 24 }}>
          <Text style={[Tipografia.subtitulo, { marginBottom: 16 }]}>
            Fechas Importantes
          </Text>

          {/* Fecha de Emisión */}
          <Selector
            tipo="fecha"
            label="Fecha de Emisión"
            value={datosFormulario.fechaEmision ? new Date(datosFormulario.fechaEmision) : undefined}
            onChangeValue={(fecha) => actualizarCampo('fechaEmision', fecha.toISOString().split('T')[0])}
            error={errores.fechaEmision}
            requerido
            fechaMinima={obtenerFechaMinima()}
            fechaMaxima={obtenerFechaMaxima()}
          />

          {/* Fecha de Vencimiento */}
          <Selector
            tipo="fecha"
            label="Fecha de Vencimiento"
            value={datosFormulario.fechaVencimiento ? new Date(datosFormulario.fechaVencimiento) : undefined}
            onChangeValue={(fecha) => actualizarCampo('fechaVencimiento', fecha.toISOString().split('T')[0])}
            error={errores.fechaVencimiento}
            requerido
            fechaMinima={datosFormulario.fechaEmision ? new Date(datosFormulario.fechaEmision) : obtenerFechaMinima()}
            fechaMaxima={obtenerFechaMaxima()}
          />

          {/* Fecha de Corte */}
          <Selector
            tipo="fecha"
            label="Fecha de Corte (Opcional)"
            value={datosFormulario.fechaCorte ? new Date(datosFormulario.fechaCorte) : undefined}
            onChangeValue={(fecha) => actualizarCampo('fechaCorte', fecha.toISOString().split('T')[0])}
            error={errores.fechaCorte}
            requerido={false}
            fechaMinima={datosFormulario.fechaVencimiento ? new Date(datosFormulario.fechaVencimiento) : obtenerFechaMinima()}
            fechaMaxima={obtenerFechaMaxima()}
          />

          {/* Fecha de Próxima Lectura */}
          <Selector
            tipo="fecha"
            label="Fecha de Próxima Lectura"
            value={datosFormulario.fechaProximaLectura ? new Date(datosFormulario.fechaProximaLectura) : undefined}
            onChangeValue={(fecha) => actualizarCampo('fechaProximaLectura', fecha.toISOString().split('T')[0])}
            error={errores.fechaProximaLectura}
            requerido
            fechaMinima={datosFormulario.fechaVencimiento ? new Date(datosFormulario.fechaVencimiento) : obtenerFechaMinima()}
            fechaMaxima={obtenerFechaMaxima()}
          />
        </TarjetaBase>

        {/* Botones de Acción */}
        <View style={estilos.botonesContainer}>
          <BotonPrimario
            titulo="Cancelar"
            tipo="secundario"
            onPress={onCancelar}
            ancho="ajustado"
            estiloPersonalizado={{ flex: 1, marginRight: 8 }}
            deshabilitado={guardando}
          />
          <BotonPrimario
            titulo={modoEdicion ? 'Actualizar' : 'Guardar'}
            onPress={manejarGuardar}
            ancho="ajustado"
            estiloPersonalizado={{ flex: 2, marginLeft: 8 }}
            cargando={guardando}
            deshabilitado={guardando}
          />
        </View>

        {/* Espacio adicional para el scroll */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  botonesContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 24,
  },
});