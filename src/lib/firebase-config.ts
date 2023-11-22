import { initializeApp } from "firebase/app";
import { getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDf-EVya-QkzVMITh1pyw1s6J7uFe13euY",
  authDomain: "edustack-rvitm.firebaseapp.com",
  projectId: "edustack-rvitm",
  storageBucket: "edustack-rvitm.appspot.com",
  messagingSenderId: "1015290762687",
  appId: "1:1015290762687:web:106e221408b08a242fbd0a",
  measurementId: "G-CBKS8RHR3S",
};

export const app =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
