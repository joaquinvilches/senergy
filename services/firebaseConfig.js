import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBPaQNq8TKM6tGqAfX69ZA_OLx8SegQ52Y",
  authDomain: "senergy-46b1e.firebaseapp.com",
  projectId: "senergy-46b1e",
  storageBucket: "senergy-46b1e.firebasestorage.app",
  messagingSenderId: "1004118309867",
  appId: "1:1004118309867:web:6385b378eb0217b009b7ae",
  measurementId: "G-TRGG3EPHJ9"
};

const app = initializeApp(firebaseConfig);

// Configurar Auth con persistencia en React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export default app;