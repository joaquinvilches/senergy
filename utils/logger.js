/**
 * Sistema de Logs Estructurados para SENERGY
 *
 * Niveles de log:
 * - DEBUG: Información detallada para debugging
 * - INFO: Información general
 * - WARN: Advertencias
 * - ERROR: Errores que no rompen la app
 * - FATAL: Errores críticos
 *
 * Uso:
 * import { logger } from './utils/logger';
 *
 * logger.debug('User logged in', { userId: user.uid });
 * logger.info('Meter created', { meterId: meter.id, name: meter.name });
 * logger.warn('Low reading count', { count: readings.length });
 * logger.error('Failed to load meters', { error: error.message });
 * logger.fatal('App crashed', { error: error.stack });
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

const LOG_COLORS = {
  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m',  // Green
  WARN: '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m', // Red
  FATAL: '\x1b[35m', // Magenta
  RESET: '\x1b[0m',
};

class Logger {
  constructor() {
    // En producción, solo mostrar WARN, ERROR y FATAL
    // En desarrollo, mostrar todos
    this.minLevel = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;
    this.logs = []; // Almacenar logs en memoria (últimos 100)
    this.maxLogs = 100;
  }

  /**
   * Formatea el timestamp
   */
  getTimestamp() {
    const now = new Date();
    return now.toISOString();
  }

  /**
   * Formatea el mensaje de log
   */
  formatLog(level, message, data = {}) {
    const timestamp = this.getTimestamp();
    const color = LOG_COLORS[level];
    const reset = LOG_COLORS.RESET;

    const logObject = {
      timestamp,
      level,
      message,
      ...data,
    };

    // Guardar en memoria
    this.addToMemory(logObject);

    // En desarrollo, usar colores
    if (__DEV__) {
      return {
        formatted: `${color}[${level}]${reset} ${timestamp} - ${message}`,
        data: Object.keys(data).length > 0 ? data : null,
        object: logObject,
      };
    }

    return {
      formatted: `[${level}] ${timestamp} - ${message}`,
      data: Object.keys(data).length > 0 ? data : null,
      object: logObject,
    };
  }

  /**
   * Almacena log en memoria (para debugging)
   */
  addToMemory(logObject) {
    this.logs.push(logObject);

    // Mantener solo los últimos 100 logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Log genérico
   */
  log(level, message, data = {}) {
    const levelValue = LOG_LEVELS[level];

    if (levelValue < this.minLevel) {
      return; // No loggear si está por debajo del nivel mínimo
    }

    const { formatted, data: logData, object } = this.formatLog(level, message, data);

    // Console log
    if (logData) {
      console.log(formatted, logData);
    } else {
      console.log(formatted);
    }

    // Enviar a servicio externo en producción
    if (!__DEV__ && levelValue >= LOG_LEVELS.ERROR) {
      this.sendToExternalService(object);
    }
  }

  /**
   * DEBUG: Información detallada
   */
  debug(message, data = {}) {
    this.log('DEBUG', message, data);
  }

  /**
   * INFO: Información general
   */
  info(message, data = {}) {
    this.log('INFO', message, data);
  }

  /**
   * WARN: Advertencias
   */
  warn(message, data = {}) {
    this.log('WARN', message, data);
  }

  /**
   * ERROR: Errores no fatales
   */
  error(message, data = {}) {
    this.log('ERROR', message, data);

    // Si hay un objeto Error, loggear el stack
    if (data.error && data.error instanceof Error) {
      console.error(data.error.stack);
    }
  }

  /**
   * FATAL: Errores críticos
   */
  fatal(message, data = {}) {
    this.log('FATAL', message, data);

    // Si hay un objeto Error, loggear el stack
    if (data.error && data.error instanceof Error) {
      console.error(data.error.stack);
    }
  }

  /**
   * Enviar logs a servicio externo (Firebase, Sentry, etc.)
   */
  sendToExternalService(logObject) {
    // TODO: Integrar con Firebase Analytics o Crashlytics
    // analytics().logEvent('app_error', {
    //   level: logObject.level,
    //   message: logObject.message,
    //   timestamp: logObject.timestamp
    // });

    // Por ahora, solo guardamos en memoria
  }

  /**
   * Obtener logs de memoria (útil para debugging)
   */
  getLogs(level = null) {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return this.logs;
  }

  /**
   * Limpiar logs de memoria
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Exportar logs como JSON (para enviar en reportes de bugs)
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Performance tracking
   */
  time(label) {
    if (!__DEV__) return;

    console.time(label);
  }

  timeEnd(label) {
    if (!__DEV__) return;

    console.timeEnd(label);
  }

  /**
   * Group logs (para organizar mejor en consola)
   */
  group(label) {
    if (!__DEV__) return;

    console.group(label);
  }

  groupEnd() {
    if (!__DEV__) return;

    console.groupEnd();
  }
}

// Exportar instancia singleton
export const logger = new Logger();

// Helpers específicos del dominio de SENERGY
export const loggers = {
  /**
   * Auth logs
   */
  auth: {
    login: (userId) => logger.info('User logged in', { userId }),
    logout: (userId) => logger.info('User logged out', { userId }),
    register: (userId) => logger.info('User registered', { userId }),
    error: (message, error) => logger.error(`Auth error: ${message}`, { error }),
  },

  /**
   * Meter logs
   */
  meter: {
    created: (meterId, name) => logger.info('Meter created', { meterId, name }),
    updated: (meterId) => logger.info('Meter updated', { meterId }),
    deleted: (meterId) => logger.info('Meter deleted', { meterId }),
    loaded: (count) => logger.debug('Meters loaded', { count }),
    error: (message, error) => logger.error(`Meter error: ${message}`, { error }),
  },

  /**
   * Reading logs
   */
  reading: {
    created: (readingId, meterId, value) => logger.info('Reading created', { readingId, meterId, value }),
    updated: (readingId) => logger.info('Reading updated', { readingId }),
    deleted: (readingId) => logger.info('Reading deleted', { readingId }),
    loaded: (meterId, count) => logger.debug('Readings loaded', { meterId, count }),
    error: (message, error) => logger.error(`Reading error: ${message}`, { error }),
  },

  /**
   * Performance logs
   */
  performance: {
    start: (operation) => logger.time(operation),
    end: (operation) => logger.timeEnd(operation),
    slow: (operation, duration) => logger.warn('Slow operation detected', { operation, duration }),
  },

  /**
   * Cache logs
   */
  cache: {
    hit: (key) => logger.debug('Cache hit', { key }),
    miss: (key) => logger.debug('Cache miss', { key }),
    set: (key) => logger.debug('Cache set', { key }),
    clear: () => logger.debug('Cache cleared'),
  },

  /**
   * Network logs
   */
  network: {
    online: () => logger.info('Network online'),
    offline: () => logger.warn('Network offline'),
    error: (message, error) => logger.error(`Network error: ${message}`, { error }),
  },
};

export default logger;
