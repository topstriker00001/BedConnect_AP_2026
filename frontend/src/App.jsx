import React, { useState } from "react";
import Auth from "./pages/Auth";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import "./styles/index.css";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuth, setShowAuth] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowAuth(false);
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand" onClick={() => setShowAuth(false)}>
          🏥 BedConnect
        </div>
        <div className="nav-right">
          {user ? (
            <>
              <span className="user-pill">
                {user.name} ({user.role === "HOSPITAL_ADMIN" ? "Hospital" : "Patient"})
              </span>
              <button className="btn-secondary" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => setShowAuth(!showAuth)}>
              {showAuth ? "Browse Hospitals" : "Login / Register"}
            </button>
          )}
        </div>
      </header>

      <main className="container">
        {showAuth && !user ? (
          <Auth
            onAuthSuccess={(u) => {
              setUser(u);
              setShowAuth(false);
            }}
          />
        ) : user?.role === "HOSPITAL_ADMIN" ? (
          <AdminDashboard />
        ) : (
          <PatientDashboard user={user} onNeedLogin={() => setShowAuth(true)} />
        )}
      </main>
    </div>
  );
}
