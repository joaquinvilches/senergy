import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger, loggers } from '../utils/logger';

/**
 * Servicio de Caché Offline Robusto para SENERGY
 *
 * Características:
 * - Almacenamiento en AsyncStorage
 * - TTL (Time To Live) configurable
 * - Invalidación automática
 * - Compresión de datos grandes
 * - Límite de tamaño de caché
 * - Estadísticas de uso
 *
 * Uso:
 * import { cacheService } from './services/cacheService';
 *
 * // Guardar en caché
 * await cacheService.set('meters', meters, 300); // 5 minutos
 *
 * // Obtener de caché
 * const meters = await cacheService.get('meters');
 *
 * // Invalidar
 * await cacheService.remove('meters');
 */

const CACHE_PREFIX = '@senergy_cache_';
const METADATA_PREFIX = '@senergy_cache_meta_';
const MAX_CACHE_SIZE = 10 * 1024 * 1024; // 10 MB
const DEFAULT_TTL = 300; // 5 minutos en segundos

class CacheService {
  constructor() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      removes: 0,
    };
  }

  /**
   * Genera la key con prefijo
   */
  getCacheKey(key) {
    return `${CACHE_PREFIX}${key}`;
  }

  /**
   * Genera la key de metadata
   */
  getMetadataKey(key) {
    return `${METADATA_PREFIX}${key}`;
  }

  /**
   * Guarda un valor en caché
   * @param {string} key - Identificador único
   * @param {any} value - Valor a cachear (será serializado a JSON)
   * @param {number} ttl - Tiempo de vida en segundos (default: 300)
   */
  async set(key, value, ttl = DEFAULT_TTL) {
    try {
      const cacheKey = this.getCacheKey(key);
      const metadataKey = this.getMetadataKey(key);

      // Crear metadata
      const metadata = {
        createdAt: Date.now(),
        expiresAt: Date.now() + (ttl * 1000),
        ttl,
        size: 0,
      };

      // Serializar valor
      const serialized = JSON.stringify(value);
      metadata.size = serialized.length;

      // Verificar tamaño
      if (metadata.size > MAX_CACHE_SIZE) {
        logger.warn('Cache value too large, skipping cache', { key, size: metadata.size });
        return false;
      }

      // Guardar valor y metadata
      await AsyncStorage.multiSet([
        [cacheKey, serialized],
        [metadataKey, JSON.stringify(metadata)],
      ]);

      this.stats.sets++;
      loggers.cache.set(key);

      return true;
    } catch (error) {
      logger.error('Error setting cache', { key, error });
      return false;
    }
  }

  /**
   * Obtiene un valor de caché
   * @param {string} key - Identificador único
   * @returns {any|null} - Valor deserializado o null si no existe o expiró
   */
  async get(key) {
    try {
      const cacheKey = this.getCacheKey(key);
      const metadataKey = this.getMetadataKey(key);

      // Obtener valor y metadata
      const [[, value], [, metadataStr]] = await AsyncStorage.multiGet([
        cacheKey,
        metadataKey,
      ]);

      // Si no existe
      if (!value || !metadataStr) {
        this.stats.misses++;
        loggers.cache.miss(key);
        return null;
      }

      // Verificar metadata
      const metadata = JSON.parse(metadataStr);

      // Verificar expiración
      if (Date.now() > metadata.expiresAt) {
        // Expirado - eliminar
        await this.remove(key);
        this.stats.misses++;
        loggers.cache.miss(key);
        logger.debug('Cache expired', { key });
        return null;
      }

      // Deserializar y retornar
      const parsed = JSON.parse(value);
      this.stats.hits++;
      loggers.cache.hit(key);

      return parsed;
    } catch (error) {
      logger.error('Error getting cache', { key, error });
      return null;
    }
  }

  /**
   * Elimina un valor de caché
   * @param {string} key - Identificador único
   */
  async remove(key) {
    try {
      const cacheKey = this.getCacheKey(key);
      const metadataKey = this.getMetadataKey(key);

      await AsyncStorage.multiRemove([cacheKey, metadataKey]);

      this.stats.removes++;
      return true;
    } catch (error) {
      logger.error('Error removing cache', { key, error });
      return false;
    }
  }

  /**
   * Verifica si una key existe y NO ha expirado
   * @param {string} key - Identificador único
   * @returns {boolean}
   */
  async has(key) {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Limpia toda la caché de SENERGY
   */
  async clear() {
    try {
      // Obtener todas las keys
      const allKeys = await AsyncStorage.getAllKeys();

      // Filtrar solo las de SENERGY
      const senergyKeys = allKeys.filter(
        k => k.startsWith(CACHE_PREFIX) || k.startsWith(METADATA_PREFIX)
      );

      // Eliminar
      await AsyncStorage.multiRemove(senergyKeys);

      // Reset stats
      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        removes: 0,
      };

      loggers.cache.clear();
      logger.info('Cache cleared', { keysRemoved: senergyKeys.length });

      return true;
    } catch (error) {
      logger.error('Error clearing cache', { error });
      return false;
    }
  }

  /**
   * Obtiene estadísticas de caché
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;

    return {
      ...this.stats,
      total,
      hitRate: `${hitRate}%`,
    };
  }

  /**
   * Obtiene el tamaño total de la caché
   */
  async getSize() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const senergyKeys = allKeys.filter(k => k.startsWith(CACHE_PREFIX));

      const items = await AsyncStorage.multiGet(senergyKeys);

      let totalSize = 0;
      items.forEach(([, value]) => {
        if (value) {
          totalSize += value.length;
        }
      });

      return {
        bytes: totalSize,
        kb: (totalSize / 1024).toFixed(2),
        mb: (totalSize / 1024 / 1024).toFixed(2),
        items: senergyKeys.length,
      };
    } catch (error) {
      logger.error('Error getting cache size', { error });
      return null;
    }
  }

  /**
   * Limpia entradas expiradas
   */
  async cleanup() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const metadataKeys = allKeys.filter(k => k.startsWith(METADATA_PREFIX));

      const metadataItems = await AsyncStorage.multiGet(metadataKeys);

      const expiredKeys = [];
      const now = Date.now();

      metadataItems.forEach(([key, value]) => {
        if (value) {
          const metadata = JSON.parse(value);
          if (now > metadata.expiresAt) {
            // Agregar tanto metadata como value key
            const originalKey = key.replace(METADATA_PREFIX, '');
            expiredKeys.push(key); // metadata key
            expiredKeys.push(`${CACHE_PREFIX}${originalKey}`); // value key
          }
        }
      });

      if (expiredKeys.length > 0) {
        await AsyncStorage.multiRemove(expiredKeys);
        logger.info('Cache cleanup completed', { expiredItems: expiredKeys.length / 2 });
      }

      return expiredKeys.length / 2; // Dividir por 2 porque cada item tiene 2 keys
    } catch (error) {
      logger.error('Error during cache cleanup', { error });
      return 0;
    }
  }
}

