import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from '../utils/darkModeContext';
import { formatKWh, formatCLP } from '../utils/formatHelpers';
import { exportStatsToCSV } from '../services/exportService';
import { showToast } from '../utils/toastUtils';
import { SPACING, TYPOGRAPHY } from '../constants/theme';
import Icon from '../components/Icon';
import { Animated } from 'react-native';
import { useSubscription } from '../hooks/useSubscription';
import { Paywall } from '../components/Paywall';

// Hooks personalizados
import { useStatsData } from '../hooks/useStatsData';
import { usePeriodFilter } from '../hooks/usePeriodFilter';
import { useInsights } from '../hooks/useInsights';

// Componentes nuevos del rediseño
import { PeriodSelector } from '../components/stats/PeriodSelector';
import { UnitTogglePro } from '../components/stats/UnitTogglePro';
import { MeterFilterChips } from '../components/stats/MeterFilterChips';
import { HeroStatCard } from '../components/stats/HeroStatCard';
import { InsightsCard } from '../components/stats/InsightsCard';
import { ChartsTabView } from '../components/stats/ChartsTabView';
import { DetailedStatsAccordion } from '../components/stats/DetailedStatsAccordion';
import { QuickStatsRow } from '../components/stats/QuickStatsRow';
import { EmptyState } from '../components/stats/EmptyState';

// Utilidades
import { calculateFullStats, groupReadingsByMeter } from '../utils/statsHelpers';

const PREFS_KEY = '@stats_preferences';

