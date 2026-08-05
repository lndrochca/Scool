import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD1hTPUL4SjiSrfFLLDcaSf0Nd4VvjrRj4",
  authDomain: "scool-6767.firebaseapp.com",
  projectId: "scool-6767",
  storageBucket: "scool-6767.firebasestorage.app",
  messagingSenderId: "120038105309",
  appId: "1:120038105309:web:f086c90c926406e95efb34",
  measurementId: "G-74YFD7PG63",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
