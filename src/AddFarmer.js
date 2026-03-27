import { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

function AddFarmer() {
  const [idNumber, setIdNumber] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const saveFarmer = async () => {
    const trimmedIdNumber = idNumber.trim();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (!trimmedIdNumber) {
      alert("ID Number is required");
      return;
    }
    if (!trimmedName) {
      alert("Name is required");
      return;
    }
    if (!trimmedPhone) {
      alert("Phone is required");
      return;
    }
    if (!trimmedAddress) {
      alert("Address is required");
      return;
    }

    try {
      console.log("Attempting to save farmer:", { idNumber: trimmedIdNumber, name: trimmedName });
      console.log("DB object:", db);

      if (!db) {
        throw new Error("Firestore DB object is not initialized");
      }

      const existingQuery = query(collection(db, "farmers"), where("idNumber", "==", trimmedIdNumber));
      console.log("Query created:", existingQuery);

      const existing = await getDocs(existingQuery);
      console.log("Existing docs:", existing.size);

      if (!existing.empty) {
        alert("This ID Number is already registered.");
        return;
      }

      const docRef = await addDoc(collection(db, "farmers"), {
        idNumber: trimmedIdNumber,
        nic: trimmedIdNumber,
        name: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
      });
      console.log("Document added with ID:", docRef.id);
      alert("Farmer Added");
      setIdNumber("");
      setName("");
      setPhone("");
      setAddress("");
    } catch (error) {
      console.error("AddFarmer save error", error);
      console.error("Error code:", error?.code);
      console.error("Error message:", error?.message);
      alert(`Failed to save farmer: ${error?.code || "unknown"} - ${error?.message || error}`);
    }
  }; 

  return (
    <div className="card">
      <h3>Add Farmer</h3>
      <input placeholder="ID Number" value={idNumber} onChange={e=>setIdNumber(e.target.value)} />
      <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
      <input placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} />
      <button onClick={saveFarmer}>Save</button>
    </div>
  );
}

export default AddFarmer;