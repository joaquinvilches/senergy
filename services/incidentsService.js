import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Servicio para gestionar incidentes/inconvenientes eléctricos
 * Permite registrar cortes de luz, problemas de tensión, etc.
 */

const INCIDENTS_COLLECTION = 'incidents';

/**
 * Crear un nuevo incidente
 * @param {string} userId - ID del usuario
 * @param {object} incidentData - Datos del incidente
 * @returns {Promise<string>} - ID del incidente creado
 */
export const createIncident = async (userId, incidentData) => {
  try {
    const incident = {
      userId,
      meterId: incidentData.meterId || null,
      meterName: incidentData.meterName || 'General',
      date: incidentData.date || Timestamp.now(),
      startTime: incidentData.startTime || '',
      endTime: incidentData.endTime || '',
      description: incidentData.description || '',
      type: incidentData.type || 'corte', // corte, baja_tension, sobre_tension, otro
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, INCIDENTS_COLLECTION), incident);
    return docRef.id;
  } catch (error) {
    console.error('Error creating incident:', error);
    throw new Error('No se pudo registrar el incidente');
  }
};

/**
 * Obtener todos los incidentes de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Lista de incidentes
 */
export const getUserIncidents = async (userId) => {
  try {
    const q = query(
      collection(db, INCIDENTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const incidents = [];

    querySnapshot.forEach((doc) => {
      incidents.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return incidents;
  } catch (error) {
    console.error('Error getting incidents:', error);
    throw new Error('No se pudieron cargar los incidentes');
  }
};

/**
 * Obtener incidentes de un medidor específico
 * @param {string} userId - ID del usuario
 * @param {string} meterId - ID del medidor
 * @returns {Promise<Array>} - Lista de incidentes del medidor
 */
export const getMeterIncidents = async (userId, meterId) => {
  try {
    const q = query(
      collection(db, INCIDENTS_COLLECTION),
      where('userId', '==', userId),
      where('meterId', '==', meterId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const incidents = [];

    querySnapshot.forEach((doc) => {
      incidents.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return incidents;
  } catch (error) {
    console.error('Error getting meter incidents:', error);
    throw new Error('No se pudieron cargar los incidentes del medidor');
  }
};

/**
 * Actualizar un incidente
 * @param {string} incidentId - ID del incidente
 * @param {object} updates - Datos a actualizar
 * @returns {Promise<void>}
 */
export const updateIncident = async (incidentId, updates) => {
  try {
    const incidentRef = doc(db, INCIDENTS_COLLECTION, incidentId);
    await updateDoc(incidentRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating incident:', error);
    throw new Error('No se pudo actualizar el incidente');
  }
};

/**
 * Eliminar un incidente
 * @param {string} incidentId - ID del incidente
 * @returns {Promise<void>}
 */
export const deleteIncident = async (incidentId) => {
  try {
    const incidentRef = doc(db, INCIDENTS_COLLECTION, incidentId);
    await deleteDoc(incidentRef);
  } catch (error) {
    console.error('Error deleting incident:', error);
    throw new Error('No se pudo eliminar el incidente');
  }
};

/**
 * Obtener estadísticas de incidentes
 * @param {Array} incidents - Lista de incidentes
 * @returns {object} - Estadísticas
 */
export const getIncidentStats = (incidents) => {
  const stats = {
    total: incidents.length,
    byType: {},
    currentMonth: 0,
    lastMonth: 0,
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  incidents.forEach((incident) => {
    // Contar por tipo
    const type = incident.type || 'otro';
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    // Contar mes actual y anterior
    const incidentDate = incident.date?.toDate?.() || new Date(incident.date);
    const incidentMonth = incidentDate.getMonth();
    const incidentYear = incidentDate.getFullYear();

    if (incidentYear === currentYear && incidentMonth === currentMonth) {
      stats.currentMonth++;
    } else if (
      (incidentYear === currentYear && incidentMonth === currentMonth - 1) ||
      (currentMonth === 0 && incidentYear === currentYear - 1 && incidentMonth === 11)
    ) {
      stats.lastMonth++;
    }
  });

  return stats;
};

/**
 * Formatear incidentes para exportación
 * @param {Array} incidents - Lista de incidentes
 * @returns {string} - CSV string
 */
export const formatIncidentsForExport = (incidents) => {
  const headers = [
    'Fecha',
    'Medidor',
    'Tipo',
    'Hora Inicio',
    'Hora Fin',
    'Descripción',
  ];

  const rows = incidents.map((incident) => {
    const date = incident.date?.toDate?.() || new Date(incident.date);
    const dateStr = date.toLocaleDateString('es-CL');

    return [
      dateStr,
      incident.meterName || 'General',
      incident.type || 'corte',
      incident.startTime || '-',
      incident.endTime || '-',
      `"${(incident.description || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};
