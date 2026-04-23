// pages/admin/DepensesAdmin.jsx
import { useState, useEffect } from "react";
import { Trash2, Pencil, ChevronLeft, ChevronRight, Check, X } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

const TYPE_BADGE = {
  fixe:          "bg-red-100 text-red-700",
  autre:         "bg-yellow-100 text-yellow-700",
  personnalisee: "bg-purple-100 text-purple-700",
};

export default function DepensesAdmin() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [depenses, setDepenses] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [editId, setEditId]     = useState(null);
  const [editData, setEditData] = useState({ libelle: "", montant: "" });
  const token = localStorage.getItem("token");

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y+1); } else setMonth(m => m+1); };

  const fetchDepenses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/depenses?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDepenses(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDepenses(); }, [month, year]);

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette dépense ?")) return;
    await fetch(`${API}/api/depenses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchDepenses();
  };

  const startEdit = (dep) => {
    setEditId(dep._id);
    setEditData({ libelle: dep.libelle, montant: dep.montant });
  };

  const cancelEdit = () => { setEditId(null); setEditData({ libelle: "", montant: "" }); };

  const saveEdit = async (id) => {
    await fetch(`${API}/api/depenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ libelle: editData.libelle, montant: parseFloat(editData.montant) }),
    });
    setEditId(null);
    fetchDepenses();
  };

  const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0);
  const totalFixes    = depenses.filter(d => d.type === "fixe").reduce((s, d) => s + d.montant, 0);
  const totalAutres   = depenses.filter(d => d.type !== "fixe").reduce((s, d) => s + d.montant, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-gray-800 font-bold">Dépenses</h1>
        <p className="text-gray-400 text-sm mt-1">Historique complet — modification et suppression disponibles</p>
      </div>

      {/* Sélecteur mois */}
      <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm w-fit">
        <button onClick={prevMonth} className="text-gray-400 hover:text-primary transition"><ChevronLeft size={20}/></button>
        <span className="font-semibold text-gray-800 text-sm min-w-[150px] text-center">{MOIS[month-1]} {year}</span>
        <button onClick={nextMonth} className="text-gray-400 hover:text-primary transition"><ChevronRight size={20}/></button>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <p className="text-red-700 text-xs font-medium">Total dépenses</p>
          <p className="text-red-800 font-display text-2xl font-bold mt-1">{totalDepenses.toLocaleString("fr-FR")} F</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <p className="text-orange-700 text-xs font-medium">Charges fixes</p>
          <p className="text-orange-800 font-bold text-xl mt-1">{totalFixes.toLocaleString("fr-FR")} F</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
          <p className="text-yellow-700 text-xs font-medium">Autres dépenses</p>
          <p className="text-yellow-800 font-bold text-xl mt-1">{totalAutres.toLocaleString("fr-FR")} F</p>
        </div>
      </div>

      {/* Tableau */}
      {loading ? <p className="text-gray-400 text-sm">Chargement...</p> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-primary text-white">
                <tr>
                  {["Date","Libellé","Type","Montant","Enregistré par","Actions"].map(h => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {depenses.length > 0 ? depenses.map(d => (
                  <tr key={d._id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(d.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {editId === d._id ? (
                        <input value={editData.libelle}
                          onChange={e => setEditData(p => ({ ...p, libelle: e.target.value }))}
                          className="border border-primary rounded px-2 py-1 text-sm w-full focus:outline-none" />
                      ) : d.libelle}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TYPE_BADGE[d.type] || "bg-gray-100 text-gray-600"}`}>
                        {d.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-red-600">
                      {editId === d._id ? (
                        <input type="text" inputMode="numeric" value={editData.montant}
                          onChange={e => setEditData(p => ({ ...p, montant: e.target.value.replace(/[^0-9]/g,"") }))}
                          className="border border-primary rounded px-2 py-1 text-sm w-28 focus:outline-none" />
                      ) : `${d.montant.toLocaleString("fr-FR")} F`}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{d.createdBy?.name || "—"}</td>
                    <td className="py-3 px-4">
                      {editId === d._id ? (
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(d._id)}
                            className="text-green-500 hover:text-green-700 transition p-1 rounded hover:bg-green-50">
                            <Check size={16}/>
                          </button>
                          <button onClick={cancelEdit}
                            className="text-gray-400 hover:text-gray-600 transition p-1 rounded hover:bg-gray-50">
                            <X size={16}/>
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(d)}
                            className="text-secondary hover:text-yellow-800 transition p-1 rounded hover:bg-yellow-50">
                            <Pencil size={15}/>
                          </button>
                          <button onClick={() => handleDelete(d._id)}
                            className="text-red-400 hover:text-red-600 transition p-1 rounded hover:bg-red-50">
                            <Trash2 size={15}/>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">Aucune dépense pour cette période.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
