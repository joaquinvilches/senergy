import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { deleteMeterPhoto } from './imageService';

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
 * Elimina una lectura específica de un medidor
 * También elimina la foto asociada si existe
 */
export const deleteReading = async (userId, meterId, readingId) => {
  try {
    // 1. Obtener la lectura para ver si tiene foto
    const readingRef = doc(db, 'users', userId, 'meters', meterId, 'readings', readingId);
    const readingSnap = await getDoc(readingRef);

    if (readingSnap.exists()) {
      const readingData = readingSnap.data();

      // 2. Si tiene foto, eliminarla de Storage primero
      if (readingData.photoURL) {
        try {
          await deleteMeterPhoto(readingData.photoURL);
        } catch (photoError) {
          console.error('Error deleting photo, continuing with reading deletion:', photoError);
          // Continuar aunque falle eliminación de foto
        }
      }
    }

    // 3. Eliminar documento de lectura
    await deleteDoc(readingRef);
  } catch (error) {
    console.error('Error deleting reading:', error);
    throw error;
  }
};

/**
 * Actualizar una lectura específica de un medidor
 */
export const updateReading = async (userId, meterId, readingId, updatedData) => {
  try {
    const readingRef = doc(db, 'users', userId, 'meters', meterId, 'readings', readingId);
    await updateDoc(readingRef, {
      ...updatedData,
      // No actualizamos la fecha original para mantener el historial preciso
    });
  } catch (error) {
    console.error('Error updating reading:', error);
    throw error;
  }
};

/**
 * Crear usuario en Firestore con info básica
 */
export const createUserProfile = async (userId, userEmail) => {
  try {
    const userRef = doc(db, 'users', userId);
    // Usar setDoc con merge para crear o actualizar
    await setDoc(userRef, {
      email: userEmail,
      createdAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    console.error('User profile creation error:', error);
    throw error;
  }
};