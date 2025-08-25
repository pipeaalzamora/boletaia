/**
 * Pantalla Dashboard - Pantalla principal de BoletaIA
 * Muestra el grid de boletas y botón flotante para agregar nuevas
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TarjetaBoleta as TarjetaBoletaComponent } from '../../components/TarjetaBoleta';
import { BotonPrimario } from '../../components/ui/BotonPrimario';
import { TarjetaBase } from '../../components/ui/TarjetaBase';
import { Colores } from '../../constants/Colors';
import { EstilosBase } from '../../constants/EstilosBase';
import { Tipografia } from '../../constants/Tipografia';
import { useBoletasContext } from '../../context/BoletasContext';
import { BoletaInterface } from '../../types';
import { UtilsBoleta } from '../../utils/validaciones';

export default function DashboardScreen() {
  const router = useRouter();
  const { 
    boletas, 
    boletasCargando, 
    error, 
    usuario,
    marcarComoPagada,
    eliminarBoleta,
    setError 
  } = useBoletasContext();

  const manejarEditarBoleta = (boleta: BoletaInterface) => {
    router.push({
      pathname: '/editar-boleta',
      params: { boletaId: boleta.id }
    });
  };

  const manejarMarcarPagada = async (id: string) => {
    try {
      await marcarComoPagada(id);
      console.log('Boleta marcada como pagada:', id);
    } catch (error) {
      console.error('Error al marcar como pagada:', error);
    }
  };

  const manejarEliminarBoleta = async (id: string) => {
    try {
      await eliminarBoleta(id);
      console.log('Boleta eliminada:', id);
    } catch (error) {
      console.error('Error al eliminar boleta:', error);
    }
  };

  const obtenerEstadisticasRapidas = () => {
    const pendientes = boletas.filter(b => !b.estaPagada);
    const montoPendiente = pendientes.reduce((total, boleta) => total + boleta.monto, 0);
    const vencidas = pendientes.filter(b => {
      const estadoCalculado = UtilsBoleta.calcularEstadoBoleta(b);
      return estadoCalculado.diasRestantes < 0;
    });

    return {
      totalBoletas: boletas.length,
      pendientes: pendientes.length,
      vencidas: vencidas.length,
      montoPendiente,
    };
  };

  const manejarAgregarBoleta = () => {
    router.push('/agregar-boleta');
  };

  if (boletasCargando) {
    return (
      <SafeAreaView style={EstilosBase.contenedorCentrado}>
        <Text style={Tipografia.titulo}>Cargando boletas...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={EstilosBase.contenedorConPadding}>
        <Text style={[Tipografia.titulo, { color: Colores.rojo, textAlign: 'center' }]}>
          {error}
        </Text>
        <BotonPrimario
          titulo="Reintentar"
          onPress={() => setError(null)}
          estiloPersonalizado={{ marginTop: 20 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={EstilosBase.contenedorPrincipal}>
      <ScrollView 
        style={EstilosBase.contenedorConPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={estilos.header}>
          <View>
            <Text style={Tipografia.tituloGrande}>BoletaIA</Text>
            <Text style={Tipografia.descripcion}>
              Hola {usuario?.nombre || 'Usuario'}, gestiona tus boletas
            </Text>
          </View>
          <TouchableOpacity
            style={estilos.botonPerfil}
            onPress={() => console.log('Ir a configuración')}
          >
            <Ionicons name="person-circle" size={40} color={Colores.naranja} />
          </TouchableOpacity>
        </View>

        {/* Estadísticas rápidas */}
        {boletas.length > 0 && (
          <View style={estilos.estadisticasContainer}>
            <View style={estilos.estadisticaItem}>
              <Text style={Tipografia.titulo}>{obtenerEstadisticasRapidas().totalBoletas}</Text>
              <Text style={Tipografia.pequeno}>Total</Text>
            </View>
            <View style={estilos.estadisticaItem}>
              <Text style={[Tipografia.titulo, { color: Colores.naranja }]}>
                {obtenerEstadisticasRapidas().pendientes}
              </Text>
              <Text style={Tipografia.pequeno}>Pendientes</Text>
            </View>
            <View style={estilos.estadisticaItem}>
              <Text style={[Tipografia.titulo, { color: Colores.rojo }]}>
                {obtenerEstadisticasRapidas().vencidas}
              </Text>
              <Text style={Tipografia.pequeno}>Vencidas</Text>
            </View>
            <View style={estilos.estadisticaItem}>
              <Text style={[Tipografia.titulo, { color: Colores.verde }]}>
                {UtilsBoleta.formatearMonto(obtenerEstadisticasRapidas().montoPendiente)}
              </Text>
              <Text style={Tipografia.pequeno}>Pendiente</Text>
            </View>
          </View>
        )}
        {/* Lista de boletas */}
        <View style={estilos.seccionBoletas}>
          <Text style={Tipografia.subtitulo}>Mis Boletas</Text>
          
          {boletas.length === 0 ? (
            <TarjetaBase estiloPersonalizado={estilos.tarjetaVacia}>
              <Ionicons name="document-text-outline" size={48} color={Colores.textoGrisMedio} />
              <Text style={[Tipografia.cuerpo, { textAlign: 'center', marginTop: 16 }]}>
                No tienes boletas registradas
              </Text>
              <Text style={[Tipografia.pequeno, { textAlign: 'center', marginTop: 8 }]}>
                Presiona el botón + para agregar tu primera boleta
              </Text>
            </TarjetaBase>
          ) : (
            <View style={estilos.gridBoletas}>
              {boletas.map(boleta => (
                <TarjetaBoletaComponent
                  key={boleta.id}
                  boleta={boleta}
                  onMarcarPagado={manejarMarcarPagada}
                  onEditar={manejarEditarBoleta}
                  onEliminar={manejarEliminarBoleta}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botón flotante para agregar boleta */}
      <TouchableOpacity
        style={EstilosBase.botonFlotante}
        onPress={manejarAgregarBoleta}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colores.textoBlanco} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  botonPerfil: {
    padding: 4,
  },
  estadisticasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  estadisticaItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colores.fondoTarjeta,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colores.bordeOscuro,
  },
  seccionBoletas: {
    marginBottom: 100, // Espacio para el botón flotante
  },
  gridBoletas: {
    marginTop: 16,
  },
  tarjetaBoleta: {
    marginBottom: 16,
  },
  tarjetaVacia: {
    alignItems: 'center',
    padding: 32,
    marginTop: 16,
  },
});