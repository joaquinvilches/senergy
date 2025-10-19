/**
 * Calcula el consumo entre dos lecturas
 * @param {number} previousReading - Lectura anterior
 * @param {number} currentReading - Lectura actual
 * @returns {number} - Consumo en kWh
 */
export const calculateConsumption = (previousReading, currentReading) => {
  if (currentReading < previousReading) {
    // Si el medidor "se reinició", es normal en algunos casos
    return currentReading; // O manejar de otra forma
  }
  return currentReading - previousReading;
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
 * Formatea el costo a moneda chilena
 * @param {number} cost - Costo en pesos
 * @returns {string} - Costo formateado
 */
export const formatCurrency = (cost) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(cost);
};

/**
 * Formatea un número con 2 decimales
 * @param {number} number - Número a formatear
 * @returns {number} - Número formateado
 */
export const formatNumber = (number) => {
  return Math.round(number * 100) / 100;
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
    maxConsumption: formatNumber(Math.max(...consumptions)),
    minConsumption: formatNumber(Math.min(...consumptions)),
  };
};