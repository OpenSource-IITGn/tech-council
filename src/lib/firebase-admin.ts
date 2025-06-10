// Firebase Admin SDK configuration for server-side operations
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Parse the service account key from environment variable
const getServiceAccount = (): ServiceAccount => {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  try {
    return JSON.parse(serviceAccountKey) as ServiceAccount;
  } catch (error) {
    throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Must be valid JSON.');
  }
};

// Initialize Firebase Admin (singleton pattern)
if (getApps().length === 0) {
  initializeApp({
    credential: cert(getServiceAccount()),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

// Export storage instance
export const adminStorage = getStorage();
export const bucket = adminStorage.bucket();
