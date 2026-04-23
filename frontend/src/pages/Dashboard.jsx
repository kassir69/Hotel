// pages/Dashboard.jsx
import { useState, useEffect } from "react";
import DashboardCard from "../components/DashboardCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const [stats, setStats] = useState({ recettes: 0, depenses: 0, recettesMois: 0, depensesMois: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/api/dashboard`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Erreur dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const envoyerRapport = async () => {
    try {
      const res = await fetch(`${API}/api/rapports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          recettes: stats.recettes,
          depenses: stats.depenses,
          resultatNet: stats.recettes - stats.depenses,
        }),
      });
      const data = await res.json();
      setMessage(res.ok ? "✅ Rapport du jour envoyé à l'administrateur." : `❌ ${data.message}`);
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setMessage("❌ Erreur réseau.");
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;

  const resultatNet = stats.recettes - stats.depenses;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="font-display text-2xl text-gray-800 font-bold">Tableau de bord</h1>
        <p className="text-gray-400 text-sm mt-1">Résumé financier du jour</p>
      </div>

      {/* Cartes du jour */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Aujourd'hui</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard title="Recettes du jour" amount={stats.recettes} color="green" />
          <DashboardCard title="Dépenses du jour" amount={stats.depenses} color="red" />
          <DashboardCard title="Résultat net" amount={resultatNet} color={resultatNet >= 0 ? "blue" : "red"} />
        </div>
      </div>

      {/* Cartes du mois */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ce mois</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard title="Recettes du mois" amount={stats.recettesMois} color="green" subtitle="Total cumulé" />
          <DashboardCard title="Dépenses du mois" amount={stats.depensesMois} color="yellow" subtitle="Total cumulé" />
        </div>
      </div>

      {/* Bouton rapport — employé seulement */}
      {user.role === "receptionniste" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-1">Envoyer le rapport du jour</h3>
          <p className="text-gray-400 text-sm mb-4">
            Cliquez pour transmettre le résumé financier d'aujourd'hui à l'administrateur.
          </p>
          <button onClick={envoyerRapport}
            className="bg-secondary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-yellow-800 transition text-sm">
            Envoyer le rapport
          </button>
          {message && <p className="mt-3 text-sm font-medium text-gray-700">{message}</p>}
        </div>
      )}
    </div>
  );
}
