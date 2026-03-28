import { useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";
import AddFarmer from "./AddFarmer";
import AddLoan from "./AddLoan";
import AddPurchase from "./AddPurchase";
import Search from "./Search";
import FarmersTable from "./FarmersTable";

function App() {
  const [page, setPage] = useState("dashboard");

  const pageComponents = {
    dashboard: <Dashboard />,
    addFarmer: <AddFarmer />,
    addLoan: <AddLoan />,
    addPurchase: <AddPurchase />,
    search: <Search />,
    farmersTable: <FarmersTable />,
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Paddy Buying Dashboard</h1>
          <p>Real-time overview of farmer activity and financial flows</p>
        </div>
      </header>

      <nav className="page-nav">
        <button className={page === "dashboard" ? "active" : ""} onClick={() => setPage("dashboard")}>Dashboard</button>
        <button className={page === "addFarmer" ? "active" : ""} onClick={() => setPage("addFarmer")}>Add Farmer</button>
        <button className={page === "addLoan" ? "active" : ""} onClick={() => setPage("addLoan")}>Add Loan</button>
        <button className={page === "addPurchase" ? "active" : ""} onClick={() => setPage("addPurchase")}>Add Purchase</button>
        <button className={page === "search" ? "active" : ""} onClick={() => setPage("search")}>Search</button>
        <button className={page === "farmersTable" ? "active" : ""} onClick={() => setPage("farmersTable")}>Farmers Table</button>
      </nav>

      <main className="app-container">
        <section className="page-content">
          {pageComponents[page]}
        </section>
      </main>
    </div>
  );
}

export default App;