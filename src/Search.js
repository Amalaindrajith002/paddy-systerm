import { useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

function Search() {
  const [idNumber, setIdNumber] = useState("");
  const [season, setSeason] = useState("Both");
  const [final, setFinal] = useState(0);
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [farmerAddress, setFarmerAddress] = useState("");
  const [summary, setSummary] = useState({
    yala: { purchases: { total: 0, count: 0, kilos: 0, byRice: {} }, loans: { total: 0, count: 0, byRice: {} } },
    maha: { purchases: { total: 0, count: 0, kilos: 0, byRice: {} }, loans: { total: 0, count: 0, byRice: {} } },
    both: { purchases: { total: 0, count: 0, kilos: 0 }, loans: { total: 0, count: 0 } }
  });

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
        setFarmerName("(unknown)");
        setFarmerPhone("(unknown)");
        setFarmerAddress("(unknown)");
      }
    } catch (error) {
      console.error("Error fetching farmer details:", error);
      setFarmerName("(error)");
    }
  };

  const search = async () => {
    if (!idNumber.trim()) {
      alert("Please enter ID Number to search.");
      return;
    }

    try {
      const yala = { purchases: { total: 0, count: 0, kilos: 0, byRice: {} }, loans: { total: 0, count: 0, byRice: {} } };
      const maha = { purchases: { total: 0, count: 0, kilos: 0, byRice: {} }, loans: { total: 0, count: 0, byRice: {} } };

      const purchaseSnapshot = await getDocs(collection(db, "purchases"));
      purchaseSnapshot.forEach(doc => {
        const d = doc.data();
        if (d.idNumber === idNumber || d.nic === idNumber) {
          const riceType = d.riceType || "Unknown";
          const amount = Number(d.amount || 0);
          const kilos = Number(d.kilograms || 0);
          if (d.season === "Yala") {
            yala.purchases.total += amount;
            yala.purchases.count += 1;
            yala.purchases.kilos += kilos;
            yala.purchases.byRice[riceType] = yala.purchases.byRice[riceType] || { amount: 0, kilos: 0 };
            yala.purchases.byRice[riceType].amount += amount;
            yala.purchases.byRice[riceType].kilos += kilos;
          } else if (d.season === "Maha") {
            maha.purchases.total += amount;
            maha.purchases.count += 1;
            maha.purchases.kilos += kilos;
            maha.purchases.byRice[riceType] = maha.purchases.byRice[riceType] || { amount: 0, kilos: 0 };
            maha.purchases.byRice[riceType].amount += amount;
            maha.purchases.byRice[riceType].kilos += kilos;
          }
        }
      });

      const loanSnapshot = await getDocs(collection(db, "loans"));
      loanSnapshot.forEach(doc => {
        const d = doc.data();
        if (d.idNumber === idNumber || d.nic === idNumber) {
          const riceType = d.riceType || "Unknown";
          const amount = Number(d.amount || 0);
          if (d.season === "Yala") {
            yala.loans.total += amount;
            yala.loans.count += 1;
            yala.loans.byRice[riceType] = (yala.loans.byRice[riceType] || 0) + amount;
          } else if (d.season === "Maha") {
            maha.loans.total += amount;
            maha.loans.count += 1;
            maha.loans.byRice[riceType] = (maha.loans.byRice[riceType] || 0) + amount;
          }
        }
      });

      const both = {
        purchases: { total: yala.purchases.total + maha.purchases.total, count: yala.purchases.count + maha.purchases.count, kilos: yala.purchases.kilos + maha.purchases.kilos },
        loans: { total: yala.loans.total + maha.loans.total, count: yala.loans.count + maha.loans.count }
      };

      const finalBalance = both.purchases.total - both.loans.total;
      setFinal(finalBalance);
      setSummary({ yala, maha, both });
    } catch (error) {
      console.error("Search read error", error);
      alert("Failed to read data. Please check database connection and console for details.");
    }
  };

  return (
    <div className="card">
      <h3>Search Farmer</h3>
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
        <option>Both</option>
      </select>
      <button onClick={search}>Search</button>

      <h2>Final Balance: Rs. {final}</h2>
      <div style={{ marginTop: "16px" }}>
        <h4>Farmer Details</h4>
        <p><strong>ID Number:</strong> {idNumber || "-"}</p>
        <p><strong>Name:</strong> {farmerName || "-"}</p>
        <p><strong>Phone:</strong> {farmerPhone || "-"}</p>
        <p><strong>Address:</strong> {farmerAddress || "-"}</p>
      </div>

      {season === "Both" && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ color: "#4CAF50", fontSize: "1.4rem", fontWeight: "bold", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>Yala Season Summary</h3>
          <div style={{ background: "linear-gradient(135deg, #E8F5E8, #F1F8E9)", padding: "15px", borderRadius: "10px", marginBottom: "15px", border: "2px solid #C8E6C9", boxShadow: "0 4px 12px rgba(76, 175, 80, 0.2)" }}>
            <h4 style={{ color: "#2E7D32", marginTop: 0 }}>Purchases</h4>
            <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#1B5E20" }}>Total: Rs. {summary.yala.purchases.total}</p>
            <p style={{ color: "#388E3C" }}>Count: {summary.yala.purchases.count}</p>
            <p style={{ color: "#388E3C" }}>Total Kilos: {summary.yala.purchases.kilos}</p>
            {Object.entries(summary.yala.purchases.byRice).map(([rice, riceData]) => {
              const avgKg = riceData.kilos > 0 ? (riceData.amount / riceData.kilos).toFixed(2) : "0.00";
              return (
                <p key={rice} style={{ color: "#4CAF50", fontWeight: "500" }}>
                  {rice}: {riceData.kilos} kg @ Rs. {avgKg}/kg = Rs. {riceData.amount.toFixed(2)}
                </p>
              );
            })}
          </div>
          <div style={{ background: "linear-gradient(135deg, #FFEBEE, #FCE4EC)", padding: "15px", borderRadius: "10px", marginBottom: "15px", border: "2px solid #F8BBD9", boxShadow: "0 4px 12px rgba(244, 67, 54, 0.2)" }}>
            <h4 style={{ color: "#C62828", marginTop: 0 }}>Loans</h4>
            <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#B71C1C" }}>Total: Rs. {summary.yala.loans.total}</p>
            <p style={{ color: "#D32F2F" }}>Count: {summary.yala.loans.count}</p>
            {Object.entries(summary.yala.loans.byRice).map(([rice, amt]) => (
              <p key={rice} style={{ color: "#E53935", fontWeight: "500" }}>{rice}: Rs. {amt}</p>
            ))}
          </div>
          <p style={{ fontWeight: "bold", fontSize: "1.2rem", color: summary.yala.purchases.total - summary.yala.loans.total >= 0 ? "#2E7D32" : "#C62828", textAlign: "center", padding: "10px", background: summary.yala.purchases.total - summary.yala.loans.total >= 0 ? "#E8F5E8" : "#FFEBEE", borderRadius: "8px", border: `2px solid ${summary.yala.purchases.total - summary.yala.loans.total >= 0 ? "#4CAF50" : "#F44336"}` }}>
            Net Balance: Rs. {summary.yala.purchases.total - summary.yala.loans.total}
          </p>

          <h3 style={{ color: "#2196F3", fontSize: "1.4rem", fontWeight: "bold", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>Maha Season Summary</h3>
          <div style={{ background: "linear-gradient(135deg, #E3F2FD, #BBDEFB)", padding: "15px", borderRadius: "10px", marginBottom: "15px", border: "2px solid #90CAF9", boxShadow: "0 4px 12px rgba(33, 150, 243, 0.2)" }}>
            <h4 style={{ color: "#1565C0", marginTop: 0 }}>Purchases</h4>
            <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#0D47A1" }}>Total: Rs. {summary.maha.purchases.total}</p>
            <p style={{ color: "#1976D2" }}>Count: {summary.maha.purchases.count}</p>
            <p style={{ color: "#1976D2" }}>Total Kilos: {summary.maha.purchases.kilos}</p>
            {Object.entries(summary.maha.purchases.byRice).map(([rice, riceData]) => {
              const avgKg = riceData.kilos > 0 ? (riceData.amount / riceData.kilos).toFixed(2) : "0.00";
              return (
                <p key={rice} style={{ color: "#2196F3", fontWeight: "500" }}>
                  {rice}: {riceData.kilos} kg @ Rs. {avgKg}/kg = Rs. {riceData.amount.toFixed(2)}
                </p>
              );
            })}
          </div>
          <div style={{ background: "linear-gradient(135deg, #FCE4EC, #F8BBD9)", padding: "15px", borderRadius: "10px", marginBottom: "15px", border: "2px solid #F48FB1", boxShadow: "0 4px 12px rgba(233, 30, 99, 0.2)" }}>
            <h4 style={{ color: "#AD1457", marginTop: 0 }}>Loans</h4>
            <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#880E4F" }}>Total: Rs. {summary.maha.loans.total}</p>
            <p style={{ color: "#C2185B" }}>Count: {summary.maha.loans.count}</p>
            {Object.entries(summary.maha.loans.byRice).map(([rice, amt]) => (
              <p key={rice} style={{ color: "#E91E63", fontWeight: "500" }}>{rice}: Rs. {amt}</p>
            ))}
          </div>
          <p style={{ fontWeight: "bold", fontSize: "1.2rem", color: summary.maha.purchases.total - summary.maha.loans.total >= 0 ? "#1565C0" : "#AD1457", textAlign: "center", padding: "10px", background: summary.maha.purchases.total - summary.maha.loans.total >= 0 ? "#E3F2FD" : "#FCE4EC", borderRadius: "8px", border: `2px solid ${summary.maha.purchases.total - summary.maha.loans.total >= 0 ? "#2196F3" : "#E91E63"}` }}>
            Net Balance: Rs. {summary.maha.purchases.total - summary.maha.loans.total}
          </p>

          <h3 style={{ color: "#FF9800", fontSize: "1.4rem", fontWeight: "bold", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>Overall Summary (Both Seasons)</h3>
          <div style={{ background: "linear-gradient(135deg, #FFF3E0, #FFECB3)", padding: "15px", borderRadius: "10px", marginBottom: "15px", border: "2px solid #FFE082", boxShadow: "0 4px 12px rgba(255, 152, 0, 0.2)" }}>
            <h4 style={{ color: "#E65100", marginTop: 0 }}>Purchases</h4>
            <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#BF360C" }}>Total: Rs. {summary.both.purchases.total}</p>
            <p style={{ color: "#EF6C00" }}>Count: {summary.both.purchases.count}</p>
            <p style={{ color: "#EF6C00" }}>Total Kilos: {summary.both.purchases.kilos}</p>
          </div>
          <div style={{ background: "linear-gradient(135deg, #FBE9E7, #FFCCBC)", padding: "15px", borderRadius: "10px", marginBottom: "15px", border: "2px solid #FFAB91", boxShadow: "0 4px 12px rgba(244, 67, 54, 0.2)" }}>
            <h4 style={{ color: "#D84315", marginTop: 0 }}>Loans</h4>
            <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#BF360C" }}>Total: Rs. {summary.both.loans.total}</p>
            <p style={{ color: "#E64A19" }}>Count: {summary.both.loans.count}</p>
          </div>
          <p style={{ fontWeight: "bold", fontSize: "1.3rem", color: final >= 0 ? "#2E7D32" : "#C62828", textAlign: "center", padding: "15px", background: final >= 0 ? "linear-gradient(135deg, #E8F5E8, #C8E6C9)" : "linear-gradient(135deg, #FFEBEE, #EF9A9A)", borderRadius: "10px", border: `3px solid ${final >= 0 ? "#4CAF50" : "#F44336"}`, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
            Overall Net Balance: Rs. {final}
          </p>
        </div>
      )}

      {(season === "Yala" || season === "Maha") && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ color: season === "Yala" ? "#4CAF50" : "#2196F3", fontSize: "1.4rem", fontWeight: "bold", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>{season} Season Summary</h3>
          <div style={{ background: season === "Yala" ? "linear-gradient(135deg, #E8F5E8, #F1F8E9)" : "linear-gradient(135deg, #E3F2FD, #BBDEFB)", padding: "15px", borderRadius: "10px", marginBottom: "15px", border: `2px solid ${season === "Yala" ? "#C8E6C9" : "#90CAF9"}`, boxShadow: `0 4px 12px ${season === "Yala" ? "rgba(76, 175, 80, 0.2)" : "rgba(33, 150, 243, 0.2)"}` }}>
            <h4 style={{ color: season === "Yala" ? "#2E7D32" : "#1565C0", marginTop: 0 }}>Purchases</h4>
            <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: season === "Yala" ? "#1B5E20" : "#0D47A1" }}>Total: Rs. {summary[season.toLowerCase()].purchases.total}</p>
            <p style={{ color: season === "Yala" ? "#388E3C" : "#1976D2" }}>Count: {summary[season.toLowerCase()].purchases.count}</p>
            <p style={{ color: season === "Yala" ? "#388E3C" : "#1976D2" }}>Total Kilos: {summary[season.toLowerCase()].purchases.kilos}</p>
            {Object.entries(summary[season.toLowerCase()].purchases.byRice).map(([rice, riceData]) => {
              const avgKg = riceData.kilos > 0 ? (riceData.amount / riceData.kilos).toFixed(2) : "0.00";
              return (
                <p key={rice} style={{ color: season === "Yala" ? "#4CAF50" : "#2196F3", fontWeight: "500" }}>
                  {rice}: {riceData.kilos} kg @ Rs. {avgKg}/kg = Rs. {riceData.amount.toFixed(2)}
                </p>
              );
            })}
          </div>
          <div style={{ background: season === "Yala" ? "linear-gradient(135deg, #FFEBEE, #FCE4EC)" : "linear-gradient(135deg, #FCE4EC, #F8BBD9)", padding: "15px", borderRadius: "10px", marginBottom: "15px", border: `2px solid ${season === "Yala" ? "#F8BBD9" : "#F48FB1"}`, boxShadow: `0 4px 12px ${season === "Yala" ? "rgba(244, 67, 54, 0.2)" : "rgba(233, 30, 99, 0.2)"}` }}>
            <h4 style={{ color: season === "Yala" ? "#C62828" : "#AD1457", marginTop: 0 }}>Loans</h4>
            <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: season === "Yala" ? "#B71C1C" : "#880E4F" }}>Total: Rs. {summary[season.toLowerCase()].loans.total}</p>
            <p style={{ color: season === "Yala" ? "#D32F2F" : "#C2185B" }}>Count: {summary[season.toLowerCase()].loans.count}</p>
            {Object.entries(summary[season.toLowerCase()].loans.byRice).map(([rice, amt]) => (
              <p key={rice} style={{ color: season === "Yala" ? "#E53935" : "#E91E63", fontWeight: "500" }}>{rice}: Rs. {amt}</p>
            ))}
          </div>
          <p style={{ fontWeight: "bold", fontSize: "1.2rem", color: summary[season.toLowerCase()].purchases.total - summary[season.toLowerCase()].loans.total >= 0 ? (season === "Yala" ? "#2E7D32" : "#1565C0") : (season === "Yala" ? "#C62828" : "#AD1457"), textAlign: "center", padding: "10px", background: summary[season.toLowerCase()].purchases.total - summary[season.toLowerCase()].loans.total >= 0 ? (season === "Yala" ? "#E8F5E8" : "#E3F2FD") : (season === "Yala" ? "#FFEBEE" : "#FCE4EC"), borderRadius: "8px", border: `2px solid ${summary[season.toLowerCase()].purchases.total - summary[season.toLowerCase()].loans.total >= 0 ? (season === "Yala" ? "#4CAF50" : "#2196F3") : (season === "Yala" ? "#F44336" : "#E91E63")}` }}>
            Net Balance: Rs. {summary[season.toLowerCase()].purchases.total - summary[season.toLowerCase()].loans.total}
          </p>
        </div>
      )}
    </div>
  );
}

export default Search;