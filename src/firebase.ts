import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAFvNkM8_MZ1n13EbAG3QzvTj50zZDcpqE",
  authDomain: "restaurant-groundworks-db.firebaseapp.com",
  projectId: "restaurant-groundworks-db",
  storageBucket: "restaurant-groundworks-db.firebasestorage.app",
  messagingSenderId: "391704584139",
  appId: "1:391704584139:web:bee1a86cde8411acf8a04e",
  measurementId: "G-J6FR64HDJP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
