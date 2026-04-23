// pages/Recettes.jsx
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CHAMBRES = [
  { type: "Studio Climatisé",         prix: 12000 },
  { type: "Studio Ventilé",           prix: 7000  },
  { type: "Grande Chambre Climatisée",prix: 10000 },
  { type: "Grande Chambre Ventilée",  prix: 7000  },
  { type: "Petite Chambre Climatisée",prix: 10000 },
  { type: "Petite Chambre Ventilée",  prix: 5000  },
];

const today = () => new Date().toISOString().split("T")[0];

export default function Recettes() {
  const [showForm, setShowForm]   = useState(false);
  const [formData, setFormData]   = useState({ chambreType: "", nom: "", telephone: "", nuits: 1, dateDebut: today() });
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]     = useState(false);

  const chambre      = CHAMBRES.find(c => c.type === formData.chambreType);
  const montantTotal = chambre ? chambre.prix * Number(formData.nuits) : 0;

  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchReservations = async () => {
    try {
      const res  = await fetch(`${API}/api/recettes`, { headers });
      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleReserver = (type) => {
    setFormData({ chambreType: type, nom: "", telephone: "", nuits: 1, dateDebut: today() });
    setShowForm(true);
    setTimeout(() => document.getElementById("form-resa")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/recettes`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setShowForm(false);
      setFormData({ chambreType: "", nom: "", telephone: "", nuits: 1, dateDebut: today() });
      fetchReservations();
    } catch (err) { alert("Erreur : " + err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette réservation ?")) return;
    await fetch(`${API}/api/recettes/${id}`, { method: "DELETE", headers });
    fetchReservations();
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="font-display text-2xl text-gray-800 font-bold">Réservations</h1>
        <p className="text-gray-400 text-sm mt-1">Sélectionnez une chambre pour enregistrer une réservation</p>
      </div>

      {/* Grille des chambres */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CHAMBRES.map((c) => (
          <div key={c.type} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">{c.type}</h3>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                {c.prix.toLocaleString("fr-FR")} F/nuit
              </span>
            </div>
            <button onClick={() => handleReserver(c.type)}
              className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-red-900 transition">
              Réserver
            </button>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div id="form-resa" className="bg-white border border-secondary/20 rounded-2xl p-6 shadow-sm">
          <h3 className="font-display text-xl text-primary font-bold mb-5">Nouvelle réservation</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="text-sm text-gray-600 font-medium block mb-1">Chambre</label>
              <input value={formData.chambreType} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50" />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-medium block mb-1">Prix / nuit</label>
              <input value={`${chambre?.prix.toLocaleString("fr-FR")} FCFA`} readOnly
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 text-green-700 font-bold" />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium block mb-1">Nom du client</label>
              <input type="text" required value={formData.nom}
                onChange={e => setFormData(p => ({ ...p, nom: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition" />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-medium block mb-1">Téléphone</label>
              <input type="tel" required value={formData.telephone}
                onChange={e => setFormData(p => ({ ...p, telephone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition" />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium block mb-1">Date de début du séjour</label>
              <input type="date" required value={formData.dateDebut}
                onChange={e => setFormData(p => ({ ...p, dateDebut: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition" />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-medium block mb-1">Nombre de nuits</label>
              <input type="text" inputMode="numeric" required value={formData.nuits}
                onChange={e => setFormData(p => ({ ...p, nuits: e.target.value.replace(/[^0-9]/g,"") || 1 }))}
                onFocus={e => e.target.select()}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 font-medium block mb-1">Montant total</label>
              <input value={`${montantTotal.toLocaleString("fr-FR")} FCFA`} readOnly
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 text-primary font-bold text-lg" />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-secondary text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-yellow-800 transition disabled:opacity-60">
                {loading ? "Enregistrement..." : "Valider la réservation"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200 transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau */}
      <div>
        <h2 className="font-display text-xl text-gray-800 font-bold mb-4">Liste des réservations</h2>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <table className="min-w-full">
            <thead className="bg-primary text-white">
              <tr>
                {["Client","Téléphone","Chambre","Date séjour","Nuits","Montant","Action"].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reservations.length > 0 ? reservations.map(r => (
                <tr key={r._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-sm font-medium text-gray-800">{r.nom}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{r.telephone}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{r.chambreType}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {r.dateDebut ? new Date(r.dateDebut).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{r.nuits}</td>
                  <td className="py-3 px-4 text-sm font-bold text-green-700">{r.montantTotal?.toLocaleString("fr-FR")} F</td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleDelete(r._id)} className="text-red-400 hover:text-red-600 transition p-1 rounded">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">Aucune réservation.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
