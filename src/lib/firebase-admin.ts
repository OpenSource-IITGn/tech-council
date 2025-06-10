// Firebase Admin SDK configuration for server-side operations
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Parse the service account key from environment variable
const getServiceAccount = (): ServiceAccount | null => {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey || serviceAccountKey.includes('placeholder')) {
    console.warn('Firebase service account not configured. Some features may not work.');
    return null;
  }

  try {
    return JSON.parse(serviceAccountKey) as ServiceAccount;
  } catch (error) {
    console.warn('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Some features may not work.');
    return null;
  }
};

// Initialize Firebase Admin (singleton pattern)
let adminStorage: any = null;
let bucket: any = null;

if (getApps().length === 0) {
  const serviceAccount = getServiceAccount();
  if (serviceAccount) {
    try {
      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      adminStorage = getStorage();
      bucket = adminStorage.bucket();
    } catch (error) {
      console.warn('Failed to initialize Firebase Admin:', error);
    }
  }
}

// Export storage instance (may be null if not configured)
export { adminStorage, bucket };
