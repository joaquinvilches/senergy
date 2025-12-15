import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const submitFeedback = async (userId, userEmail, feedbackData) => {
  try {
    const feedbackRef = collection(db, 'feedback');

    await addDoc(feedbackRef, {
      userId,
      userEmail,
      type: feedbackData.type,
      message: feedbackData.message,
      createdAt: serverTimestamp(),
      status: 'pending', // pending, reviewed, implemented
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};