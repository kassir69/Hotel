// pages/admin/GestionUtilisateurs.jsx
import { useState, useEffect } from "react";
import { Trash2, Shield, User } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function GestionUtilisateurs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchUsers = () => {
    fetch(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const changerRole = async (id, role) => {
    await fetch(`${API}/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role }),
    });
    fetchUsers();
  };

  const supprimer = async (id) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await fetch(`${API}/api/admin/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchUsers();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-gray-800 font-bold">Gestion des utilisateurs</h1>
        <p className="text-gray-400 text-sm mt-1">Gérez les comptes et rôles des réceptionnistes</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {users.map((u) => (
            <div key={u._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${u.role === "admin" ? "bg-primary" : "bg-secondary"}`}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{u.name}
                    {u._id === currentUser.id && <span className="ml-2 text-xs text-gray-400">(vous)</span>}
                  </p>
                  <p className="text-gray-400 text-xs">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${u.role === "admin" ? "bg-red-100 text-primary" : "bg-yellow-100 text-secondary"}`}>
                  {u.role === "admin" ? "Admin" : "Réceptionniste"}
                </span>
                {u._id !== currentUser.id && (
                  <>
                    <button
                      onClick={() => changerRole(u._id, u.role === "admin" ? "receptionniste" : "admin")}
                      title={u.role === "admin" ? "Rétrograder" : "Promouvoir admin"}
                      className="text-secondary hover:text-yellow-800 transition p-1.5 rounded-lg hover:bg-yellow-50">
                      <Shield size={16} />
                    </button>
                    <button onClick={() => supprimer(u._id)}
                      className="text-red-400 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
