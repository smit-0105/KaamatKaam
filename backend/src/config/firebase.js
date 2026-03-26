import admin from 'firebase-admin';

// Initialize Firebase Admin from the JSON stored in .env
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('🔥 Firebase Admin initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
  }
} else {
  console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_JSON not found in .env — using legacy JWT auth.');
}

export default admin;
