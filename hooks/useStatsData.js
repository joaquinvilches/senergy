import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import moment from 'moment';
import { getCurrentUser } from '../services/authService';
import { getUserMeters, getMeterReadings } from '../services/meterService';
import { safeToDate } from '../utils/dateHelpers';
import { useDarkMode } from '../utils/darkModeContext';

// Colores para medidores en modo claro
const COLORS_LIGHT = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
// Colores para medidores en modo oscuro (más brillantes)
const COLORS_DARK = ['#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F472B6', '#22D3EE'];

// Genera un color consistente basado en un string (meterId)
const getConsistentColor = (str, isDark = false) => {
  const colors = isDark ? COLORS_DARK : COLORS_LIGHT;
  // Hash simple del string para obtener un índice consistente
  const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

/**
 * Hook personalizado para manejar la carga de datos de estadísticas
 *
 * @returns {object} { meters, allReadings, loading, isFetching, refetch }
 */
export const useStatsData = () => {
  const { isDark } = useDarkMode();
  const [meters, setMeters] = useState([]);
  const [allReadings, setAllReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const initialLoadRef = useRef(true);

  // Carga inicial de medidores y lecturas
  // OPTIMIZACIÓN: Cargamos todas las lecturas de todos los medidores una sola vez
  // y luego filtramos en memoria. Esto es más eficiente que hacer múltiples llamadas
  // a la base de datos cada vez que el usuario cambia el filtro de medidor.
  const fetchAll = useCallback(async () => {
    try {
      if (initialLoadRef.current) setLoading(true);

      // Validar que getCurrentUser existe
      if (typeof getCurrentUser !== 'function') {
        console.error('getCurrentUser no está disponible');
        if (initialLoadRef.current) setLoading(false);
        setIsFetching(false);
        return;
      }

      const user = getCurrentUser();
      if (!user?.uid) {
        if (initialLoadRef.current) setLoading(false);
        setIsFetching(false);
        return;
      }

      const userMeters = await getUserMeters(user.uid);
      if (!userMeters || userMeters.length === 0) {
        setMeters([]);
        setAllReadings([]);
        return;
      }

      setMeters(userMeters);

      const byMeter = await Promise.all(
        userMeters.map(async (m) => {
          const readings = await getMeterReadings(user.uid, m.id);
          return readings.map((r) => ({
            ...r,
            meterId: m.id,
            meterName: m.name,
            meterColor: m.color || getConsistentColor(m.id, isDark),
          }));
        })
      );

      const merged = byMeter.flat();
      setAllReadings(merged);
    } catch (e) {
      console.error('Error loading stats:', e);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
      setIsFetching(false);
      initialLoadRef.current = false;
    }
  }, [isDark]); // Agregar isDark como dependencia

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    meters,
    allReadings,
    loading,
    isFetching,
    refetch: fetchAll,
  };
};