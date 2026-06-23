

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// @ts-ignore
import firebaseConfig from '../firebase-applet-config.json';

if (!firebaseConfig || !firebaseConfig.apiKey) {
    console.error('Firebase config is missing or invalid. Check firebase-applet-config.json');
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = firebaseConfig.firestoreDatabaseId ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : getFirestore(app);

// Enable offline persistence safely
if (typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined') {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log('Firestore offline persistence enabled successfully.');
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: multiple tabs open.');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence is unimplemented in this browser.');
      } else {
        console.warn('Firestore persistence error:', err);
      }
    });
}

export const storage = getStorage(app);
