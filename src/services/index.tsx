
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'


const firebaseConfig = {
  apiKey: "AIzaSyBuqvStPYTovFfQhuhuenIjy_Ac8-H7H_0",
  authDomain: "mundo-das-ofertas-ae7e1.firebaseapp.com",
  projectId: "mundo-das-ofertas-ae7e1",
  storageBucket: "mundo-das-ofertas-ae7e1.appspot.com",
  messagingSenderId: "737925700150",
  appId: "1:737925700150:web:f3d10df438f27f06b8d697",
  measurementId: "G-TMHZHQD3LC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { db, auth, storage}