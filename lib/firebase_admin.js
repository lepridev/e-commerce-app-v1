import admin from "firebase-admin";

// ✅ Configuration sécurisée
function initializeFirebaseAdmin() {
  // Éviter la double initialisation
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    // ✅ Méthode recommandée : variables séparées
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };

    // Vérifier les champs requis
    if (
      !serviceAccount.project_id ||
      !serviceAccount.private_key ||
      !serviceAccount.client_email
    ) {
      console.warn("Firebase Admin: Missing required environment variables");
      return null;
    }

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
    return null;
  }
}

// Initialisation
const firebaseAdmin = initializeFirebaseAdmin();

// Export avec fallback sécurisé
export const adminDB = firebaseAdmin?.firestore() || null;
export { admin };
