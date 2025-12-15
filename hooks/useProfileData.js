import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getCurrentUser } from '../services/authService';
import { getUserMeters, getMeterReadings } from '../services/meterService';
import { safeToDate, getMonthYear } from '../utils/dateHelpers';
import moment from 'moment';

export const useProfileData = () => {
  const [user, setUser] = useState(null);
  const [savingsData, setSavingsData] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [metersData, setMetersData] = useState({ meters: [], allReadings: [] });
  const isMountedRef = useRef(true);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadUser = useCallback(() => {
    const currentUser = getCurrentUser();
    if (isMountedRef.current) {
      setUser(currentUser);
    }
  }, []);

  const loadSavingsMetrics = useCallback(async () => {
    try {
      if (isMountedRef.current) {
        setLoadingMetrics(true);
      }
      const user = getCurrentUser();
      if (!user || !isMountedRef.current) return;

      const meters = await getUserMeters(user.uid);
      let currentMonthTotal = 0;
      let previousMonthTotal = 0;
      let currentMonthCost = 0;
      let previousMonthCost = 0;
      let allReadings = [];

      const currentMonth = moment().format('YYYY-MM');
      const previousMonth = moment().subtract(1, 'month').format('YYYY-MM');

      for (const meter of meters) {
        const readings = await getMeterReadings(user.uid, meter.id);
        allReadings = [...allReadings, ...readings];

        readings.forEach((reading) => {
          // Validar que la fecha exista y sea válida
          if (!reading.date || !reading.consumption || reading.consumption <= 0) return;

          // Usar helper de fechas seguro
          const readingDate = safeToDate(reading.date);
          if (!readingDate) {
            console.warn('Lectura con fecha inválida:', reading.id);
            return;
          }

          const readingMonth = getMonthYear(reading.date);

          if (readingMonth === currentMonth) {
            currentMonthTotal += reading.consumption;
            currentMonthCost += reading.cost || 0;
          } else if (readingMonth === previousMonth) {
            previousMonthTotal += reading.consumption;
            previousMonthCost += reading.cost || 0;
          }
        });
      }

      const consumptionDiff = previousMonthTotal - currentMonthTotal;
      const costDiff = previousMonthCost - currentMonthCost;
      const savingsPercentage = previousMonthTotal > 0
        ? ((consumptionDiff / previousMonthTotal) * 100).toFixed(1)
        : '0.0';

      if (isMountedRef.current) {
        setSavingsData({
          currentMonthConsumption: currentMonthTotal,
          previousMonthConsumption: previousMonthTotal,
          currentMonthCost: currentMonthCost,
          previousMonthCost: previousMonthCost,
          consumptionDiff,
          costDiff,
          savingsPercentage,
          isSavings: consumptionDiff > 0,
        });
        setMetersData({ meters, allReadings });
      }
    } catch (error) {
      console.error('Error loading savings metrics:', error);
    } finally {
      if (isMountedRef.current) {
        setLoadingMetrics(false);
      }
    }
  }, []);

  useEffect(() => {
    loadUser();
    loadSavingsMetrics();
  }, [loadUser, loadSavingsMetrics]);

  // Calcular métricas adicionales con memoización
  const metrics = useMemo(() => {
    return {
      totalMeters: metersData.meters.length,
      totalReadings: metersData.allReadings.length,
      activeMeters: metersData.meters.filter(m => m.isActive !== false).length,
    };
  }, [metersData]);

  return {
    user,
    savingsData,
    loadingMetrics,
    ...metrics,
  };
};