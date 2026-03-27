import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function Dashboard() {
  const [summary, setSummary] = useState({
    farmers: 0,
    loans: 0,
    purchases: 0,
    balance: 0,
  });

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const farmersSnap = await getDocs(collection(db, "farmers"));
        const loansSnap = await getDocs(collection(db, "loans"));
        const purchasesSnap = await getDocs(collection(db, "purchases"));

        let loanTotal = 0;
        let purchaseTotal = 0;

        loansSnap.forEach(doc => {
          const d = doc.data();
          loanTotal += Number(d.amount) || 0;
        });

        purchasesSnap.forEach(doc => {
          const d = doc.data();
          purchaseTotal += Number(d.amount) || 0;
        });

        setSummary({
          farmers: farmersSnap.size,
          loans: loansSnap.size,
          purchases: purchasesSnap.size,
          balance: purchaseTotal - loanTotal,
        });
      } catch (error) {
        console.error("Dashboard load error", error);
      }
    };

    loadSummary();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <h3>Total Farmers</h3>
        <p>{summary.farmers}</p>
      </div>
      <div className="dashboard-card">
        <h3>Total Purchases</h3>
        <p>{summary.purchases}</p>
      </div>
      <div className="dashboard-card">
        <h3>Total Loans</h3>
        <p>{summary.loans}</p>
      </div>
      <div className="dashboard-card">
        <h3>Net Balance</h3>
        <p>Rs. {summary.balance}</p>
      </div>
    </div>
  );
}

export default Dashboard;
