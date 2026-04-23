/// pages/Recettes.jsx
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CHAMBRES = [
  { num: 3,  type: "Studio Climatisé",          prix: 12000 },
  { num: 4,  type: "Studio Climatisé",          prix: 12000 },
  { num: 5,  type: "Studio Climatisé",          prix: 12000 },
  { num: 1,  type: "Studio Ventilé",            prix: 7000  },
  { num: 2,  type: "Studio Ventilé",            prix: 7000  },
  { num: 6,  type: "Studio Ventilé",            prix: 7000  },
  { num: 7,  type: "Grande Chambre Climatisée", prix: 10000 },
  { num: 10, type: "Grande Chambre Climatisée", prix: 10000 },
  { num: 11, type: "Grande Chambre Ventilée",   prix: 7000  },
  { num: 14, type: "Grande Chambre Ventilée",   prix: 7000  },
  { num: 8,  type: "Petite Chambre Climatisée", prix: 8000  },
  { num: 9,  type: "Petite Chambre Climatisée", prix: 8000  },
  { num: 12, type: "Petite Chambre Ventilée",   prix: 5000  },
  { num: 13, type: "Petite Chambre Ventilée",   prix: 5000  },
];

const MODES_PAIEMENT = ["Comptant", "Wave", "Orange Money", "Carte de débit", "Carte de crédit"];

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};

const diffNuits = (debut, depart) => {
  if (!debut || !depart) return 0;
  return Math.max(1, Math.round((new Date(depart) - new Date(debut)) / 86400000));
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString("fr-FR");
};

// Groupes pour l'affichage
const GROUPES = [
  { label: "Studios Climatisés",          nums: [3, 4, 5] },
  { label: "Studios Ventilés",            nums: [1, 2, 6] },
  { label: "Grandes Chambres Climatisées",nums: [7, 10]   },
  { label: "Grandes Chambres Ventilées",  nums: [11, 14]  },
  { label: "Petites Chambres Climatisées",nums: [8, 9]    },
  { label: "Petites Chambres Ventilées",  nums: [12, 13]  },
];

