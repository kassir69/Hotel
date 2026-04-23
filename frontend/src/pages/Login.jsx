// pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src="/Logo.png" alt="Hôtel Appolon" className="h-24 object-contain mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Connectez-vous à votre espace</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 font-medium block mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition" />
          </div>
          <div>
            <label className="text-sm text-gray-600 font-medium block mb-1">Mot de passe</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-red-900 transition disabled:opacity-60">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-secondary font-semibold hover:underline">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