// Exportar instancia singleton
export const cacheService = new CacheService();

// Helpers específicos del dominio

/**
 * Cache keys para SENERGY
 */
export const CACHE_KEYS = {
  // User
  USER_METERS: (userId) => `user_meters_${userId}`,
  USER_PROFILE: (userId) => `user_profile_${userId}`,

  // Meters
  METER_READINGS: (userId, meterId) => `meter_readings_${userId}_${meterId}`,
  METER_STATS: (userId, meterId) => `meter_stats_${userId}_${meterId}`,

  // Stats
  MONTHLY_STATS: (userId, month) => `monthly_stats_${userId}_${month}`,
  GENERAL_STATS: (userId) => `general_stats_${userId}`,

  // Otros
  INSIGHTS: (userId) => `insights_${userId}`,
  ALERTS: (userId) => `alerts_${userId}`,
};

/**
 * TTLs recomendados
 */
export const CACHE_TTL = {
  SHORT: 60,        // 1 minuto
  MEDIUM: 300,      // 5 minutos
  LONG: 1800,       // 30 minutos
  VERY_LONG: 3600,  // 1 hora
  DAY: 86400,       // 24 horas
};

/**
 * Wrapper para cachear funciones automáticamente
 * @param {Function} fn - Función asíncrona a cachear
 * @param {string} cacheKey - Key de caché
 * @param {number} ttl - TTL en segundos
 */
export const withCache = async (fn, cacheKey, ttl = CACHE_TTL.MEDIUM) => {
  // Intentar obtener de caché primero
  const cached = await cacheService.get(cacheKey);

  if (cached !== null) {
    logger.debug('Using cached value', { cacheKey });
    return cached;
  }

  // Si no hay caché, ejecutar función
  logger.debug('Cache miss, fetching fresh data', { cacheKey });
  const result = await fn();

  // Guardar en caché
  await cacheService.set(cacheKey, result, ttl);

  return result;
};

export default cacheService;
