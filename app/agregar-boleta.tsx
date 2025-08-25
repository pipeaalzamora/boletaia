/**
 * Pantalla Agregar Boleta - Para crear nuevas boletas
 */

import React from 'react';
import { useRouter } from 'expo-router';

import { FormularioBoleta } from '../components/FormularioBoleta';
import { useBoletasContext } from '../context/BoletasContext';
import { NuevaBoleta } from '../types';

export default function AgregarBoletaScreen() {
  const router = useRouter();
  const { agregarBoleta } = useBoletasContext();

  const manejarGuardar = async (nuevaBoleta: NuevaBoleta) => {
    try {
      await agregarBoleta(nuevaBoleta);
    } catch (error) {
      console.error('Error al agregar boleta:', error);
      throw error; // Re-lanzar para que el formulario maneje el error
    }
  };

  const manejarCancelar = () => {
    router.back();
  };

  return (
    <FormularioBoleta
      onGuardar={manejarGuardar}
      onCancelar={manejarCancelar}
      modoEdicion={false}
    />
  );
}