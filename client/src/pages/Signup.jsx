// client/src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/api";
import Navbar from "../components/Navbar";
import { useTranslation } from "../i18n";

export default function Signup() {
  const nav = useNavigate();
  const { t, lang } = useTranslation();

  // default language uses current app language
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    language: lang || "en",
  });
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await API.post("/api/auth/register", form);
      setMsg(t("account_created", "Account created. Please login."));
      setTimeout(() => nav("/login"), 900);
    } catch (err) {
      console.warn("Signup error:", err);
      setMsg(t("signup_failed", "Signup failed. Email may already exist."));
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="mx-auto max-w-md p-6">
        <div className="card space-y-3">
          <h1 className="text-center text-2xl font-bold text-green-700">
            {t("create_account", "Create Account")}
          </h1>

          <form className="space-y-3" onSubmit={submit}>
            <input
              name="name"
              className="input"
              placeholder={t("placeholder_full_name", "Full Name")}
              value={form.name}
              onChange={onChange}
              required
            />

            <input
              name="email"
              className="input"
              placeholder={t("email", "Email")}
              value={form.email}
              onChange={onChange}
              required
            />

            <input
              name="password"
              type="password"
              className="input"
              placeholder={t("password", "Password")}
              value={form.password}
              onChange={onChange}
              required
            />

            <select
              name="language"
              className="input"
              value={form.language}
              onChange={onChange}
            >
              <option value="en">{t("lang_en", "English")}</option>
              <option value="kn">{t("lang_kn", "Kannada")}</option>
              <option value="hi">{t("lang_hi", "Hindi")}</option>
              <option value="te">{t("lang_te", "Telugu")}</option>
            </select>

            <button className="btn w-full">{t("signup", "Sign up")}</button>
          </form>

          {msg && <p className="text-center text-sm text-green-700">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
