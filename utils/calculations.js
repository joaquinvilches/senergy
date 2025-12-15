/**
 * Calcula el consumo entre dos lecturas
 * @param {number} previousReading - Lectura anterior
 * @param {number} currentReading - Lectura actual
 * @returns {number} - Consumo en kWh
 */
export const calculateConsumption = (previousReading, currentReading) => {
  // Validar entradas
  const prev = Number(previousReading) || 0;
  const curr = Number(currentReading) || 0;

  if (curr < prev) {
    // CASO: Reset del medidor (poco común pero puede suceder)
    // Esto podría significar:
    // 1. El medidor se reinició a 0 (muy raro)
    // 2. Error en la lectura
    // 3. Cambio de medidor
    // Por ahora, asumimos que es un consumo muy alto desde 0
    // En el futuro, se podría pedir confirmación al usuario
    console.error(
      `⚠️ Posible reset de medidor detectado. Anterior: ${prev}, Actual: ${curr}. ` +
      `Se asume consumo desde 0.`
    );
    // Retornar la lectura actual como consumo (asumiendo reset desde 0)
    return curr;
  }

  return curr - prev;
};

/**
 * Calcula el costo en pesos chilenos
 * @param {number} consumption - Consumo en kWh
 * @param {number} costPerKwh - Costo por kWh en pesos
 * @returns {number} - Costo total en pesos
 */
export const calculateCost = (consumption, costPerKwh) => {
  return consumption * costPerKwh;
};

/**
 * Formatea un número con 2 decimales
 * @param {number} number - Número a formatear
 * @param {boolean} asString - Si es true, retorna string; si es false, retorna number
 * @returns {string|number} - Número formateado
 */
export const formatNumber = (number, asString = false) => {
  const rounded = Math.round(number * 100) / 100;
  return asString ? rounded.toFixed(2) : rounded;
};

/**
 * Calcula estadísticas de un array de lecturas
 * @param {Array} readings - Array de lecturas con {consumption, date}
 * @returns {Object} - Estadísticas
 */
export const calculateStats = (readings) => {
  if (!readings || readings.length === 0) {
    return {
      totalConsumption: 0,
      averageConsumption: 0,
      maxConsumption: 0,
      minConsumption: 0,
    };
  }

  const consumptions = readings.map(r => r.consumption);
  const total = consumptions.reduce((a, b) => a + b, 0);

  return {
    totalConsumption: formatNumber(total),
    averageConsumption: formatNumber(total / readings.length),
    maxConsumption: consumptions.length > 0 ? formatNumber(Math.max(...consumptions)) : '0',
    minConsumption: consumptions.length > 0 ? formatNumber(Math.min(...consumptions)) : '0',
  };
};