import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYy4JzZa22mkMAqMHVCIAqsJ-DrRJ2ATA",
  authDomain: "hbd-proje.firebaseapp.com",
  projectId: "hbd-proje",
  storageBucket: "hbd-proje.firebasestorage.app",
  messagingSenderId: "263509561935",
  appId: "1:263509561935:web:f947697a85cfeed9db103a",
  measurementId: "G-7P6K1GSZ2Y"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
