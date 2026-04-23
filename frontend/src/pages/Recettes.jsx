// pages/Recettes.jsx
import { useState, useEffect } from "react";
import { Trash2, ChevronRight } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CHAMBRES_PAR_TYPE = [
  { type: "Studio Climatisé",          prix: 12000, nums: [3, 4, 5]   },
  { type: "Studio Ventilé",            prix: 7000,  nums: [1, 2, 6]   },
  { type: "Grande Chambre Climatisée", prix: 10000, nums: [7, 10]     },
  { type: "Grande Chambre Ventilée",   prix: 7000,  nums: [11, 14]    },
  { type: "Petite Chambre Climatisée", prix: 8000,  nums: [8, 9]      },
  { type: "Petite Chambre Ventilée",   prix: 5000,  nums: [12, 13]    },
];

const MODES_PAIEMENT = ["Comptant", "Wave", "Orange Money", "Carte de débit"];

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

const diffNuits = (debut, depart) => {
  if (!debut || !depart) return 0;
  return Math.max(0, Math.round((new Date(depart) - new Date(debut)) / 86400000));
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString("fr-FR");
};

export default function Recettes() {
  const [typeSelectionne, setTypeSelectionne] = useState(null); // type cliqué
  const [showForm, setShowForm]   = useState(false);
  const [formData, setFormData]   = useState({
    numChambre: "", chambreType: "", nom: "", telephone: "",
    dateDebut: today(), dateDepart: "", modePaiement: "",
  });
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Chambres occupées AUJOURD'HUI
  const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
  const chambresOccupees = new Set(
    reservations.filter(r => {
      const debut  = new Date(r.dateDebut);  debut.setHours(0,0,0,0);
      const depart = new Date(r.dateDepart); depart.setHours(0,0,0,0);
      return debut <= todayDate && depart > todayDate;
    }).map(r => r.numChambre)
  );

  const chambreInfo = CHAMBRES_PAR_TYPE.find(c => c.type === formData.chambreType);
  const nuits        = diffNuits(formData.dateDebut, formData.dateDepart);
  const montantTotal = chambreInfo ? chambreInfo.prix * nuits : 0;

  const handleTypeClick = (groupe) => {
    setTypeSelectionne(typeSelectionne?.type === groupe.type ? null : groupe);
    setShowForm(false);
  };

  const handleNumClick = (num, groupe) => {
    if (chambresOccupees.has(num)) return;
    setFormData({
      numChambre: num, chambreType: groupe.type,
      nom: "", telephone: "", dateDebut: today(), dateDepart: "", modePaiement: "",
    });
    setShowForm(true);
    setTimeout(() => document.getElementById("form-resa")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dateDepart)  return alert("Veuillez saisir une date de départ.");
    if (nuits <= 0)            return alert("La date de départ doit être après la date d'arrivée.");
    if (!formData.modePaiement) return alert("Veuillez sélectionner un mode de paiement.");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/recettes`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowForm(false);
      setTypeSelectionne(null);
      setFormData({ numChambre:"", chambreType:"", nom:"", telephone:"", dateDebut: today(), dateDepart:"", modePaiement:"" });
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
        <p className="text-gray-400 text-sm mt-1">Sélectionnez un type de chambre pour voir les disponibilités</p>
      </div>

      {/* Grille des types de chambres */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CHAMBRES_PAR_TYPE.map((groupe) => {
          const dispo = groupe.nums.filter(n => !chambresOccupees.has(n)).length;
          const total = groupe.nums.length;
          const isOpen = typeSelectionne?.type === groupe.type;

          return (
            <div key={groupe.type} className={`rounded-2xl border-2 shadow-sm transition-all ${
              isOpen ? "border-secondary bg-secondary/5" : "border-gray-100 bg-white hover:shadow-md"
            }`}>
              {/* En-tête du type */}
              <div
                className="p-5 cursor-pointer"
                onClick={() => handleTypeClick(groupe)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 text-sm">{groupe.type}</h3>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                    {groupe.prix.toLocaleString("fr-FR")} F/nuit
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${dispo > 0 ? "text-green-600" : "text-red-500"}`}>
                    {dispo}/{total} chambre{dispo > 1 ? "s" : ""} disponible{dispo > 1 ? "s" : ""}
                  </span>
                  <ChevronRight size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </div>
              </div>

              {/* Numéros de chambres — visible si type sélectionné */}
              {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 mb-3 font-medium">Choisir une chambre :</p>
                  <div className="flex flex-wrap gap-2">
                    {groupe.nums.map(num => {
                      const occupe = chambresOccupees.has(num);
                      const resa   = reservations.find(r => {
                        const debut  = new Date(r.dateDebut);  debut.setHours(0,0,0,0);
                        const depart = new Date(r.dateDepart); depart.setHours(0,0,0,0);
                        return r.numChambre === num && debut <= todayDate && depart > todayDate;
                      });
                      return (
                        <div key={num} className="text-center">
                          <button
                            onClick={() => handleNumClick(num, groupe)}
                            disabled={occupe}
                            title={occupe && resa ? `Occupée par ${resa.nom} jusqu'au ${formatDate(resa.dateDepart)}` : "Disponible"}
                            className={`w-14 h-14 rounded-xl text-lg font-display font-bold border-2 transition-all ${
                              occupe
                                ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed"
                                : formData.numChambre === num
                                  ? "bg-secondary border-secondary text-white scale-105"
                                  : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:scale-105"
                            }`}
                          >
                            {num}
                          </button>
                          <p className={`text-xs mt-1 font-medium ${occupe ? "text-red-400" : "text-green-600"}`}>
                            {occupe ? "Occupée" : "Libre"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Formulaire */}
      {showForm && chambreInfo && (
        <div id="form-resa" className="bg-white border border-secondary/20 rounded-2xl p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="font-display text-xl text-primary font-bold">
              Chambre #{formData.numChambre} — {chambreInfo.type}
            </h3>
            <p className="text-secondary text-sm font-semibold mt-0.5">
              {chambreInfo.prix.toLocaleString("fr-FR")} FCFA / nuit
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 font-medium block mb-1">Nom du client</label>
              <input type="text" required autoComplete="off" value={formData.nom}
                onChange={e => setFormData(p => ({ ...p, nom: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition" />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium block mb-1">Téléphone</label>
              <input type="tel" required autoComplete="off" value={formData.telephone}
                onChange={e => setFormData(p => ({ ...p, telephone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition" />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium block mb-1">Date d'arrivée</label>
              <input type="date" required value={formData.dateDebut}
                onChange={e => setFormData(p => ({ ...p, dateDebut: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition" />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium block mb-1">Date de départ</label>
              <input type="date" required value={formData.dateDepart} min={formData.dateDebut}
                onChange={e => setFormData(p => ({ ...p, dateDepart: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition" />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium block mb-1">Mode de paiement</label>
              <select required value={formData.modePaiement}
                onChange={e => setFormData(p => ({ ...p, modePaiement: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition bg-white">
                <option value="" disabled>Sélectionner...</option>
                {MODES_PAIEMENT.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium block mb-1">Durée du séjour</label>
              <input value={nuits > 0 ? `${nuits} nuit${nuits > 1 ? "s" : ""}` : "—"} readOnly
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-600" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 font-medium block mb-1">Montant total</label>
              <input
                value={nuits > 0 ? `${montantTotal.toLocaleString("fr-FR")} FCFA` : "—"}
                readOnly
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 text-primary font-bold text-lg"
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-secondary text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-yellow-800 transition disabled:opacity-60">
                {loading ? "Enregistrement..." : "Valider la réservation"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setTypeSelectionne(null); }}
                className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200 transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau des réservations */}
      <div>
        <h2 className="font-display text-xl text-gray-800 font-bold mb-4">Liste des réservations</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{ maxHeight: "420px", overflowY: "auto" }}>
          <table className="min-w-full">
            <thead className="bg-primary text-white sticky top-0">
              <tr>
                {["#","Client","Téléphone","Chambre","Arrivée","Départ","Nuits","Montant","Paiement","Action"].map(h => (
                  <th key={h} className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reservations.length > 0 ? reservations.map(r => (
                <tr key={r._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-3 text-sm font-bold text-primary">#{r.numChambre || "—"}</td>
                  <td className="py-3 px-3 text-sm font-medium text-gray-800">{r.nom}</td>
                  <td className="py-3 px-3 text-sm text-gray-500">{r.telephone}</td>
                  <td className="py-3 px-3 text-xs text-gray-600">{r.chambreType}</td>
                  <td className="py-3 px-3 text-sm text-gray-600">{formatDate(r.dateDebut)}</td>
                  <td className="py-3 px-3 text-sm text-gray-600">{formatDate(r.dateDepart)}</td>
                  <td className="py-3 px-3 text-sm text-gray-600">{r.nuits}n</td>
                  <td className="py-3 px-3 text-sm font-bold text-green-700">{r.montantTotal?.toLocaleString("fr-FR")} F</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                      r.modePaiement === "Wave"         ? "bg-blue-100 text-blue-700"     :
                      r.modePaiement === "Orange Money" ? "bg-orange-100 text-orange-700" :
                      r.modePaiement === "Comptant"     ? "bg-green-100 text-green-700"   :
                      "bg-gray-100 text-gray-600"
                    }`}>{r.modePaiement || "—"}</span>
                  </td>
                  <td className="py-3 px-3">
                    <button onClick={() => handleDelete(r._id)} className="text-red-400 hover:text-red-600 transition p-1 rounded">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={10} className="py-8 text-center text-gray-400 text-sm">Aucune réservation.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
