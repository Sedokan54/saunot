const admin = require('firebase-admin');

// Firebase Admin SDK yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyBau8KYBNSNzHMaryAgS-0i8pZOc9Brwa8",
  authDomain: "saunot-193b3.firebaseapp.com",
  projectId: "saunot-193b3",
  storageBucket: "saunot-193b3.firebasestorage.app",
  messagingSenderId: "495237771678",
  appId: "1:495237771678:web:280bd6192dac7cf204268f",
  measurementId: "G-VY48362WDQ"
};

// Firebase Admin SDK'yı başlat
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
}

// Firestore ve Auth referansları
const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth, firebaseConfig };