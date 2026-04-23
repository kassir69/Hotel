// pages/Depenses.jsx
import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CHARGES_FIXES = ["CIE", "SODECI", "FOURNITURES", "PERSONNEL", "CANAL HORIZON", "IMPÔTS FONCIERS", "BURIDA ET POLICE", "LOCATION LOYER"];
const AUTRES_CHARGES = ["Plomberie", "Literie", "Électricité", "Menuiserie", "Entretien général"];

// ⚠️ IMPORTANT : défini EN DEHORS du composant pour éviter le re-mount à chaque frappe
function SectionDepense({ title, list, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
        <h2 className="font-semibold text-gray-700 text-sm">{title}</h2>
      </div>
      <ul className="divide-y divide-gray-50">
        {list.map((d, i) => (
          <li key={i} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-gray-700 flex-1">{d.libelle}</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={d.montant}
                onChange={e => onChange(i, e.target.value.replace(/[^0-9]/g, ""))}
                onFocus={e => e.target.select()}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-36 text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
              />
              <span className="text-gray-400 text-xs">FCFA</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Depenses() {
  const [chargesFixes, setChargesFixes] = useState(
    CHARGES_FIXES.map(l => ({ libelle: l, montant: "" }))
  );
  const [autresCharges, setAutresCharges] = useState(
    AUTRES_CHARGES.map(l => ({ libelle: l, montant: "" }))
  );
  const [personnalisees, setPersonnalisees] = useState([]);
  const [newDep, setNewDep] = useState({ libelle: "", montant: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const updateChargesFixes = (i, val) =>
    setChargesFixes(prev => prev.map((d, idx) => idx === i ? { ...d, montant: val } : d));

  const updateAutresCharges = (i, val) =>
    setAutresCharges(prev => prev.map((d, idx) => idx === i ? { ...d, montant: val } : d));

  const ajouterPersonnalisee = () => {
    if (!newDep.libelle || !newDep.montant) return;
    setPersonnalisees(prev => [...prev, { ...newDep }]);
    setNewDep({ libelle: "", montant: "" });
  };

  const totalDepenses = [...chargesFixes, ...autresCharges, ...personnalisees]
    .reduce((sum, d) => sum + (parseFloat(d.montant) || 0), 0);

  const enregistrer = async () => {
    setLoading(true); setMessage("");
    const depenses = [
      ...chargesFixes.map(d => ({ ...d, montant: parseFloat(d.montant) || 0, type: "fixe" })),
      ...autresCharges.map(d => ({ ...d, montant: parseFloat(d.montant) || 0, type: "autre" })),
      ...personnalisees.map(d => ({ ...d, montant: parseFloat(d.montant) || 0, type: "personnalisee" })),
    ];
    try {
      const res = await fetch(`${API}/api/depenses/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ depenses }),
      });
      const data = await res.json();
      setMessage(res.ok ? `✅ ${data.message}` : `❌ ${data.message}`);
      setTimeout(() => setMessage(""), 4000);
    } catch { setMessage("❌ Erreur réseau."); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-gray-800 font-bold">Dépenses du jour</h1>
        <p className="text-gray-400 text-sm mt-1">Saisissez les montants pour chaque catégorie</p>
      </div>

      <SectionDepense title="Charges fixes" list={chargesFixes} onChange={updateChargesFixes} />
      <SectionDepense title="Autres charges" list={autresCharges} onChange={updateAutresCharges} />

      {/* Dépenses personnalisées */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
          <h2 className="font-semibold text-gray-700 text-sm">Dépenses supplémentaires</h2>
        </div>
        <div className="p-5">
          <div className="flex gap-3 mb-4">
            <input placeholder="Libellé" value={newDep.libelle}
              onChange={e => setNewDep(p => ({ ...p, libelle: e.target.value }))}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
            <input type="text" inputMode="numeric" placeholder="Montant" value={newDep.montant}
              onChange={e => setNewDep(p => ({ ...p, montant: e.target.value.replace(/[^0-9]/g, "") }))}
              onFocus={e => e.target.select()}
              className="w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
            <button onClick={ajouterPersonnalisee}
              className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-800 transition">
              <PlusCircle size={16} /> Ajouter
            </button>
          </div>
          {personnalisees.map((d, i) => (
            <div key={i} className="flex justify-between items-center bg-yellow-50 rounded-lg px-4 py-3 mb-2">
              <span className="text-sm text-gray-700">{d.libelle}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-yellow-700">{parseFloat(d.montant).toLocaleString("fr-FR")} FCFA</span>
                <button onClick={() => setPersonnalisees(p => p.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:text-red-600 transition"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total + Bouton */}
      <div className="bg-primary rounded-2xl p-6 flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm">Total des dépenses</p>
          <p className="text-white font-display text-3xl font-bold mt-1">
            {totalDepenses.toLocaleString("fr-FR")} <span className="text-lg font-normal">FCFA</span>
          </p>
        </div>
        <button onClick={enregistrer} disabled={loading || totalDepenses === 0}
          className="bg-white text-primary font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition disabled:opacity-50 text-sm">
          {loading ? "Enregistrement..." : "Enregistrer les dépenses"}
        </button>
      </div>

      {message && <p className="text-sm font-medium text-gray-700 text-center">{message}</p>}
    </div>
  );
}
