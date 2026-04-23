// App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Recettes from "./pages/Recettes";
import Depenses from "./pages/Depenses";
import RapportFinancier from "./pages/admin/RapportFinancier";
import GestionUtilisateurs from "./pages/admin/GestionUtilisateurs";
import Clients from "./pages/admin/Clients";
import DepensesAdmin from "./pages/admin/DepensesAdmin";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // ✅ Déconnexion automatique à la fermeture
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleLogin  = (userData) => setUser(userData);
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); };

  const isLoggedIn = !!user;

  return (
    <Router>
      <div className="flex h-screen overflow-hidden">
        {isLoggedIn && <Sidebar user={user} />}
        <div className="flex-1 flex flex-col min-h-0">
          {isLoggedIn && <Header user={user} onLogout={handleLogout} />}
          <main className="flex-1 overflow-y-auto bg-[#f8f5f0]">
            <Routes>
              <Route path="/login"    element={!isLoggedIn ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
              <Route path="/register" element={!isLoggedIn ? <Register /> : <Navigate to="/" />} />

              <Route path="/"         element={<PrivateRoute user={user}><Dashboard /></PrivateRoute>} />
              <Route path="/recettes" element={<PrivateRoute user={user}><Recettes /></PrivateRoute>} />
              <Route path="/depenses" element={<PrivateRoute user={user}><Depenses /></PrivateRoute>} />

              <Route path="/rapport"        element={<PrivateRoute user={user} role="admin"><RapportFinancier /></PrivateRoute>} />
              <Route path="/utilisateurs"   element={<PrivateRoute user={user} role="admin"><GestionUtilisateurs /></PrivateRoute>} />
              <Route path="/clients"        element={<PrivateRoute user={user} role="admin"><Clients /></PrivateRoute>} />
              <Route path="/depenses-admin" element={<PrivateRoute user={user} role="admin"><DepensesAdmin /></PrivateRoute>} />

              <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
