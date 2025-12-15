import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import moment from 'moment';
import { getCurrentUser } from '../services/authService';
import { getUserMeters, getMeterReadings, deleteReading, updateReading, updateMeter } from '../services/meterService';
import { calculateStats } from '../utils/calculations';
import { calculateReadingsConsumption, groupReadingsByMonth } from '../utils/readingsCalculations';
import { showToast } from '../utils/toastUtils';

// Límite de concurrencia para updates masivos
const CONCURRENT_UPDATES_LIMIT = 5;

/**
 * Ejecuta promesas en lotes con límite de concurrencia
 */
const promiseAllWithLimit = async (promises, limit) => {
  const results = [];
  for (let i = 0; i < promises.length; i += limit) {
    const batch = promises.slice(i, i + limit);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }
  return results;
};

/**
 * Hook personalizado para manejar lecturas de medidores
 */
export const useMeterReadings = () => {
  const [meters, setMeters] = useState([]);
  const [selectedMeterId, setSelectedMeterId] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));
  const isMountedRef = useRef(true);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadReadings = useCallback(async (meterId) => {
    try {
      const user = getCurrentUser();
      if (!user?.uid || !isMountedRef.current) return;

      const meterReadings = await getMeterReadings(user.uid, meterId);
      if (!isMountedRef.current) return;

      const readingsWithConsumption = calculateReadingsConsumption(meterReadings);

      if (!isMountedRef.current) return;

      setReadings(readingsWithConsumption);
      setStats(calculateStats(readingsWithConsumption.slice(1)));

      const monthlyData = groupReadingsByMonth(readingsWithConsumption);
      setMonthlyStats(monthlyData);

      setSelectedMonth(moment().format('YYYY-MM'));
    } catch (error) {
      console.error('Error loading readings:', error);
      if (isMountedRef.current) {
        Alert.alert('Error', 'No se pudieron cargar las lecturas');
      }
    }
  }, []);

  const loadMeters = useCallback(async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (!user || !isMountedRef.current) {
        setLoading(false);
        return;
      }

      const userMeters = await getUserMeters(user.uid);
      if (!isMountedRef.current) return;

      setMeters(userMeters);
      if (userMeters.length > 0 && isMountedRef.current) {
        setSelectedMeterId(userMeters[0].id);
        await loadReadings(userMeters[0].id);
      }
    } catch (error) {
      console.error('Error loading meters:', error);
      if (isMountedRef.current) {
        Alert.alert('Error', 'No se pudieron cargar los medidores');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [loadReadings]);


  const handleSelectMeter = async (meterId) => {
    setSelectedMeterId(meterId);
    await loadReadings(meterId);
  };

  const handleSelectMonth = (month) => {
    setSelectedMonth(month);
  };

  const handleDeleteReading = async (readingId) => {
    try {
      const user = getCurrentUser();

      // Encontrar el índice de la lectura a eliminar
      const deletedIndex = readings.findIndex(r => r.id === readingId);

      // Eliminar lectura de Firebase
      await deleteReading(user.uid, selectedMeterId, readingId);

      // Filtrar localmente
      const updatedReadings = readings.filter(r => r.id !== readingId);

      // Recalcular consumos para TODAS las lecturas
      const readingsWithConsumption = calculateReadingsConsumption(updatedReadings);

      // CRÍTICO: Actualizar en Firebase TODAS las lecturas posteriores a la eliminada
      // porque sus consumos han cambiado
      const updatePromises = [];
      for (let i = deletedIndex; i < readingsWithConsumption.length; i++) {
        const reading = readingsWithConsumption[i];
        updatePromises.push(
          updateReading(user.uid, selectedMeterId, reading.id, {
            consumption: reading.consumption,
            cost: reading.cost,
          })
        );
      }

      // Esperar a que todas las actualizaciones se completen (con límite de concurrencia)
      await promiseAllWithLimit(updatePromises, CONCURRENT_UPDATES_LIMIT);

      // Actualizar estados
      setReadings(readingsWithConsumption);
      setStats(calculateStats(readingsWithConsumption.slice(1)));

      const monthlyData = groupReadingsByMonth(readingsWithConsumption);
      setMonthlyStats(monthlyData);

      // Actualizar el lastReading del medidor si es necesario
      if (readingsWithConsumption.length > 0) {
        const lastReading = readingsWithConsumption[readingsWithConsumption.length - 1];
        await updateMeter(user.uid, selectedMeterId, {
          lastReading: lastReading.value,
          lastCost: lastReading.consumption * lastReading.costPerKwh,
        });

        // Actualizar lista de medidores localmente
        setMeters(prevMeters =>
          prevMeters.map(m =>
            m.id === selectedMeterId
              ? {
                  ...m,
                  lastReading: lastReading.value,
                  lastCost: lastReading.consumption * lastReading.costPerKwh
                }
              : m
          )
        );
      }

      showToast('Lectura eliminada y datos recalculados', 'success');
    } catch (error) {
      console.error('Error deleting reading:', error);
      Alert.alert('Error', 'No se pudo eliminar la lectura: ' + error.message);
    }
  };

  const handleEditReading = async (readingId, newValue) => {
    try {
      const user = getCurrentUser();

      // Encontrar la lectura que se está editando
      const readingIndex = readings.findIndex(r => r.id === readingId);
      if (readingIndex === -1) {
        throw new Error('Lectura no encontrada');
      }

      // Crear la lectura actualizada
      const updatedReadings = [...readings];
      updatedReadings[readingIndex] = {
        ...updatedReadings[readingIndex],
        value: newValue
      };

      // Recalcular consumos con el nuevo valor para TODAS las lecturas
      const readingsWithConsumption = calculateReadingsConsumption(updatedReadings);

      // CRÍTICO: Actualizar en Firebase la lectura editada Y todas las posteriores
      // porque al cambiar una lectura, los consumos siguientes también cambian
      const updatePromises = [];

      // Actualizar la lectura editada con su nuevo valor
      const editedReading = readingsWithConsumption[readingIndex];
      updatePromises.push(
        updateReading(user.uid, selectedMeterId, readingId, {
          value: editedReading.value,
          consumption: editedReading.consumption,
          cost: editedReading.cost,
          costPerKwh: editedReading.costPerKwh
        })
      );

      // Actualizar todas las lecturas POSTERIORES porque sus consumos cambiaron
      for (let i = readingIndex + 1; i < readingsWithConsumption.length; i++) {
        const reading = readingsWithConsumption[i];
        updatePromises.push(
          updateReading(user.uid, selectedMeterId, reading.id, {
            consumption: reading.consumption,
            cost: reading.cost,
          })
        );
      }

      // Esperar a que todas las actualizaciones se completen (con límite de concurrencia)
      await promiseAllWithLimit(updatePromises, CONCURRENT_UPDATES_LIMIT);

      // Actualizar estados locales
      setReadings(readingsWithConsumption);
      setStats(calculateStats(readingsWithConsumption.slice(1)));

      const monthlyData = groupReadingsByMonth(readingsWithConsumption);
      setMonthlyStats(monthlyData);

      // Actualizar el lastReading del medidor si es la última lectura
      if (readingIndex === readingsWithConsumption.length - 1) {
        const lastReading = readingsWithConsumption[readingIndex];
        await updateMeter(user.uid, selectedMeterId, {
          lastReading: lastReading.value,
          lastCost: lastReading.consumption * lastReading.costPerKwh,
        });

        // Actualizar lista de medidores localmente
        setMeters(prevMeters =>
          prevMeters.map(m =>
            m.id === selectedMeterId
              ? {
                  ...m,
                  lastReading: lastReading.value,
                  lastCost: lastReading.consumption * lastReading.costPerKwh
                }
              : m
          )
        );
      }

      showToast('Lectura actualizada y datos recalculados', 'success');
    } catch (error) {
      console.error('Error editing reading:', error);
      Alert.alert('Error', 'No se pudo actualizar la lectura: ' + error.message);
    }
  };

  return {
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
  };
};