export const StatsScreen = () => {
  const { colors, isDark } = useDarkMode();
  const navigation = useNavigation();
  const { checkCanExport } = useSubscription();

  // Estados
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedMeter, setSelectedMeter] = useState('all');
  const [unit, setUnit] = useState('$'); // Empezar con $ (dinero) por defecto
  const [isExporting, setIsExporting] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Datos de medidores y lecturas
  const { meters, allReadings, loading, isFetching } = useStatsData();

  // Cargar preferencias guardadas al montar el componente
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedPrefs = await AsyncStorage.getItem(PREFS_KEY);
        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs);
          if (prefs.period) setSelectedPeriod(prefs.period);
          if (prefs.unit) setUnit(prefs.unit);
          // No restaurar selectedMeter automáticamente para evitar confusión
        }
      } catch (error) {
        console.error('Error al cargar preferencias:', error);
      } finally {
        setPrefsLoaded(true);
      }
    };

    loadPreferences();
  }, []);

  // Guardar preferencias cuando cambian
  useEffect(() => {
    if (!prefsLoaded) return; // No guardar hasta que se hayan cargado las preferencias iniciales

    const savePreferences = async () => {
      try {
        const prefs = {
          period: selectedPeriod,
          unit: unit,
        };
        await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      } catch (error) {
        console.error('Error al guardar preferencias:', error);
      }
    };

    savePreferences();
  }, [selectedPeriod, unit, prefsLoaded]);

  // Filtrar lecturas por medidor con memoización optimizada
  const meterFilteredReadings = useMemo(() => {
    if (!allReadings || allReadings.length === 0) return [];
    if (selectedMeter === 'all') return allReadings;
    return allReadings.filter(r => r.meterId === selectedMeter);
  }, [allReadings, selectedMeter]);

  // Usar hook de filtro de período
  const {
    currentPeriodReadings,
    previousPeriodReadings,
    periodLabel,
    dateRangeLabel,
    daysInPeriod,
    comparison,
    hasCurrentData,
  } = usePeriodFilter(meterFilteredReadings, selectedPeriod);

  // Calcular estadísticas completas
  const stats = useMemo(() => {
    if (!currentPeriodReadings || currentPeriodReadings.length === 0) {
      return {
        totalConsumption: 0,
        totalCost: 0,
        averageConsumption: 0,
        averageCost: 0,
        peakConsumption: 0,
        minConsumption: 0,
        count: 0,
        trend: 'neutral',
        avgDaysBetweenReadings: 0,
      };
    }
    return calculateFullStats(currentPeriodReadings);
  }, [currentPeriodReadings]);

  // Generar insights inteligentes
  const insights = useInsights(
    currentPeriodReadings,
    comparison,
    null, // monthlyBudget - podría agregarse más adelante
    daysInPeriod
  );

  // Datos para gráfico de torta (distribución por medidor)
  const pieData = useMemo(() => {
    if (selectedMeter !== 'all' || !currentPeriodReadings || currentPeriodReadings.length === 0) {
      return [];
    }

    const byMeter = groupReadingsByMeter(currentPeriodReadings);
    const total = Object.values(byMeter).reduce((sum, readings) => {
      const value = readings.reduce((s, r) => s + (unit === 'kWh' ? r.consumption : r.cost), 0);
      return sum + value;
    }, 0);

    if (total === 0) return [];

    return Object.entries(byMeter).map(([name, readings]) => {
      const value = readings.reduce((sum, r) => sum + (unit === 'kWh' ? r.consumption : r.cost), 0);
      return {
        name,
        value,
        percentage: ((value / total) * 100).toFixed(1),
      };
    });
  }, [currentPeriodReadings, selectedMeter, unit]);

  // Contar lecturas por medidor para los badges
  const readingsCounts = useMemo(() => {
    if (!currentPeriodReadings || currentPeriodReadings.length === 0) return {};
    const counts = {};
    currentPeriodReadings.forEach(reading => {
      const meterId = reading.meterId;
      counts[meterId] = (counts[meterId] || 0) + 1;
    });
    return counts;
  }, [currentPeriodReadings]);

  // Animación de entrada
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animateEntry = useCallback(() => {
    animatedValue.setValue(0);
    Animated.spring(animatedValue, {
      toValue: 1,
      tension: 25,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [animatedValue]);

  useFocusEffect(
    useCallback(() => {
      animateEntry();
    }, [animateEntry])
  );

  // Manejo de exportación con feedback visual
  const handleExport = async () => {
    try {
      // VERIFICAR SI PUEDE EXPORTAR (solo Premium)
      const canExport = await checkCanExport();
      if (!canExport) {
        setShowPaywall(true);
        return;
      }

      if (!currentPeriodReadings || currentPeriodReadings.length === 0) {
        Alert.alert('Sin datos', 'No hay lecturas para exportar');
        return;
      }

      setIsExporting(true);
      await exportStatsToCSV(currentPeriodReadings, periodLabel, stats);
      showToast('Estadísticas exportadas correctamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      Alert.alert('Error', 'No se pudo exportar las estadísticas. Intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  // Valor para el Hero Card
  const heroValue = useMemo(() => {
    if (unit === 'kWh') {
      return formatKWh(stats.totalConsumption, 0);
    }
    return formatCLP(stats.totalCost);
  }, [unit, stats]);

  const heroLabel = useMemo(() => {
    return unit === 'kWh' ? 'Consumo en el período' : 'Gasto en el período';
  }, [unit]);

  const heroComparison = useMemo(() => {
    if (!comparison) return null;
    return unit === 'kWh' ? comparison.consumptionChange : comparison.costChange;
  }, [unit, comparison]);

  // Loading inicial
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
          <Text style={[styles.loadingText, { color: colors.TEXT_LIGHT }]}>
            Cargando estadísticas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Estado vacío - sin lecturas
  if (!allReadings || allReadings.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <EmptyState variant="no-readings" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Header con título y botón de exportar */}
      <View style={[styles.header, { backgroundColor: colors.CARD }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.TEXT_DARK }]}>
            Estadísticas
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.TEXT_LIGHT }]}>
            {dateRangeLabel}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.exportButton,
            { backgroundColor: isExporting ? colors.TEXT_LIGHT : colors.PRIMARY }
          ]}
          onPress={handleExport}
          activeOpacity={0.7}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Icon name="file-export-outline" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Selector de período */}
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />

        {/* Selector de medidor */}
        <MeterFilterChips
          meters={meters}
          selectedMeter={selectedMeter}
          onMeterChange={setSelectedMeter}
          readingsCounts={readingsCounts}
        />

        {/* Toggle de unidad (kWh vs $) */}
        <UnitTogglePro
          selectedUnit={unit}
          onUnitChange={setUnit}
        />

        {/* Mensaje si no hay datos en el período */}
        {!hasCurrentData ? (
          <EmptyState
            variant={selectedMeter !== 'all' ? 'no-meter-data' : 'no-period-data'}
          />
        ) : (
          <>
            {/* Hero Card con valor principal */}
            <HeroStatCard
              value={heroValue}
              label={heroLabel}
              comparison={heroComparison}
              unit={unit}
              animatedValue={animatedValue}
            />

            {/* Panel de insights inteligentes */}
            <InsightsCard
              insights={insights}
              animatedValue={animatedValue}
            />

            {/* Stats rápidas */}
            <QuickStatsRow stats={stats} />

            {/* Sistema de tabs para gráficos */}
            <ChartsTabView
              data={currentPeriodReadings}
              pieData={pieData}
              unit={unit}
              isDark={isDark}
              colors={colors}
              showPieChart={pieData.length > 1}
            />

            {/* Acordeón con estadísticas detalladas */}
            <DetailedStatsAccordion stats={stats} />

            {/* Resumen de medidores */}
            {meters.length > 1 && (
              <View style={[styles.metersContainer, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
                <Text style={[styles.sectionTitle, { color: colors.TEXT_DARK }]}>
                  Resumen de Medidores
                </Text>
                {meters.map((meter) => (
                  <TouchableOpacity
                    key={meter.id}
                    style={[
                      styles.meterRow,
                      {
                        backgroundColor: colors.BACKGROUND,
                        borderLeftColor: meter.color || colors.ACCENT,
                      },
                    ]}
                    onPress={() => setSelectedMeter(meter.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.meterInfo}>
                      <Text style={[styles.meterName, { color: colors.TEXT_DARK }]} numberOfLines={1}>
                        {meter.name}
                      </Text>
                      <Text style={[styles.meterCompany, { color: colors.TEXT_LIGHT }]} numberOfLines={1}>
                        {meter.company}
                      </Text>
                    </View>
                    <View style={styles.meterStats}>
                      <Text style={[styles.meterReading, { color: colors.PRIMARY }]} numberOfLines={1}>
                        {formatKWh(meter.lastReading, 0)}
                      </Text>
                      <Text style={[styles.meterCost, { color: colors.TEXT_LIGHT }]} numberOfLines={1}>
                        {formatCLP(meter.lastCost)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Indicador de carga intermedio */}
      {isFetching && (
        <View style={[styles.fetchingIndicator, { backgroundColor: colors.PRIMARY }]}>
          <ActivityIndicator size="small" color="#FFFFFF" />
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs / 2,
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['4xl'],
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  emptyIcon: {
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: TYPOGRAPHY.sizes.base * 1.5,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  noDataContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingVertical: SPACING['3xl'],
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.lg,
    alignItems: 'center',
  },
  noDataIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.5,
  },
  noDataText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
  metersContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    padding: SPACING.md,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
  },
  meterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingLeft: SPACING.md,
    paddingRight: SPACING.sm,
    borderLeftWidth: 4,
    borderRadius: SPACING.md,
    marginBottom: SPACING.sm,
  },
  meterInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  meterName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs / 2,
  },
  meterCompany: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  meterStats: {
    alignItems: 'flex-end',
  },
  meterReading: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs / 2,
  },
  meterCost: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  spacer: {
    height: SPACING['3xl'],
  },
  fetchingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
