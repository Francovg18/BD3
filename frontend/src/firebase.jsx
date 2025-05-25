// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFHtITAne9yLDep_gRHJwVMbyqadWCyUQ",
  authDomain: "elecciones-8497e.firebaseapp.com",
  projectId: "elecciones-8497e",
  storageBucket: "elecciones-8497e.firebasestorage.app",
  messagingSenderId: "354697730987",
  appId: "1:354697730987:web:c6c5f00eae19d707f610ee",
  measurementId: "G-Q547YW4KDD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
