// client/src/pages/Signup.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/api";
import { getToken } from "../lib/auth";
import Navbar from "../components/Navbar";
import { useTranslation } from "../i18n";

export default function Signup() {
  const nav = useNavigate();
  const { t, lang } = useTranslation();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (getToken()) {
      nav("/dashboard", { replace: true });
    }
  }, []);

  // default language uses current app language
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    language: lang || "en",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await API.post("/api/auth/register", form);
      setMsg(t("account_created", "Account created. Please login."));
      setTimeout(() => nav("/login"), 1500);
    } catch (err) {
      console.warn("Signup error:", err);
      setMsg(t("signup_failed", "Signup failed. Email may already exist."));
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans">
      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?q=80&w=2600&auto=format&fit=crop"
        alt="Farming Background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90" /> {/* Different gradient for Signup */}

      <div className="absolute top-0 w-full z-20">
        <Navbar dark={true} />
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t("create_account", "Create Account")}</h1>
            <p className="text-purple-100/80 text-sm font-medium">Join the AgroAware community today</p>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-4">
              <input
                name="name"
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-purple-500/30 text-white placeholder-purple-200/50 outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                placeholder={t("placeholder_full_name", "Full Name")}
                value={form.name}
                onChange={onChange}
                required
              />

              <input
                name="email"
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-purple-500/30 text-white placeholder-purple-200/50 outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                placeholder={t("email", "Email")}
                value={form.email}
                onChange={onChange}
                required
              />

              <input
                name="password"
                type="password"
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-purple-500/30 text-white placeholder-purple-200/50 outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                placeholder={t("password", "Password")}
                value={form.password}
                onChange={onChange}
                required
              />

              <div className="relative">
                <select
                  name="language"
                  className="w-full px-4 py-3 rounded-xl bg-black/20 border border-purple-500/30 text-white outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                  value={form.language}
                  onChange={onChange}
                >
                  <option value="en" className="text-gray-900">{t("lang_en", "English")}</option>
                  <option value="kn" className="text-gray-900">{t("lang_kn", "Kannada")}</option>
                  <option value="hi" className="text-gray-900">{t("lang_hi", "Hindi")}</option>
                  <option value="te" className="text-gray-900">{t("lang_te", "Telugu")}</option>
                  <option value="ta" className="text-gray-900">{t("lang_ta", "Tamil")}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-purple-200">
                  ▼
                </div>
              </div>
            </div>

            <button className="w-full py-3.5 rounded-xl bg-white text-purple-900 font-bold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 mt-4" disabled={loading}>
              {loading ? 'Creating Account...' : t("signup", "Sign up")}
            </button>
          </form>

          {msg && (
            <div className={`mt-6 text-center text-sm p-3 rounded-xl font-medium ${msg.includes("created")
              ? "bg-green-500/20 text-green-100 border border-green-500/30"
              : "bg-red-500/20 text-red-100 border border-red-500/30"
              }`}>
              {msg}
            </div>
          )}

          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-purple-200/70 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-white hover:text-purple-300 font-bold underline decoration-2 underline-offset-4 hover:decoration-purple-400 transition-all">
                {t("login", "Login")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
