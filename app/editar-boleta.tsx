/**
 * Pantalla Editar Boleta - Para modificar boletas existentes
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { FormularioBoleta } from '../components/FormularioBoleta';
import { useBoletasContext } from '../context/BoletasContext';
import { BoletaInterface, ActualizacionBoleta } from '../types';
import { EstilosBase } from '../constants/EstilosBase';
import { Tipografia } from '../constants/Tipografia';
import { Colores } from '../constants/Colors';

export default function EditarBoletaScreen() {
  const router = useRouter();
  const { boletaId } = useLocalSearchParams<{ boletaId: string }>();
  const { boletas, actualizarBoleta } = useBoletasContext();
  
  const [boleta, setBoleta] = useState<BoletaInterface | null>(null);

  useEffect(() => {
    if (boletaId) {
      const boletaEncontrada = boletas.find(b => b.id === boletaId);
      setBoleta(boletaEncontrada || null);
    }
  }, [boletaId, boletas]);

  const manejarGuardar = async (datosActualizados: ActualizacionBoleta) => {
    if (!boleta) return;
    
    try {
      await actualizarBoleta(boleta.id, datosActualizados);
    } catch (error) {
      console.error('Error al actualizar boleta:', error);
      throw error; // Re-lanzar para que el formulario maneje el error
    }
  };

  const manejarCancelar = () => {
    router.back();
  };

  if (!boleta) {
    return (
      <View style={EstilosBase.contenedorCentrado}>
        {boletaId ? (
          <>
            <ActivityIndicator size="large" color={Colores.naranja} />
            <Text style={[Tipografia.cuerpo, { marginTop: 16 }]}>
              Cargando boleta...
            </Text>
          </>
        ) : (
          <Text style={[Tipografia.titulo, { color: Colores.rojo, textAlign: 'center' }]}>
            Boleta no encontrada
          </Text>
        )}
      </View>
    );
  }

  return (
    <FormularioBoleta
      boletaInicial={boleta}
      onGuardar={manejarGuardar}
      onCancelar={manejarCancelar}
      modoEdicion={true}
    />
  );
}