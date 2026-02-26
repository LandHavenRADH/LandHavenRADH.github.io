import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp,
  Firestore
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

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

// In AI Studio preview, we might have an app_id to sandbox data
const APP_ID = (window as any).__app_id || 'default-app-id';

export const getCollectionRef = (colName: string) => {
  if ((window as any).__app_id) {
    return collection(db, 'artifacts', APP_ID, 'public', 'data', colName);
  }
  return collection(db, colName);
};

export const getDocRef = (colName: string, docId: string) => {
  if ((window as any).__app_id) {
    return doc(db, 'artifacts', APP_ID, 'public', 'data', colName, docId);
  }
  return doc(db, colName, docId);
};

export { serverTimestamp };
