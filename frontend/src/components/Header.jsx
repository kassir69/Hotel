// components/Header.jsx
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-gray-400 text-xs capitalize">{dateStr}</p>
        <h2 className="text-gray-800 font-semibold text-sm mt-0.5">
          Bonjour, <span className="text-primary">{user?.name}</span> 👋
        </h2>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition px-3 py-2 rounded-lg hover:bg-red-50"
      >
        <LogOut size={16} />
        Déconnexion
      </button>
    </header>
  );
}
