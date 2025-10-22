import { useState, useEffect } from 'react';
import { CONFIG } from '../utils/constants';
import { detectHighConsumption } from '../utils/statsCalculations';

/**
 * Hook personalizado para detectar y manejar alertas de consumo alto
 *
 * @param {array} filteredReadings - Lecturas filtradas
 * @returns {array} alerts - Array de alertas detectadas
 */
export const useAlerts = (filteredReadings) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const detected = detectHighConsumption(filteredReadings, CONFIG);
    setAlerts(detected);
  }, [filteredReadings]);

  return alerts;
};