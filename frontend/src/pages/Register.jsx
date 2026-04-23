// pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword)
      return setError("Les mots de passe ne correspondent pas.");
    if (form.password.length < 6)
      return setError("Le mot de passe doit contenir au moins 6 caractères.");

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      navigate("/login");
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
          <p className="text-gray-400 text-sm">Créer un compte réceptionniste</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: "name", label: "Nom complet", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "password", label: "Mot de passe", type: "password" },
            { name: "confirmPassword", label: "Confirmer le mot de passe", type: "password" },
          ].map(({ name, label, type }) => (
            <div key={name}>
              <label className="text-sm text-gray-600 font-medium block mb-1">{label}</label>
              <input type={type} name={name} value={form[name]} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-red-900 transition disabled:opacity-60">
            {loading ? "Création..." : "Créer le compte"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-secondary font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
