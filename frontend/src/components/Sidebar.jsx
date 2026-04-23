// components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, DollarSign, ArrowDownCircle, FileText, Users, UserCheck } from "lucide-react";

export default function Sidebar({ user }) {
  const location = useLocation();

  const employeLinks = [
    { to: "/",         icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { to: "/recettes", icon: <DollarSign size={18} />,      label: "Réservations" },
    { to: "/depenses", icon: <ArrowDownCircle size={18} />, label: "Dépenses" },
  ];

  const adminLinks = [
    { to: "/",            icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { to: "/clients",     icon: <UserCheck size={18} />,       label: "Clients" },
    { to: "/rapport",     icon: <FileText size={18} />,        label: "Rapport financier" },
    { to: "/utilisateurs",icon: <Users size={18} />,           label: "Utilisateurs" },
  ];

  const links = user?.role === "admin" ? adminLinks : employeLinks;

  return (
    <div className="w-60 bg-primary text-white flex flex-col h-full shadow-xl">
      <div className="px-4 py-6 border-b border-white/10 flex justify-center">
        <img src="/Logo.png" alt="Hôtel Appolon" className="h-20 object-contain" />
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map(({ to, icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                active ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}>
              {icon}{label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Connecté</p>
        <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
      </div>
    </div>
  );
}
