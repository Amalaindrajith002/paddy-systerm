import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

async function testConnection() {
  try {
    console.log("Testing Firebase connection...");
    const querySnapshot = await getDocs(collection(db, "farmers"));
    console.log("Connection successful! Found", querySnapshot.size, "farmers");
  } catch (error) {
    console.error("Firebase connection failed:", error);
  }
}

testConnection();