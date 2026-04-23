// pages/admin/RapportFinancier.jsx
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const COLS_FULL  = ["Studio Climatisé","Studio Ventilé","Grande Chambre Climatisée","Grande Chambre Ventilée","Petite Chambre Climatisée","Petite Chambre Ventilée"];
const COLS_SHORT = ["S.Clim","S.Vent","G.Clim","G.Vent","P.Clim","P.Vent"];

const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export default function RapportFinancier() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [data,  setData]  = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchData = async (m, y) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/rapport-mensuel?month=${m}&year=${y}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(month, year); }, [month, year]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y+1); } else setMonth(m => m+1); };

  const daysInMonth = new Date(year, month, 0).getDate();

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF({ orientation: "landscape", format: "a4" });
    const pageW = 297;

    const entete = (titre, sous) => {
      doc.setFillColor(112, 33, 13);
      doc.rect(0, 0, pageW, 22, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13); doc.setFont("helvetica", "bold");
      doc.text(`${MOIS[month-1].toUpperCase()} ${year} — ${titre}`, pageW / 2, 10, { align: "center" });
      doc.setFontSize(9); doc.setFont("helvetica", "normal");
      doc.text(sous, pageW / 2, 18, { align: "center" });
    };

    // ════════════════════════════════════════
    // PAGE 1 — RECETTES JOURNALIERES
    // ════════════════════════════════════════
    entete("RECETTES", "Detail journalier des chambres occupees");

    const recRows = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const j = data.jours[d];
      recRows.push([
        d,
        ...COLS_FULL.map(c => (j && j[c] > 0 ? j[c] : "")),
        j && j.total > 0 ? j.total : "",
        j && j.montant > 0 ? fmt(j.montant) : "",
      ]);
    }
    recRows.push([
      "TOTAL",
      ...COLS_FULL.map(c => data.totauxChambres[c] || 0),
      data.totalClients,
      fmt(data.totalRecettes),
    ]);

    autoTable(doc, {
      startY: 25,
      margin: { left: 10, right: 10 },
      head: [["DATE", ...COLS_SHORT, "TOTAL", "MONTANT (FCFA)"]],
      body: recRows,
      theme: "striped",
      headStyles: { fillColor: [130,115,27], textColor: 255, fontSize: 8, fontStyle: "bold", halign: "center" },
      styles: { fontSize: 8, halign: "center", cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 16 },
        1: { cellWidth: 30 }, 2: { cellWidth: 30 }, 3: { cellWidth: 36 },
        4: { cellWidth: 36 }, 5: { cellWidth: 36 }, 6: { cellWidth: 30 },
        7: { cellWidth: 18 },
        8: { cellWidth: 35, halign: "right" },
      },
      didParseCell: (hook) => {
        if (hook.row.index === recRows.length - 1) {
          hook.cell.styles.fontStyle = "bold";
          hook.cell.styles.fillColor = [240,235,210];
        }
      },
    });

    const y1 = doc.lastAutoTable.finalY + 6;
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(40);
    doc.text(`Total clients : ${data.totalClients}`, 10, y1);
    doc.text(`Total recettes : ${fmt(data.totalRecettes)} FCFA`, 120, y1);
    doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(130);
    doc.text(`Finance Hotel — Rapport ${MOIS[month-1]} ${year} — Page 1/2`, pageW/2, y1+6, { align:"center" });

    // ════════════════════════════════════════
    // PAGE 2 — DEPENSES
    // ════════════════════════════════════════
    doc.addPage();
    entete("DEPENSES", "Detail des charges fixes et autres depenses du mois");

    const totalFixes  = Object.values(data.chargesFixes).reduce((s,v) => s+v, 0);
    const totalAutres = Object.values(data.autresDepenses).reduce((s,v) => s+v, 0);

    const depRows = [];

    depRows.push(["CHARGES FIXES", fmt(totalFixes)]);
    Object.entries(data.chargesFixes).forEach(([lib, mt]) => {
      depRows.push([`  ${lib}`, mt > 0 ? fmt(mt) : "—"]);
    });
    depRows.push(["", ""]);

    depRows.push(["AUTRES DEPENSES", totalAutres > 0 ? fmt(totalAutres) : "0"]);
    if (Object.keys(data.autresDepenses).length > 0) {
      Object.entries(data.autresDepenses).forEach(([lib, mt]) => {
        depRows.push([`  ${lib}`, mt > 0 ? fmt(mt) : "—"]);
      });
    } else {
      depRows.push(["  Aucune depense enregistree", ""]);
    }
    depRows.push(["", ""]);

    depRows.push(["TOTAL CHARGES FIXES",   fmt(totalFixes)]);
    depRows.push(["TOTAL AUTRES DEPENSES",  fmt(totalAutres)]);
    depRows.push(["TOTAL DEPENSES",         fmt(data.totalDepenses)]);
    depRows.push(["RECETTES DU MOIS",       fmt(data.totalRecettes)]);
    depRows.push(["RESULTAT NET",           fmt(data.resultatNet)]);

    autoTable(doc, {
      startY: 25,
      margin: { left: 50, right: 50 },
      head: [["DESCRIPTION DES DEPENSES", "MONTANT (FCFA)"]],
      body: depRows,
      theme: "grid",
      headStyles: { fillColor: [112,33,13], textColor: 255, fontSize: 10, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3.5 },
      columnStyles: {
        0: { cellWidth: 140 },
        1: { cellWidth: 57, halign: "right" },
      },
      didParseCell: (hook) => {
        const txt = String(hook.cell.raw || "").trim();
        if (["CHARGES FIXES","AUTRES DEPENSES"].includes(txt)) {
          hook.cell.styles.fontStyle = "bold";
          hook.cell.styles.fillColor = [245,240,225];
          hook.cell.styles.fontSize  = 10;
        } else if (txt === "TOTAL DEPENSES") {
          hook.cell.styles.fontStyle = "bold";
          hook.cell.styles.fillColor = [255,220,215];
        } else if (txt === "RECETTES DU MOIS") {
          hook.cell.styles.fontStyle = "bold";
          hook.cell.styles.fillColor = [215,240,215];
        } else if (txt === "RESULTAT NET") {
          hook.cell.styles.fontStyle = "bold";
          hook.cell.styles.fontSize  = 11;
          hook.cell.styles.fillColor = data.resultatNet >= 0 ? [190,230,190] : [255,200,200];
        } else if (["TOTAL CHARGES FIXES","TOTAL AUTRES DEPENSES"].includes(txt)) {
          hook.cell.styles.fontStyle = "bold";
          hook.cell.styles.fillColor = [240,235,210];
        }
      },
    });

    const y2 = doc.lastAutoTable.finalY + 6;
    doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(130);
    doc.text(`Finance Hotel — Rapport ${MOIS[month-1]} ${year} — Page 2/2`, pageW/2, y2+4, { align:"center" });

    doc.save(`rapport_${MOIS[month-1]}_${year}.pdf`);
  };

  const exportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    // Feuille 1 — Recettes
    const rec = [
      [`RAPPORT FINANCIER — ${MOIS[month-1].toUpperCase()} ${year}`],
      ["RECETTES JOURNALIERES"],
      [],
      ["DATE", ...COLS_SHORT, "TOTAL", "MONTANT (FCFA)"],
    ];
    for (let d = 1; d <= daysInMonth; d++) {
      const j = data.jours[d];
      rec.push([d, ...COLS_FULL.map(c => (j && j[c] > 0 ? j[c] : "")),
        j && j.total > 0 ? j.total : "", j && j.montant > 0 ? j.montant : ""]);
    }
    rec.push(["TOTAL", ...COLS_FULL.map(c => data.totauxChambres[c]||0), data.totalClients, data.totalRecettes]);
    const ws1 = XLSX.utils.aoa_to_sheet(rec);
    ws1["!cols"] = [{ wch:8 }, ...COLS_SHORT.map(() => ({ wch:12 })), { wch:10 }, { wch:18 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Recettes");

    // Feuille 2 — Dépenses
    const dep = [
      [`DEPENSES — ${MOIS[month-1].toUpperCase()} ${year}`],
      [],
      ["DESCRIPTION", "MONTANT (FCFA)"],
      ["CHARGES FIXES", Object.values(data.chargesFixes).reduce((s,v)=>s+v,0)],
      ...Object.entries(data.chargesFixes).map(([l,m]) => [l, m]),
      [],
      ["AUTRES DEPENSES", Object.values(data.autresDepenses).reduce((s,v)=>s+v,0)],
      ...Object.entries(data.autresDepenses).map(([l,m]) => [l, m]),
      [],
      ["TOTAL DEPENSES",  data.totalDepenses],
      ["RECETTES DU MOIS",data.totalRecettes],
      ["RESULTAT NET",    data.resultatNet],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(dep);
    ws2["!cols"] = [{ wch:35 }, { wch:18 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Depenses");

    XLSX.writeFile(wb, `rapport_${MOIS[month-1]}_${year}.xlsx`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-gray-800 font-bold">Rapport financier mensuel</h1>
          <p className="text-gray-400 text-sm mt-1">Page 1 : Recettes par jour — Page 2 : Dépenses</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportPDF} disabled={!data || loading}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-900 transition disabled:opacity-50">
            <FileText size={16} /> PDF (2 pages)
          </button>
          <button onClick={exportExcel} disabled={!data || loading}
            className="flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-yellow-800 transition disabled:opacity-50">
            <FileSpreadsheet size={16} /> Excel (2 feuilles)
          </button>
        </div>
      </div>

      {/* Sélecteur mois */}
      <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm w-fit">
        <button onClick={prevMonth} className="text-gray-400 hover:text-primary transition p-1 rounded-lg hover:bg-red-50">
          <ChevronLeft size={20}/>
        </button>
        <span className="font-semibold text-gray-800 text-sm min-w-[150px] text-center">{MOIS[month-1]} {year}</span>
        <button onClick={nextMonth} className="text-gray-400 hover:text-primary transition p-1 rounded-lg hover:bg-red-50">
          <ChevronRight size={20}/>
        </button>
      </div>

      {/* Résumé */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label:"Total clients",    val: data.totalClients, unit:"",    color:"bg-blue-50 border-blue-100 text-blue-800" },
            { label:"Recettes du mois", val: fmt(data.totalRecettes), unit:" F", color:"bg-green-50 border-green-100 text-green-800" },
            { label:"Dépenses du mois", val: fmt(data.totalDepenses), unit:" F", color:"bg-red-50 border-red-100 text-red-800" },
            { label:"Résultat net",     val: fmt(data.resultatNet),   unit:" F",
              color: data.resultatNet >= 0 ? "bg-green-50 border-green-100 text-green-800" : "bg-red-50 border-red-100 text-red-800" },
          ].map(({ label, val, unit, color }) => (
            <div key={label} className={`border rounded-2xl p-4 ${color}`}>
              <p className="text-xs font-medium opacity-70">{label}</p>
              <p className="font-display text-xl font-bold mt-1">{val}{unit}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tableau journalier */}
      {loading ? <p className="text-gray-400 text-sm">Chargement...</p> : data ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-5 py-3 border-b border-gray-50 bg-secondary/5">
            <h2 className="font-semibold text-secondary text-sm">Recettes journalières — {MOIS[month-1]} {year}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-secondary text-white">
                <tr>
                  <th className="py-3 px-3 text-center text-xs font-bold uppercase w-12">Jour</th>
                  {COLS_SHORT.map(c => <th key={c} className="py-3 px-2 text-center text-xs font-bold uppercase">{c}</th>)}
                  <th className="py-3 px-3 text-center text-xs font-bold uppercase">Total</th>
                  <th className="py-3 px-4 text-right text-xs font-bold uppercase">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Array.from({length:daysInMonth},(_,i)=>i+1).map(jour => {
                  const j = data.jours[jour];
                  const has = j && j.total > 0;
                  return (
                    <tr key={jour} className={has ? "hover:bg-amber-50/40 transition" : "opacity-25"}>
                      <td className="py-2 px-3 text-center font-bold text-gray-600 text-xs">{jour}</td>
                      {COLS_FULL.map(c => (
                        <td key={c} className="py-2 px-2 text-center">
                          {j && j[c] > 0
                            ? <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-white text-xs font-bold rounded-full">{j[c]}</span>
                            : <span className="text-gray-100 text-xs">—</span>}
                        </td>
                      ))}
                      <td className="py-2 px-3 text-center text-xs font-bold text-gray-600">{has ? j.total : ""}</td>
                      <td className="py-2 px-4 text-right text-xs font-semibold text-green-700">
                        {has ? `${fmt(j.montant)} F` : ""}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-secondary/10 font-bold border-t-2 border-secondary/30">
                  <td className="py-3 px-3 text-center text-secondary text-xs font-bold">TOTAL</td>
                  {COLS_FULL.map(c => <td key={c} className="py-3 px-2 text-center text-secondary text-xs font-bold">{data.totauxChambres[c]||0}</td>)}
                  <td className="py-3 px-3 text-center text-secondary text-xs font-bold">{data.totalClients}</td>
                  <td className="py-3 px-4 text-right text-secondary text-xs font-bold">{fmt(data.totalRecettes)} F</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
