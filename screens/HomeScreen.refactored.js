import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';

// Services
import { getUserMeters, getMeterReadings, deleteMeter } from '../services/meterService';
import { getCurrentUser } from '../services/authService';

// Context
import { useDarkMode } from '../utils/darkModeContext';

// Components
import { HomeHeader } from '../components/home/HomeHeader';
import { MonthlyStatsCard } from '../components/home/MonthlyStatsCard';
import { HomeEmptyState } from '../components/home/HomeEmptyState';
import { MetersList } from '../components/home/MetersList';

// Logging
import { logger, loggers } from '../utils/logger';

/**
 * HomeScreen - Pantalla principal con lista de medidores
 *
 * Refactorizado para mejor mantenibilidad:
 * - Dividido en 4 componentes modulares
 * - Logging estructurado integrado
 * - Mejor separación de responsabilidades
 */
export const HomeScreen = ({ navigation }) => {
  const { colors } = useDarkMode();
  const styles = createStyles(colors);

  // State
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({ totalConsumption: 0, totalCost: 0 });

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  // Focus effect - recargar al volver a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      loadMeters();
    }, [])
  );

  // Animaciones de entrada
  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(statsAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /**
   * Carga medidores del usuario
   */
  const loadMeters = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      const user = getCurrentUser();
      if (!user) {
        logger.warn('No authenticated user found');
        setLoading(false);
        return;
      }

      loggers.performance.start('load_meters');
      const userMeters = await getUserMeters(user.uid);
      loggers.performance.end('load_meters');

      loggers.meter.loaded(userMeters.length);
      setMeters(userMeters);

      // Calcular estadísticas del mes actual
      await calculateMonthlyStats(user.uid, userMeters);
    } catch (error) {
      loggers.meter.error('Failed to load meters', error);
      Alert.alert('Error', 'No se pudieron cargar los medidores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Calcula estadísticas del mes actual
   */
  const calculateMonthlyStats = async (userId, userMeters) => {
    try {
      const currentMonth = moment().format('YYYY-MM');
      let totalConsumption = 0;
      let totalCost = 0;

      for (const meter of userMeters) {
        const readings = await getMeterReadings(userId, meter.id);

        // Filtrar lecturas del mes actual
        const monthReadings = readings.filter(reading => {
          const readingMonth = moment(reading.date.toDate()).format('YYYY-MM');
          return readingMonth === currentMonth;
        });

        // Sumar consumo y costo
        monthReadings.forEach(reading => {
          totalConsumption += reading.consumption || 0;
          totalCost += reading.cost || 0;
        });
      }

      logger.debug('Monthly stats calculated', {
        month: currentMonth,
        totalConsumption,
        totalCost,
      });

      setMonthlyStats({ totalConsumption, totalCost });
    } catch (error) {
      logger.error('Error calculating monthly stats', { error });
    }
  };

  /**
   * Handler para pull-to-refresh
   */
  const handleRefresh = () => {
    logger.debug('Refreshing meters');
    setRefreshing(true);
    loadMeters(true);
  };

  /**
   * Handler para eliminar medidor
   */
  const handleDeleteMeter = (meterId, meterName) => {
    Alert.alert(
      'Eliminar medidor',
      `¿Estás seguro de que deseas eliminar "${meterName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              const user = getCurrentUser();
              await deleteMeter(user.uid, meterId);

              loggers.meter.deleted(meterId);

              setMeters(meters.filter(m => m.id !== meterId));
              Alert.alert('Éxito', 'Medidor eliminado correctamente');

              // Recargar para actualizar stats
              loadMeters();
            } catch (error) {
              loggers.meter.error('Failed to delete meter', error);
              Alert.alert('Error', 'No se pudo eliminar el medidor');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Handler para navegar a detalle del medidor
   */
  const handleMeterPress = (meterId) => {
    logger.debug('Navigating to meter detail', { meterId });
    navigation.navigate('MeterDetail', { meterId });
  };

  /**
   * Handler para crear nuevo medidor
   */
  const handleCreateMeter = () => {
    logger.debug('Navigating to create meter');
    navigation.navigate('RegisterMeter');
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <HomeHeader
        metersCount={meters.length}
        onAddPress={handleCreateMeter}
        animValue={headerAnim}
      />

      {/* Estadísticas del mes (solo si hay medidores) */}
      {meters.length > 0 && (
        <MonthlyStatsCard
          totalConsumption={monthlyStats.totalConsumption}
          totalCost={monthlyStats.totalCost}
          animValue={statsAnim}
        />
      )}

      {/* Lista de medidores o estado vacío */}
      {meters.length > 0 ? (
        <MetersList
          meters={meters}
          onMeterPress={handleMeterPress}
          onMeterDelete={handleDeleteMeter}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <HomeEmptyState onCreateMeter={handleCreateMeter} />
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
