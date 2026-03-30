import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import "./App.css";
import Dashboard from "./Dashboard";
import AddFarmer from "./AddFarmer";
import AddLoan from "./AddLoan";
import AddPurchase from "./AddPurchase";
import Search from "./Search";
import FarmersTable from "./FarmersTable";
import Login from "./Login";
import Registration from "./Registration";
import { auth } from "./firebase";

function App() {
  const [page, setPage] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    auth.signOut();
    setIsLoggedIn(false);
  };

  const switchToRegistration = () => {
    setShowRegistration(true);
  };

  const switchToLogin = () => {
    setShowRegistration(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    if (showRegistration) {
      return <Registration onRegister={handleRegister} onSwitchToLogin={switchToLogin} />;
    } else {
      return <Login onLogin={handleLogin} onSwitchToRegister={switchToRegistration} />;
    }
  }

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
        <button onClick={handleLogout} className="logout-btn">Logout</button>
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

      <footer className="app-footer">
        <div className="creator-info">
          W A I WEERASOORIYA | 0761722747
        </div>
      </footer>
    </div>
  );
}

export default App;