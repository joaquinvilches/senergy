import { useState, useEffect, useRef } from 'react';
import { CONFIG } from '../utils/constants';
import { detectHighConsumption } from '../utils/statsCalculations';
import { sendHighConsumptionAlert } from '../services/notificationService';

// Límite máximo de IDs en el Set para prevenir memory leaks
const MAX_NOTIFIED_IDS = 200;

/**
 * Hook personalizado para detectar y manejar alertas de consumo alto
 * Incluye envío de notificaciones push
 *
 * @param {array} filteredReadings - Lecturas filtradas
 * @returns {array} alerts - Array de alertas detectadas
 */
export const useAlerts = (filteredReadings) => {
  const [alerts, setAlerts] = useState([]);
  const notifiedReadingsRef = useRef(new Set()); // Evitar notificaciones duplicadas

  useEffect(() => {
    const detected = detectHighConsumption(filteredReadings, CONFIG);
    setAlerts(detected);

    // Limpiar Set si crece demasiado (prevenir memory leak)
    if (notifiedReadingsRef.current.size > MAX_NOTIFIED_IDS) {
      // Convertir a array, mantener solo los últimos MAX_NOTIFIED_IDS/2 elementos
      const notifiedArray = Array.from(notifiedReadingsRef.current);
      const toKeep = notifiedArray.slice(-Math.floor(MAX_NOTIFIED_IDS / 2));
      notifiedReadingsRef.current = new Set(toKeep);
    }

    // Enviar notificaciones para nuevas alertas
    if (detected.length > 0) {
      detected.forEach((alert) => {
        // Verificar que sea una alerta de consumo alto y que no haya sido notificada
        if (
          alert.type === 'high_consumption' &&
          alert.readingId &&
          !notifiedReadingsRef.current.has(alert.readingId)
        ) {
          // Enviar notificación con manejo de errores
          sendHighConsumptionAlert(
            alert.meterName || 'Medidor',
            alert.consumption,
            alert.averageConsumption
          )
            .then(() => {
              // Marcar como notificada
              notifiedReadingsRef.current.add(alert.readingId);
            })
            .catch((error) => {
              console.error('Error al enviar notificación de alto consumo:', error);
              // No agregamos el ID al Set si falló, para reintentar en el próximo render
            });
        }
      });
    }
  }, [filteredReadings]);

  return alerts;
};