// client/src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../lib/api";
import { setToken, getToken } from "../lib/auth"; // Ensure getToken is imported
import Navbar from "../components/Navbar";
import { useTranslation } from "../i18n";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const redirectMsg = location.state?.message;

  // Auto-redirect if already logged in
  useEffect(() => {
    if (getToken()) {
      nav("/dashboard", { replace: true });
    }
  }, []);

  // Login mode: "phone" or "email"
  const [mode, setMode] = useState("phone");

  // Phone OTP flow
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Email/Password flow
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Send OTP to phone
  const sendOTP = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setMsg(t("enter_phone", "Please enter phone number"));
      return;
    }

    setMsg("");
    setLoading(true);
    try {
      await API.post("/api/auth/send-otp", { phone });
      setOtpSent(true);
      setMsg(t("otp_sent", "OTP sent to your phone"));
    } catch (err) {
      setMsg(err.response?.data?.message || t("error_sending_otp", "Error sending OTP"));
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setMsg(t("enter_otp", "Please enter OTP"));
      return;
    }

    setMsg("");
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/verify-otp", { phone, otp });
      setToken(data.token);
      const dest = location.state?.from || "/dashboard";
      nav(dest, { replace: true });
    } catch (err) {
      setMsg(err.response?.data?.message || t("invalid_otp", "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  // Email/Password login
  const submitEmail = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/login", { email, password });
      setToken(data.token);
      const dest = location.state?.from || "/dashboard";
      nav(dest, { replace: true });
    } catch (err) {
      setMsg(t("invalid_credentials", "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans">
      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1625246333195-58197bd47d26?q=80&w=2600&auto=format&fit=crop"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-emerald-900/90" />

      <div className="absolute top-0 w-full z-20">
        <Navbar dark={true} />
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">AgroAware</h1>
            <p className="text-emerald-100/80 text-sm font-medium">{t("farm_advice", "Farm Advisory at Your Fingertips")}</p>
          </div>

          {redirectMsg && (
            <div className="mb-6 bg-amber-500/20 border border-amber-500/50 text-amber-100 px-4 py-3 rounded-xl text-sm text-center font-medium">
              {redirectMsg}
            </div>
          )}

          {/* Login Mode Tabs */}
          <div className="flex gap-2 p-1 bg-black/20 rounded-xl mb-6">
            <button
              onClick={() => {
                setMode("phone");
                setMsg("");
                setOtpSent(false);
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === "phone"
                ? "bg-emerald-500 text-white shadow-md"
                : "text-emerald-200 hover:text-white hover:bg-white/5"
                }`}
            >
              📱 {t("phone", "Phone")}
            </button>
            <button
              onClick={() => {
                setMode("email");
                setMsg("");
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === "email"
                ? "bg-emerald-500 text-white shadow-md"
                : "text-emerald-200 hover:text-white hover:bg-white/5"
                }`}
            >
              📧 {t("email", "Email")}
            </button>
          </div>

          {/* PHONE OTP LOGIN */}
          {mode === "phone" && (
            <form className="space-y-4" onSubmit={otpSent ? verifyOTP : sendOTP}>
              {!otpSent ? (
                <>
                  <div className="space-y-1">
                    <input
                      className="w-full px-4 py-3 rounded-xl bg-black/20 border border-emerald-500/30 text-white placeholder-emerald-200/50 outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder={t("phone_number", "10-digit phone number")}
                      maxLength="10"
                      required
                    />
                  </div>
                  <button className="w-full py-3.5 rounded-xl bg-white text-emerald-900 font-bold hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70" type="submit" disabled={loading}>
                    {loading ? t("sending", "Sending...") : t("send_otp", "Send OTP")}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-emerald-100 mb-4 text-sm">
                      {t("otp_sent_to", "OTP sent to")} <strong className="text-white">+91 {phone}</strong>
                    </p>
                    <input
                      className="w-full px-4 py-3 text-center text-3xl font-mono tracking-[0.5em] rounded-xl bg-black/20 border border-emerald-500/30 text-white placeholder-emerald-200/30 outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="••••••"
                      maxLength="6"
                      required
                    />
                  </div>
                  <button className="w-full py-3.5 rounded-xl bg-white text-emerald-900 font-bold hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 mt-4" type="submit" disabled={loading}>
                    {loading ? t("verifying", "Verifying...") : t("verify_otp", "Verify OTP")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setPhone("");
                    }}
                    className="mt-4 text-xs font-semibold uppercase tracking-wider text-emerald-300 hover:text-white transition-colors block w-full text-center"
                  >
                    {t("change_phone", "Change phone number")}
                  </button>
                </>
              )}
            </form>
          )}

          {/* EMAIL PASSWORD LOGIN */}
          {mode === "email" && (
            <form className="space-y-4" onSubmit={submitEmail}>
              <input
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-emerald-500/30 text-white placeholder-emerald-200/50 outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email", "Email")}
                required
              />
              <input
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-emerald-500/30 text-white placeholder-emerald-200/50 outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("password", "Password")}
                required
              />
              <button className="w-full py-3.5 rounded-xl bg-white text-emerald-900 font-bold hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70" type="submit" disabled={loading}>
                {loading ? t("logging_in", "Logging in...") : t("login", "Login")}
              </button>
            </form>
          )}

          {/* Error/Success Message */}
          {msg && (
            <div className={`mt-6 text-center text-sm p-3 rounded-xl font-medium ${msg.includes("sent") || msg.includes("Sent")
              ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/30"
              : "bg-red-500/20 text-red-100 border border-red-500/30"
              }`}>
              {msg}
            </div>
          )}

          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-emerald-200/70 text-sm">
              {t("no_account", "Don't have an account?")}{" "}
              <a href="/signup" className="text-white hover:text-emerald-300 font-bold underline decoration-2 underline-offset-4 hover:decoration-emerald-400 transition-all">
                {t("sign_up", "Sign up")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
