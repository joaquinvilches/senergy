import { useState, useCallback, useRef, useEffect } from 'react';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { logger } from '../utils/logger';
import { calculateReadingsConsumption } from '../utils/readingsCalculations';
import { cacheService, CACHE_KEYS, CACHE_TTL } from '../services/cacheService';

const PAGE_SIZE = 20; // Lecturas por página

/**
 * Hook para manejar lecturas paginadas
 *
 * Características:
 * - Paginación automática con Firestore
 * - Infinite scroll ready
 * - Caché integrado
 * - Performance optimizada
 *
 * Uso:
 * const {
 *   readings,
 *   loading,
 *   hasMore,
 *   loadMore,
 *   refresh
 * } = usePaginatedReadings(userId, meterId);
 */
export const usePaginatedReadings = (userId, meterId, pageSize = PAGE_SIZE) => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const lastDocRef = useRef(null);
  const allLoadedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Carga la primera página de lecturas
   */
  const loadInitialPage = useCallback(async () => {
    if (!userId || !meterId) return;

    try {
      setLoading(true);
      setError(null);

      // Intentar obtener de caché primero
      const cacheKey = CACHE_KEYS.METER_READINGS(userId, meterId);
      const cached = await cacheService.get(cacheKey);

      if (cached && cached.length > 0) {
        logger.debug('Using cached readings', { meterId, count: cached.length });
        setReadings(cached);
        setHasMore(false); // Si está en caché, asumimos que tenemos todas
        setLoading(false);
        return;
      }

      // Query Firestore
      const readingsRef = collection(db, 'users', userId, 'meters', meterId, 'readings');
      const q = query(
        readingsRef,
        orderBy('date', 'desc'),
        limit(pageSize)
      );

      logger.performance.start(`load_readings_${meterId}`);
      const snapshot = await getDocs(q);
      logger.performance.end(`load_readings_${meterId}`);

      if (!isMountedRef.current) return;

      const fetchedReadings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date, // Firestore Timestamp
      }));

      // Ordenar por fecha ascendente para cálculos
      const sortedReadings = fetchedReadings.sort((a, b) =>
        a.date.toMillis() - b.date.toMillis()
      );

      // Calcular consumos
      const readingsWithConsumption = calculateReadingsConsumption(sortedReadings);

      // Guardar última doc para paginación
      if (snapshot.docs.length > 0) {
        lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
      }

      // Verificar si hay más
      setHasMore(snapshot.docs.length === pageSize);

      // Si es la primera carga y ya no hay más, cachear
      if (snapshot.docs.length < pageSize) {
        await cacheService.set(cacheKey, readingsWithConsumption, CACHE_TTL.MEDIUM);
        allLoadedRef.current = true;
      }

      setReadings(readingsWithConsumption);

      logger.debug('Readings loaded', {
        meterId,
        count: readingsWithConsumption.length,
        hasMore: snapshot.docs.length === pageSize
      });
    } catch (err) {
      logger.error('Error loading readings', { meterId, error: err });
      setError(err.message);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [userId, meterId, pageSize]);

  /**
   * Carga la siguiente página
   */
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || allLoadedRef.current || !lastDocRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const readingsRef = collection(db, 'users', userId, 'meters', meterId, 'readings');
      const q = query(
        readingsRef,
        orderBy('date', 'desc'),
        startAfter(lastDocRef.current),
        limit(pageSize)
      );

      logger.performance.start(`load_more_readings_${meterId}`);
      const snapshot = await getDocs(q);
      logger.performance.end(`load_more_readings_${meterId}`);

      if (!isMountedRef.current) return;

      const fetchedReadings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date,
      }));

      if (fetchedReadings.length === 0) {
        setHasMore(false);
        allLoadedRef.current = true;

        // Cachear todas las lecturas
        const cacheKey = CACHE_KEYS.METER_READINGS(userId, meterId);
        await cacheService.set(cacheKey, readings, CACHE_TTL.MEDIUM);

        logger.debug('All readings loaded and cached', { meterId, total: readings.length });
        return;
      }

      // Ordenar por fecha ascendente
      const sortedNew = fetchedReadings.sort((a, b) =>
        a.date.toMillis() - b.date.toMillis()
      );

      // Combinar con lecturas existentes
      const allReadings = [...readings, ...sortedNew].sort((a, b) =>
        a.date.toMillis() - b.date.toMillis()
      );

      // Recalcular consumos de TODAS las lecturas
      const readingsWithConsumption = calculateReadingsConsumption(allReadings);

      // Actualizar última doc
      if (snapshot.docs.length > 0) {
        lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
      }

      // Verificar si hay más
      const hasMorePages = snapshot.docs.length === pageSize;
      setHasMore(hasMorePages);

      if (!hasMorePages) {
        // Cachear todas
        const cacheKey = CACHE_KEYS.METER_READINGS(userId, meterId);
        await cacheService.set(cacheKey, readingsWithConsumption, CACHE_TTL.MEDIUM);
        allLoadedRef.current = true;
      }

      setReadings(readingsWithConsumption);

      logger.debug('More readings loaded', {
        meterId,
        newCount: fetchedReadings.length,
        totalCount: readingsWithConsumption.length,
        hasMore: hasMorePages
      });
    } catch (err) {
      logger.error('Error loading more readings', { meterId, error: err });
      setError(err.message);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [userId, meterId, readings, loading, hasMore, pageSize]);

  /**
   * Refresh (pull to refresh)
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);

    // Limpiar caché
    const cacheKey = CACHE_KEYS.METER_READINGS(userId, meterId);
    await cacheService.remove(cacheKey);

    // Reset state
    lastDocRef.current = null;
    allLoadedRef.current = false;
    setHasMore(true);
    setReadings([]);

    // Recargar
    await loadInitialPage();

    if (isMountedRef.current) {
      setRefreshing(false);
    }
  }, [userId, meterId, loadInitialPage]);

  /**
   * Invalidar caché y recargar
   */
  const invalidateCache = useCallback(async () => {
    const cacheKey = CACHE_KEYS.METER_READINGS(userId, meterId);
    await cacheService.remove(cacheKey);
    logger.debug('Cache invalidated', { meterId });
  }, [userId, meterId]);

  // Cargar inicial al montar
  useEffect(() => {
    if (userId && meterId) {
      loadInitialPage();
    }
  }, [userId, meterId]); // Solo cuando cambia user o meter

  return {
    readings,
    loading,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
    invalidateCache,
  };
};

export default usePaginatedReadings;
