/**
 * Pantalla Agregar Boleta - Para crear nuevas boletas
 */

import { useRouter } from "expo-router";
import React from "react";

import { FormularioBoleta } from "../components/FormularioBoleta";
import { useBoletasContext } from "../context/BoletasContext";
import { ActualizacionBoleta, NuevaBoleta } from "../types";

export default function AgregarBoletaScreen() {
  const router = useRouter();
  const { agregarBoleta } = useBoletasContext();

  const manejarGuardar = async (boleta: NuevaBoleta | ActualizacionBoleta) => {
    try {
      // En modo agregar, siempre será NuevaBoleta
      await agregarBoleta(boleta as NuevaBoleta);
    } catch (error) {
      console.error("Error al agregar boleta:", error);
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