export default function Recettes() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    numChambre: "", nom: "", telephone: "",
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
  const todayDate = new Date(); todayDate.setHours(0,0,0,0);
  const chambresOccupees = new Set(
    reservations
      .filter(r => {
        const debut  = new Date(r.dateDebut);  debut.setHours(0,0,0,0);
        const depart = new Date(r.dateDepart); depart.setHours(0,0,0,0);
        return debut <= todayDate && depart > todayDate;
      })
      .map(r => r.numChambre)
  );

  const chambre      = CHAMBRES.find(c => c.num === Number(formData.numChambre));
  const nuits        = diffNuits(formData.dateDebut, formData.dateDepart);
  const montantTotal = chambre ? chambre.prix * nuits : 0;

  const handleReserver = (num) => {
    setFormData({ numChambre: num, nom: "", telephone: "", dateDebut: today(), dateDepart: "", modePaiement: "" });
    setShowForm(true);
    setTimeout(() => document.getElementById("form-resa")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dateDepart) return alert("Veuillez saisir une date de départ.");
    if (new Date(formData.dateDepart) <= new Date(formData.dateDebut))
      return alert("La date de départ doit être après la date d'arrivée.");
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
      setFormData({ numChambre: "", nom: "", telephone: "", dateDebut: today(), dateDepart: "", modePaiement: "" });
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
        <p className="text-gray-400 text-sm mt-1">Cliquez sur une chambre disponible pour enregistrer une réservation</p>
      </div>

      {/* Grille des chambres par groupe */}
      <div className="space-y-6">
        {GROUPES.map(({ label, nums }) => {
          const prix = CHAMBRES.find(c => c.num === nums[0])?.prix;
          return (
            <div key={label}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-semibold text-gray-700 text-sm">{label}</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {prix?.toLocaleString("fr-FR")} FCFA/nuit
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {nums.map(num => {
                  const occupee = chambresOccupees.has(num);
                  const resa    = reservations.find(r => {
                    const debut  = new Date(r.dateDebut);  debut.setHours(0,0,0,0);
                    const depart = new Date(r.dateDepart); depart.setHours(0,0,0,0);
                    return r.numChambre === num && debut <= todayDate && depart > todayDate;
                  });
                  return (
                    <div key={num} className={`relative rounded-2xl border-2 p-4 w-36 transition-all ${
                      occupee
                        ? "border-red-200 bg-red-50 cursor-not-allowed"
                        : "border-green-200 bg-green-50 cursor-pointer hover:shadow-md hover:border-green-400"
                    }`}
                      onClick={() => !occupee && handleReserver(num)}
                    >
                      <div className="text-center">
                        <span className="text-2xl font-display font-bold text-gray-700">#{num}</span>
                        <div className={`mt-2 text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${
                          occupee ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                        }`}>
                          {occupee ? "Occupée" : "Disponible"}
                        </div>
                        {occupee && resa && (
                          <p className="text-xs text-gray-400 mt-1 truncate" title={resa.nom}>
                            {resa.nom}
                          </p>
                        )}
                        {occupee && resa && (
                          <p className="text-xs text-red-400 mt-0.5">
                            jusqu'au {formatDate(resa.dateDepart)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Formulaire */}
      {showForm && chambre && (
        <div id="form-resa" className="bg-white border border-secondary/20 rounded-2xl p-6 shadow-sm">
          <h3 className="font-display text-xl text-primary font-bold mb-1">
            Chambre #{chambre.num} — {chambre.type}
          </h3>
          <p className="text-secondary text-sm font-semibold mb-5">
            {chambre.prix.toLocaleString("fr-FR")} FCFA / nuit
          </p>
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
              <input type="date" required value={formData.dateDepart}
                min={formData.dateDebut}
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
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-600 font-medium" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 font-medium block mb-1">Montant total</label>
              <input value={nuits > 0 ? `${montantTotal.toLocaleString("fr-FR")} FCFA  (${chambre.prix.toLocaleString("fr-FR")} × ${nuits} nuit${nuits > 1 ? "s" : ""})` : "—"} readOnly
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 text-primary font-bold text-base" />
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{ maxHeight: "420px", overflowY: "auto" }}>
          <table className="min-w-full">
            <thead className="bg-primary text-white sticky top-0">
              <tr>
                {["#","Client","Téléphone","Type","Arrivée","Départ","Nuits","Montant","Paiement","Action"].map(h => (
                  <th key={h} className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reservations.length > 0 ? reservations.map(r => (
                <tr key={r._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-3 text-sm font-bold text-primary">#{r.numChambre}</td>
                  <td className="py-3 px-3 text-sm font-medium text-gray-800">{r.nom}</td>
                  <td className="py-3 px-3 text-sm text-gray-500">{r.telephone}</td>
                  <td className="py-3 px-3 text-xs text-gray-500">{r.chambreType}</td>
                  <td className="py-3 px-3 text-sm text-gray-600">{formatDate(r.dateDebut)}</td>
                  <td className="py-3 px-3 text-sm text-gray-600">{formatDate(r.dateDepart)}</td>
                  <td className="py-3 px-3 text-sm text-gray-600">{r.nuits}n</td>
                  <td className="py-3 px-3 text-sm font-bold text-green-700">
                    {r.montantTotal?.toLocaleString("fr-FR")} F
                    <span className="text-xs font-normal text-gray-400 block">
                      {r.prixParNuit?.toLocaleString("fr-FR")}×{r.nuits}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                      r.modePaiement === "Wave"         ? "bg-blue-100 text-blue-700"   :
                      r.modePaiement === "Orange Money" ? "bg-orange-100 text-orange-700" :
                      r.modePaiement === "Comptant"     ? "bg-green-100 text-green-700" :
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
