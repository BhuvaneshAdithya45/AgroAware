// client/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../lib/api";
import { setToken } from "../lib/auth";
import Navbar from "../components/Navbar";
import { useTranslation } from "../i18n";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // message passed from ProtectedRoute (optional)
  const redirectMsg = location.state?.message;

  // form state (controlled inputs)
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/login", form);
      setToken(data.token);

      // if a route asked to come here, go back there; otherwise go to dashboard
      const dest = location.state?.from || "/dashboard";
      nav(dest, { replace: true });
    } catch (err) {
      console.warn("Login error:", err);
      setMsg(t("invalid_credentials", "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="mx-auto max-w-md p-6">
        <div className="card space-y-3">
          <h1 className="text-center text-2xl font-bold text-green-700">{t("login", "Login")}</h1>

          {/* show message passed from ProtectedRoute (translated) */}
          {redirectMsg && (
            <div className="text-center text-sm text-amber-700">
              {redirectMsg}
            </div>
          )}

          <form className="space-y-3" onSubmit={submit}>
            <input
              className="input"
              name="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              placeholder={t("email", "Email")}
              required
            />

            <input
              className="input"
              name="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              placeholder={t("password", "Password")}
              required
            />

            <button className="btn w-full" type="submit" disabled={loading}>
              {loading ? t("logging_in", "Logging in...") : t("login", "Login")}
            </button>
          </form>

          {/* feedback message */}
          {msg && <p className="text-center text-sm text-red-600">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
