import admin from 'firebase-admin';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

/**
 * Firebase Admin bootstrap. Initialised once and shared, because the SDK keeps
 * connection pools and auth tokens on the app instance — re-initialising per
 * request would re-authenticate every time.
 */

let app: admin.app.App | null = null;
let firestore: admin.firestore.Firestore | null = null;

export function getFirebaseApp(): admin.app.App {
  if (app) return app;

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey,
    }),
    storageBucket: env.firebase.storageBucket,
  });

  logger.info('Firebase Admin initialised', { projectId: env.firebase.projectId });
  return app;
}

export function getFirestore(): admin.firestore.Firestore {
  if (firestore) return firestore;

  const instance = getFirebaseApp().firestore();

  // settings() may only be called once, and only before any other call on the
  // instance — hence caching here rather than configuring on every access.
  instance.settings({ ignoreUndefinedProperties: true });

  firestore = instance;
  return firestore;
}

export function getStorageBucket() {
  return getFirebaseApp().storage().bucket();
}

/** Fails fast at boot rather than on the first request. */
export async function verifyFirestoreConnection(): Promise<void> {
  await getFirestore().collection('reviews').limit(1).get();
  logger.info('Firestore connection verified');
}
