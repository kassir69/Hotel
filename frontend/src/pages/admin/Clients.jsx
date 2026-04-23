// pages/admin/Clients.jsx
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

const BADGE = {
  "Wave":          "bg-blue-100 text-blue-700",
  "Orange Money":  "bg-orange-100 text-orange-700",
  "Carte de crédit": "bg-purple-100 text-purple-700",
  "Carte de débit":  "bg-gray-100 text-gray-600",
};

export default function Clients() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  const fetchClients = async (m, y) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/clients?month=${m}&year=${y}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(month, year); }, [month, year]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y+1); } else setMonth(m => m+1); };

  const filtered = clients.filter(c =>
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search) ||
    c.modePaiement?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRecettes = filtered.reduce((s, c) => s + (c.montantTotal || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-gray-800 font-bold">Liste des clients</h1>
        <p className="text-gray-400 text-sm mt-1">Toutes les réservations avec mode de paiement</p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Sélecteur mois */}
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
          <button onClick={prevMonth} className="text-gray-400 hover:text-primary transition"><ChevronLeft size={18}/></button>
          <span className="font-semibold text-gray-800 text-sm min-w-[130px] text-center">{MOIS[month-1]} {year}</span>
          <button onClick={nextMonth} className="text-gray-400 hover:text-primary transition"><ChevronRight size={18}/></button>
        </div>

        {/* Recherche */}
        <input
          placeholder="Rechercher par nom, téléphone, paiement..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition"
        />
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-green-700 text-xs font-medium">Total clients</p>
          <p className="text-green-800 font-display text-2xl font-bold mt-1">{filtered.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-blue-700 text-xs font-medium">Recettes</p>
          <p className="text-blue-800 font-display text-xl font-bold mt-1">{totalRecettes.toLocaleString("fr-FR")} F</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-blue-700 text-xs font-medium">Wave</p>
          <p className="text-blue-800 font-bold text-xl mt-1">{filtered.filter(c => c.modePaiement === "Wave").length}</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <p className="text-orange-700 text-xs font-medium">Orange Money</p>
          <p className="text-orange-800 font-bold text-xl mt-1">{filtered.filter(c => c.modePaiement === "Orange Money").length}</p>
        </div>
      </div>

      {/* Tableau */}
      {loading ? <p className="text-gray-400 text-sm">Chargement...</p> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-primary text-white">
                <tr>
                  {["Client","Téléphone","Chambre","Date séjour","Nuits","Montant","Mode de paiement","Enregistré par"].map(h => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length > 0 ? filtered.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-semibold text-gray-800">{c.nom}</td>
                    <td className="py-3 px-4 text-gray-500">{c.telephone}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{c.chambreType}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {c.dateDebut ? new Date(c.dateDebut).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{c.nuits}</td>
                    <td className="py-3 px-4 font-bold text-green-700">{c.montantTotal?.toLocaleString("fr-FR")} F</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${BADGE[c.modePaiement] || "bg-gray-100 text-gray-600"}`}>
                        {c.modePaiement || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{c.createdBy?.name || "—"}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="py-8 text-center text-gray-400">Aucun client pour cette période.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
