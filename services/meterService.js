import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Crear nuevo medidor para un usuario
 */
export const createMeter = async (userId, meterData) => {
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'meters'), {
      ...meterData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener todos los medidores de un usuario
 */
export const getUserMeters = async (userId) => {
  try {
    const metersRef = collection(db, 'users', userId, 'meters');
    const q = query(metersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const meters = [];
    querySnapshot.forEach((doc) => {
      meters.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return meters;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar datos de un medidor
 */
export const updateMeter = async (userId, meterId, updates) => {
  try {
    const meterRef = doc(db, 'users', userId, 'meters', meterId);
    await updateDoc(meterRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar un medidor
 */
export const deleteMeter = async (userId, meterId) => {
  try {
    const meterRef = doc(db, 'users', userId, 'meters', meterId);
    await deleteDoc(meterRef);
  } catch (error) {
    throw error;
  }
};

/**
 * Agregar una lectura a un medidor
 */
export const addReading = async (userId, meterId, readingData) => {
  try {
    const readingsRef = collection(db, 'users', userId, 'meters', meterId, 'readings');
    const docRef = await addDoc(readingsRef, {
      ...readingData,
      date: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener todas las lecturas de un medidor
 */
export const getMeterReadings = async (userId, meterId) => {
  try {
    const readingsRef = collection(db, 'users', userId, 'meters', meterId, 'readings');
    const q = query(readingsRef, orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const readings = [];
    querySnapshot.forEach((doc) => {
      readings.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return readings;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear usuario en Firestore con info básica
 */
export const createUserProfile = async (userId, userEmail) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      email: userEmail,
      createdAt: Timestamp.now(),
    }).catch(() => {
      // Si el doc no existe, crearlo
      return addDoc(collection(db, 'users'), {
        uid: userId,
        email: userEmail,
        createdAt: Timestamp.now(),
      });
    });
  } catch (error) {
    console.log('User profile creation:', error);
  }
};