import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBau8KYBNSNzHMaryAgS-0i8pZOc9Brwa8",
  authDomain: "saunot-193b3.firebaseapp.com",
  projectId: "saunot-193b3",
  storageBucket: "saunot-193b3.firebasestorage.app",
  messagingSenderId: "495237771678",
  appId: "1:495237771678:web:280bd6192dac7cf204268f",
  measurementId: "G-VY48362WDQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;