// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC9Ent3BUO5Mlsv2ja50rvzyW9f8GVnbb8",
  authDomain: "my-react-app-4ef0b.firebaseapp.com",
  projectId: "my-react-app-4ef0b",
  storageBucket: "my-react-app-4ef0b.appspot.com",
  messagingSenderId: "489236767985",
  appId: "1:489236767985:web:fcb56e57ec04adbb81f550",
  measurementId: "G-45B237NG02"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
