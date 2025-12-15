import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useDarkMode } from '../utils/darkModeContext';
import moment from 'moment';
import 'moment/locale/es';
import { exportMeterReadingsToCSV } from '../services/exportService';
import { showToast } from '../utils/toastUtils';
import { SPACING, TYPOGRAPHY, RADIUS, ELEVATION } from '../constants/theme';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import { useSubscription } from '../hooks/useSubscription';
import { Paywall } from '../components/Paywall';

// Hooks personalizados
import { useMeterReadings } from '../hooks/useMeterReadings';

// Componentes
import { MeterSelector } from '../components/MeterSelector';
import { MeterInfoCard } from '../components/MeterInfoCard';
import { GeneralStatsCard } from '../components/GeneralStatsCard';
import { MonthSelector } from '../components/MonthSelector';
import { MonthStatsCard } from '../components/MonthStatsCard';
import { ReadingItem } from '../components/ReadingItem';

// Utils
import { compareMonths, filterReadingsByMonth } from '../utils/readingsCalculations';

moment.locale('es');

export const MeterDetailScreen = ({ navigation }) => {
  const { colors } = useDarkMode();
  const { checkCanExport } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

const {
  meters,
  selectedMeterId,
  readings,
  loading,
  stats,
  monthlyStats,
  selectedMonth,
  loadMeters,
  handleSelectMeter,
  handleSelectMonth,
  handleDeleteReading,
  handleEditReading,
} = useMeterReadings();

  useFocusEffect(
    React.useCallback(() => {
      loadMeters();
    }, [loadMeters])
  );

  // Datos derivados
  const selectedMeter = meters.find((m) => m.id === selectedMeterId);
  const availableMonths = Object.keys(monthlyStats).sort().reverse();
  const currentMonthData = monthlyStats[selectedMonth] || { consumption: 0, cost: 0 };
  
  const previousMonth = moment(selectedMonth).subtract(1, 'month').format('YYYY-MM');
  const comparison = compareMonths(monthlyStats, selectedMonth, previousMonth);

  const filteredReadings = filterReadingsByMonth(readings, selectedMonth);

  // Manejo de exportación
  const handleExport = async () => {
    try {
      // VERIFICAR SI PUEDE EXPORTAR (solo Premium)
      const canExport = await checkCanExport();
      if (!canExport) {
        setShowPaywall(true);
        return;
      }

      if (!selectedMeter) {
        Alert.alert('Error', 'No hay medidor seleccionado');
        return;
      }

      if (!readings || readings.length === 0) {
        Alert.alert('Sin datos', 'No hay lecturas para exportar');
        return;
      }

      await exportMeterReadingsToCSV(selectedMeter.name, readings);
      showToast('Lecturas exportadas correctamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      Alert.alert('Error', 'No se pudo exportar las lecturas. Intenta de nuevo.');
    }
  };

  // Loading inicial
  if (loading && meters.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Selector de medidor */}
      <MeterSelector
        meters={meters}
        selectedMeterId={selectedMeterId}
        onSelectMeter={handleSelectMeter}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Información del medidor */}
        <MeterInfoCard meter={selectedMeter} colors={colors} onBudgetUpdated={loadMeters} />

        {/* Estadísticas generales */}
        {stats && readings.length > 1 && (
          <GeneralStatsCard stats={stats} colors={colors} />
        )}

        {/* Botón de exportación */}
        {readings.length > 0 && (
          <View style={styles.exportButtonContainer}>
            <Button
              title="Exportar Lecturas (CSV)"
              onPress={handleExport}
              variant="secondary"
              size="md"
              iconLeft="download-outline"
              fullWidth
            />
          </View>
        )}

        {/* Selector de mes */}
        <MonthSelector
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          onSelectMonth={handleSelectMonth}
          colors={colors}
        />

        {/* Estadísticas del mes */}
        <MonthStatsCard
          selectedMonth={selectedMonth}
          currentMonthData={currentMonthData}
          comparison={comparison}
          colors={colors}
        />

        {/* Lista de lecturas del mes */}
        <View style={styles.readingsHeader}>
          <Text style={[styles.readingsTitle, { color: colors.PRIMARY }]}>
            Lecturas de {moment(selectedMonth).format('MMMM')}
          </Text>
        </View>

        {filteredReadings.length > 0 ? (
          [...filteredReadings].reverse().map((reading, index) => {
            const originalIndex = readings.findIndex((r) => r.id === reading.id);
            const isInitial = originalIndex === 0;

            return (
              <ReadingItem
                key={reading.id}
                item={reading}
                isInitial={isInitial}
                colors={colors}
                onDelete={handleDeleteReading}
                onEdit={handleEditReading}
              />
            );
          })
        ) : (
          <View style={styles.noReadingsBox}>
            <Text style={[styles.noReadingsText, { color: colors.TEXT_LIGHT }]}>
              No hay lecturas registradas en este mes
            </Text>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Botón flotante */}
      {selectedMeterId && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.PRIMARY }]}
          onPress={() => navigation.navigate('NewReading', { meterId: selectedMeterId })}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={20} color="#FFFFFF" style={styles.fabIcon} />
          <Text style={styles.fabText}>Nueva lectura</Text>
        </TouchableOpacity>
      )}

      {/* Paywall para upgrade a Premium */}
      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={() => {
          setShowPaywall(false);
          navigation.navigate('Pricing', {
            feature: 'exportación a Excel',
            onUpgrade: () => {
              // Después de activar premium, cerrar Pricing
              navigation.goBack();
            },
          });
        }}
        feature="exportación a Excel"
        reason="La exportación de datos está disponible solo en el plan Premium"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readingsHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  readingsTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  noReadingsBox: {
    marginHorizontal: SPACING.md,
    paddingVertical: SPACING['2xl'],
    alignItems: 'center',
  },
  noReadingsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md + 2,
    ...ELEVATION.lg,
  },
  fabIcon: {
    marginRight: SPACING.sm,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  spacer: {
    height: SPACING['6xl'],
  },
  exportButtonContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
});