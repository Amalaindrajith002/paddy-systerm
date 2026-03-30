import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDOkvUVIeIpLPVs8Dof4J6WSt_Ws_zlldE",
  authDomain: "paddy-system-1164f.firebaseapp.com",
  projectId: "paddy-system-1164f",
  storageBucket: "paddy-system-1164f.appspot.com",
  messagingSenderId: "705678263328",
  appId: "1:705678263328:web:a6c5acab4b344a99d09a0f",
  measurementId: "G-2N4YTMMK80",
};

console.log("Initializing Firebase with config:", firebaseConfig);

let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized:", app);
  db = getFirestore(app);
  console.log("Firestore db initialized:", db);
  auth = getAuth(app);
  console.log("Firebase auth initialized:", auth);
} catch (e) {
  console.error("Firebase initialization error:", e);
  throw e;
}

export { db, auth };

// optional Health-check helper
export async function checkFirestoreConnection() {
  try {
    const { getDocs, collection } = await import("firebase/firestore");
    const snapshot = await getDocs(collection(db, "farmers"));
    console.log("Firestore readiness check success, farmers count:", snapshot.size);
    return true;
  } catch (error) {
    console.error("Firestore readiness check failed:", error);
    return false;
  }
}