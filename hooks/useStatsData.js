import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import moment from 'moment';
import { getCurrentUser } from '../services/authService';
import { getUserMeters, getMeterReadings } from '../services/meterService';
import { toJSDate } from '../utils/statsCalculations';

// Colores para medidores en modo claro
const COLORS_LIGHT = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
// Colores para medidores en modo oscuro (más brillantes)
const COLORS_DARK = ['#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F472B6', '#22D3EE'];

const getRandomColor = (isDark = false) => {
  const colors = isDark ? COLORS_DARK : COLORS_LIGHT;
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Hook personalizado para manejar la carga y filtrado de datos de estadísticas
 *
 * @param {string} selectedPeriod - 'week' | 'month' | 'year'
 * @param {string} selectedMeter - 'all' | meterId específico
 * @returns {object} { meters, allReadings, filteredReadings, loading, isFetching }
 */
export const useStatsData = (selectedPeriod, selectedMeter) => {
  const [meters, setMeters] = useState([]);
  const [allReadings, setAllReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const initialLoadRef = useRef(true);

  // Carga inicial de medidores y lecturas
  const fetchAll = useCallback(async () => {
    try {
      if (initialLoadRef.current) setLoading(true);

      const user = getCurrentUser?.();
      if (!user?.uid) {
        if (initialLoadRef.current) setLoading(false);
        return;
      }

      const userMeters = await getUserMeters(user.uid);
      setMeters(userMeters);

      const byMeter = await Promise.all(
        userMeters.map(async (m) => {
          const readings = await getMeterReadings(user.uid, m.id);
          return readings.map((r) => ({
            ...r,
            meterId: m.id,
            meterName: m.name,
            meterColor: m.color || getRandomColor(),
          }));
        })
      );

      const merged = byMeter.flat();
      setAllReadings(merged);
    } catch (e) {
      console.log('Error loading stats:', e);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
      initialLoadRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Filtrado de lecturas por período y medidor
  const filteredReadings = useMemo(() => {
    if (!initialLoadRef.current) setIsFetching(true);

    let base = selectedMeter === 'all'
      ? allReadings
      : allReadings.filter((r) => r.meterId === selectedMeter);

    const now = moment();
    const inRange = (days) => (r) => moment(toJSDate(r.date)).isAfter(now.clone().subtract(days, 'days'));

    switch (selectedPeriod) {
      case 'week':
        base = base.filter(inRange(7));
        break;
      case 'month':
        base = base.filter(inRange(30));
        break;
      case 'year':
        base = base.filter(inRange(365));
        break;
      default:
        break;
    }

    // Fallback: si hay menos de 2 lecturas, usa las últimas 2 disponibles
    if (base.length < 2) {
      const source = selectedMeter === 'all' ? allReadings : allReadings.filter(r => r.meterId === selectedMeter);
      base = [...source].sort((a, b) => toJSDate(a.date) - toJSDate(b.date)).slice(-2);
    }

    setIsFetching(false);
    return base.sort((a, b) => toJSDate(a.date) - toJSDate(b.date));
  }, [allReadings, selectedMeter, selectedPeriod]);

  return {
    meters,
    allReadings,
    filteredReadings,
    loading,
    isFetching,
    refetch: fetchAll,
  };
};