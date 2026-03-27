import { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

function AddLoan() {
  const [idNumber, setIdNumber] = useState("");
  const [season, setSeason] = useState("Yala");
  const [seedRice, setSeedRice] = useState("Yes");
  const [riceType, setRiceType] = useState("Samba");
  const [kilograms, setKilograms] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [farmerAddress, setFarmerAddress] = useState("");

  const fetchFarmerById = async (valueId) => {
    const trimmedId = valueId.trim();
    if (!trimmedId) {
      setFarmerName("");
      setFarmerPhone("");
      setFarmerAddress("");
      return;
    }

    try {
      const farmerQuery = query(collection(db, "farmers"), where("idNumber", "==", trimmedId));
      const farmerSnapshot = await getDocs(farmerQuery);
      if (!farmerSnapshot.empty) {
        const farmerData = farmerSnapshot.docs[0].data();
        setFarmerName(farmerData.name || "");
        setFarmerPhone(farmerData.phone || "");
        setFarmerAddress(farmerData.address || "");
      } else {
        setFarmerName("");
        setFarmerPhone("");
        setFarmerAddress("");
      }
    } catch (error) {
      console.error("Error fetching farmer details:", error);
    }
  };

  const save = async () => {
    const kg = Number(kilograms);
    const price = Number(pricePerKg);

    if (!idNumber.trim()) {
      alert("Please enter ID Number");
      return;
    }

    const farmerQuery = query(collection(db, "farmers"), where("idNumber", "==", idNumber.trim()));
    const farmerSnapshot = await getDocs(farmerQuery);
    if (farmerSnapshot.empty) {
      alert("This ID number is not registered. Please add farmer first.");
      return;
    }

    if (!kg || kg <= 0) {
      alert("Enter valid kilograms");
      return;
    }
    if (!price || price <= 0) {
      alert("Enter valid price per kg");
      return;
    }

    const amount = kg * price;
    try {
      await addDoc(collection(db, "loans"), {
        idNumber,
        nic: idNumber,
        season,
        seedRice,
        riceType,
        kilograms: kg,
        pricePerKg: price,
        amount,
        farmerName,
        farmerPhone,
        farmerAddress,
      });

      alert("Loan Added");
      setKilograms("");
      setPricePerKg("");
    } catch (error) {
      console.error("AddLoan save error", error);
      alert("Failed to save loan. Please check database connection and console for details.");
    }
  }; 

  return (
    <div className="card">
      <h3>Add Loan</h3>
      <input
        placeholder="Farmer ID Number"
        value={idNumber}
        onChange={e => {
          const nextId = e.target.value;
          setIdNumber(nextId);
          fetchFarmerById(nextId);
        }}
      />
      <select value={season} onChange={e=>setSeason(e.target.value)}>
        <option>Yala</option>
        <option>Maha</option>
      </select>
      <div style={{ margin: "8px 0", fontSize: "0.9rem", color: "#333" }}>
        <div>Name: {farmerName || "(not found yet)"}</div>
        <div>Phone: {farmerPhone || "(not found yet)"}</div>
        <div>Address: {farmerAddress || "(not found yet)"}</div>
      </div>
      <select value={seedRice} onChange={e=>setSeedRice(e.target.value)}>
        <option>Yes</option>
        <option>No</option>
      </select>
      <select value={riceType} onChange={e=>setRiceType(e.target.value)}>
        <option>Samba</option>
        <option>Nadu</option>
        <option>Ponni</option>
        <option>Other</option>
      </select>
      <input
        placeholder="Kilograms"
        type="number"
        value={kilograms}
        onChange={e=>setKilograms(e.target.value)}
      />
      <input
        placeholder="Price per kg"
        type="number"
        value={pricePerKg}
        onChange={e=>setPricePerKg(e.target.value)}
      />
      <div style={{ margin: "6px 0", fontWeight: 600 }}>
        Estimated Amount: Rs. {(Number(kilograms) * Number(pricePerKg) || 0).toFixed(2)}
      </div>
      <button onClick={save}>Save</button>
    </div>
  );
}

export default AddLoan;