// client/src/pages/CropAdvisory.jsx
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Field from "../components/Field";
import Spinner from "../components/Spinner";
import WeatherWidget from "../components/WeatherWidget";
import { useToast } from "../components/ToastProvider";
import { getWeatherFromCoords, reverseGeocode } from "../lib/weather";
import { monthToSeason } from "../lib/season";
import { translateCrop, translateCrops } from "../lib/cropTranslations";
import { getCropRecommendation, getSeasonalCrops, getSeasonalList } from "../lib/api.actions";
import { useTranslation } from "../i18n";
import { INDIAN_STATES_DISTRICTS } from "../data/districts";

/* =========================
   CONFIG
========================= */
const FIELDS = [
  { key: "N", label: "Nitrogen (N)", placeholder: "e.g. 50", icon: "🧪" },
  { key: "P", label: "Phosphorus (P)", placeholder: "e.g. 40", icon: "🔬" },
  { key: "K", label: "Potassium (K)", placeholder: "e.g. 35", icon: "⚗️" },
  { key: "ph", label: "Soil pH", placeholder: "e.g. 6.8", icon: "🌡️" },
  { key: "temperature", label: "Temperature (°C)", placeholder: "e.g. 26", icon: "☀️" },
  { key: "rainfall", label: "Rainfall (mm)", placeholder: "e.g. 120", icon: "🌧️" },
];

const KA_DISTRICTS = [
  "Bengaluru", "Bengaluru Rural", "Mysuru", "Mandya",
  "Ballari", "Belagavi", "Dharwad", "Shivamogga",
  "Tumakuru", "Hassan", "Chikkamagaluru", "Kodagu",
];

export default function CropAdvisory() {
  const { t, lang } = useTranslation();
  const toast = useToast();

  const [mode, setMode] = useState("expert");
  const [form, setForm] = useState(Object.fromEntries(FIELDS.map(f => [f.key, ""])));
  const [errors, setErrors] = useState({});
  const [beginnerForm, setBeginnerForm] = useState({ state: "Karnataka", district: "", season: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [locationInfo, setLocationInfo] = useState({ district: "", state: "", temperature: "", rainfall: "" });
  const [seasonalMeta, setSeasonalMeta] = useState({ states: [], districtsByState: {}, seasons: [] });

  const modeTitle = useMemo(() =>
    mode === "expert"
      ? t("mode_expert", "Soil & Weather Inputs (Expert)")
      : t("mode_beginner", "District & Season (Beginner — No Soil Test)")
    , [mode, t]);

  useEffect(() => {
    let mounted = true;
    async function loadMeta() {
      try {
        const { data } = await getSeasonalList();
        if (!mounted) return;
        if (!data || !data.states || data.states.length === 0) {
          setSeasonalMeta({ states: ["Karnataka"], districtsByState: { Karnataka: KA_DISTRICTS }, seasons: ["Kharif", "Rabi", "Summer"] });
        } else {
          setSeasonalMeta({ states: data.states, districtsByState: data.districtsByState || {}, seasons: data.seasons || [] });
          setBeginnerForm(bf => ({ ...bf, state: bf.state && data.states.includes(bf.state) ? bf.state : data.states[0] || bf.state }));
        }
      } catch (err) {
        setSeasonalMeta({ states: ["Karnataka"], districtsByState: { Karnataka: KA_DISTRICTS }, seasons: ["Kharif", "Rabi", "Summer"] });
      }
    }
    loadMeta();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const alreadyRan = sessionStorage.getItem("auto_gps_done");
    if (!alreadyRan) {
      fetchWeatherAutoFill().catch(() => { }).finally(() => { sessionStorage.setItem("auto_gps_done", "1"); });
    }
  }, []);

  const onChangeExpert = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateExpert = () => {
    const e = {};
    for (const f of FIELDS) {
      const v = form[f.key];
      if (v === "") e[f.key] = t("required", "Required");
      else if (isNaN(Number(v))) e[f.key] = t("must_be_number", "Must be a number");
      else if (f.key === "ph" && (Number(v) < 3 || Number(v) > 10)) e[f.key] = t("ph_range", "pH should be 3–10");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const prefillExpert = () => {
    setForm({ N: "60", P: "45", K: "40", ph: "6.7", temperature: "27", rainfall: "110" });
    setErrors({});
    setResult(null);
  };

  const submitExpert = async () => {
    if (!validateExpert()) return;
    setLoading(true);
    try {
      const payload = {
        N: Number(form.N), P: Number(form.P), K: Number(form.K),
        ph: Number(form.ph), temperature: Number(form.temperature), rainfall: Number(form.rainfall),
      };
      const { data } = await getCropRecommendation(payload);
      setResult(data);
      toast.success(`Recommended: ${data.predicted_crop || "crop"}`);
      const currentHistory = JSON.parse(localStorage.getItem("advisory_history") || "[]");
      const updated = [{ time: Date.now(), result: data }, ...currentHistory].slice(0, 10);
      localStorage.setItem("advisory_history", JSON.stringify(updated));
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || t("something_wrong", "Something went wrong");
      setResult({ error: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetExpert = () => {
    setForm(Object.fromEntries(FIELDS.map(f => [f.key, ""])));
    setErrors({});
    setResult(null);
  };

  const onChangeBeginner = (e) => {
    const { name, value } = e.target;
    if (name === "state") {
      setBeginnerForm({ ...beginnerForm, state: value, district: "", season: beginnerForm.season });
    } else {
      setBeginnerForm({ ...beginnerForm, [name]: value });
    }
    setResult(null);
  };

  const validateBeginner = () => {
    if (!beginnerForm.district) return t("select_district", "Please select a district");
    if (!beginnerForm.season) return t("select_season", "Please select a season");
    return "";
  };

  const prefillBeginner = () => {
    const preferredState = seasonalMeta.states.includes("Karnataka") ? "Karnataka" : seasonalMeta.states[0] || "Karnataka";
    const districts = seasonalMeta.districtsByState?.[preferredState] || KA_DISTRICTS;
    const district = districts.includes("Mysuru") ? "Mysuru" : districts[0] || "";
    const season = seasonalMeta.seasons.includes("Kharif") ? "Kharif" : (seasonalMeta.seasons[0] || "");
    setBeginnerForm({ state: preferredState, district, season });
    setResult(null);
  };

  const submitBeginner = async () => {
    const v = validateBeginner();
    if (v) return setResult({ error: v });
    setLoading(true);
    try {
      // 1. Get Averages + Static Advice from CSV
      let seasonalData = {};
      try {
        const { data } = await getSeasonalCrops({
          state: beginnerForm.state, district: beginnerForm.district, season: beginnerForm.season,
        });
        seasonalData = data;
      } catch (e) {
        console.warn("CSV data missing for region, falling back to defaults for ML.");
        seasonalData = {
          avg_n: "50", avg_p: "40", avg_k: "35", avg_ph: "6.5",
          recommended_crops: null
        };
      }

      // 2. Prepare ML Payload using Averages (or defaults if missing)
      const mlPayload = {
        N: parseFloat(seasonalData.avg_n || "50"),
        P: parseFloat(seasonalData.avg_p || "40"),
        K: parseFloat(seasonalData.avg_k || "35"),
        ph: parseFloat(seasonalData.avg_ph || "6.5"),
        temperature: parseFloat(locationInfo.temperature || "26"), // Fallback to live or default
        rainfall: parseFloat(locationInfo.rainfall || "100"),
        state: beginnerForm.state,
        district: beginnerForm.district,
        season: beginnerForm.season,
      };

      // 3. Call The Real ML Model
      const { data: mlResult } = await getCropRecommendation(mlPayload);

      // 4. Merge Results (ML Prediction takes precedence)
      const finalResult = {
        ...mlResult,
        note: t("beginner_ml_success", "Prediction based on historical soil averages for this region."),
        static_suggestion: seasonalData.recommended_crops // Keep static list as "Traditional Advice"
      };

      setResult(finalResult);

      const currentHistory = JSON.parse(localStorage.getItem("advisory_history") || "[]");
      const updated = [{ time: Date.now(), result: finalResult }, ...currentHistory].slice(0, 10);
      localStorage.setItem("advisory_history", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || err.message || t("something_wrong", "Something went wrong");
      setResult({ error: msg });
    } finally {
      setLoading(false);
    }
  };

  const resetBeginner = () => {
    setBeginnerForm({ state: seasonalMeta.states[0] || "Karnataka", district: "", season: "" });
    setResult(null);
  };

  const currentDistricts = useMemo(() => {
    return INDIAN_STATES_DISTRICTS[beginnerForm.state] || [];
  }, [beginnerForm.state]);

  const switchToExpert = () => { setMode("expert"); setResult(null); };
  const switchToBeginner = () => { setMode("beginner"); setResult(null); };

  const fetchWeatherAutoFill = async () => {
    try {
      setLoading(true);
      if (!("geolocation" in navigator)) {
        setResult({ error: t("geolocation_not_supported", "Geolocation not supported.") });
        setLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const weather = await getWeatherFromCoords(lat, lon, import.meta.env.VITE_WEATHER_KEY);
          const address = await reverseGeocode(lat, lon);
          const district = address?.county || address?.state_district || address?.city || address?.town || address?.village || "";
          const state = address?.state || "Karnataka";
          setLocationInfo({ district, state, temperature: Number(weather.temperature).toFixed(1), rainfall: Number(weather.rainfall || 0).toFixed(1) });
          setForm((prev) => ({
            ...prev, temperature: Number(weather.temperature).toFixed(1), rainfall: Number(weather.rainfall || 0).toFixed(1),
            ph: prev.ph || "6.8", N: prev.N || "50", P: prev.P || "40", K: prev.K || "35",
          }));
          const detectedSeason = monthToSeason(new Date().getMonth(), state || "Karnataka");
          setBeginnerForm((prev) => ({ state: state || "Karnataka", district: district || prev.district || "", season: detectedSeason }));
          setResult({ note: t("auto_filled_using_location", "Auto-filled using live weather") });
          setLoading(false);
        },
        (err) => {
          setResult({ error: t("location_permission", "Unable to get location permission.") });
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } catch (err) {
      setResult({ error: t("autofill_failed", "Autofill failed.") });
      setLoading(false);
    }
  };

  const useDistrictAverages = async () => {
    try {
      setLoading(true);
      let district = locationInfo.district;
      let state = locationInfo.state;
      if (!district) {
        await fetchWeatherAutoFill();
        setResult({ note: t("detecting_location_history", "Detecting location...") });
        setLoading(false);
        return;
      }
      const season = monthToSeason(new Date().getMonth(), state || "Karnataka");
      const { data } = await getSeasonalCrops({ state: state || "Karnataka", district, season });
      if (data && data.avg_n) {
        setForm((prev) => ({ ...prev, N: data.avg_n || prev.N, P: data.avg_p || prev.P, K: data.avg_k || prev.K, ph: data.avg_ph || prev.ph }));
        setResult({ note: t("filled_from_averages", "Filled using averages") });
        toast.success(`District averages applied for ${district}`);
      } else {
        toast.error("No historical soil data found.");
      }
    } catch (err) {
      toast.error("Failed to fetch averages.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-100 relative overflow-hidden font-sans text-emerald-950">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[100px] -z-10" />

      <Navbar dark={false} />

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-emerald-950">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2 drop-shadow-sm">
              🌾 {t("crop_advisory", "Crop Advisory")}
            </h1>
            <p className="text-emerald-800 mt-2 font-medium text-lg">
              {t("crop_advisory_sub", "Get AI-powered crop & fertilizer recommendations")}
            </p>
          </div>

          {locationInfo.district && (
            <div className="bg-white/60 backdrop-blur-md rounded-full px-5 py-2 text-sm font-bold border border-emerald-100 shadow-lg flex items-center gap-2 text-emerald-800">
              📍 {locationInfo.district}, {locationInfo.temperature}°C
            </div>
          )}
        </div>

        {/* Input Card */}
        <section className="rounded-3xl bg-white shadow-xl p-6 md:p-8 border border-emerald-100 relative overflow-hidden">
          {/* Decorative blob for form */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 opacity-60" />

          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <h2 className="text-xl font-bold text-gray-800">{modeTitle}</h2>

            <div className="flex flex-wrap gap-2 text-sm">
              {mode === "expert" ? (
                <>
                  <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors" onClick={prefillExpert}>
                    {t("btn_sample", "Sample")}
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors" onClick={useDistrictAverages} disabled={loading}>
                    📍 {t("btn_use_averages", "Use Averages")}
                  </button>
                  <button className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50 font-medium" onClick={resetExpert}>{t("btn_reset", "Reset")}</button>
                </>
              ) : (
                <>
                  <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors" onClick={prefillBeginner}>{t("btn_sample", "Sample")}</button>
                  <button className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50 font-medium" onClick={resetBeginner}>{t("btn_reset", "Reset")}</button>
                </>
              )}
            </div>
          </div>

          {/* Forms */}
          {mode === "expert" ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {FIELDS.map(f => (
                  <Field
                    key={f.key}
                    label={t(f.key.toLowerCase(), f.label)}
                    name={f.key}
                    value={form[f.key]}
                    onChange={onChangeExpert}
                    error={errors[f.key]}
                    placeholder={t(`${f.key.toLowerCase()}_placeholder`, f.placeholder)}
                    icon={f.icon}
                  />
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-lg shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100" onClick={submitExpert} disabled={loading}>
                  {loading ? <Spinner text={t("predicting", "Analyzing...")} /> : `🚀 ${t("get_recommendation", "Get Recommendation")}`}
                </button>
                <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline" onClick={switchToBeginner}>
                  🔄 {t("switch_to_beginner", "No Soil Test? Switch to Beginner")}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t("label_state", "State")}</label>
                  <div className="relative">
                    <select name="state" className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none appearance-none" value={beginnerForm.state} onChange={onChangeBeginner}>
                      {Object.keys(INDIAN_STATES_DISTRICTS).sort().map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">▼</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t("label_district", "District")}</label>
                  <div className="relative">
                    <select name="district" className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none appearance-none" value={beginnerForm.district} onChange={onChangeBeginner}>
                      <option value="">{t("select_district_option", "Select District")}</option>
                      {currentDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">▼</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t("label_season", "Season")}</label>
                  <div className="relative">
                    <select name="season" className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none appearance-none" value={beginnerForm.season} onChange={onChangeBeginner}>
                      <option value="">{t("select_season_option", "Select Season")}</option>
                      {["Kharif", "Rabi", "Summer", "Whole Year"].map(s => (
                        <option key={s} value={s}>{t(`season_${s.toLowerCase().replace(" ", "_")}`, s)}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">▼</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-lg shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100" onClick={submitBeginner} disabled={loading}>
                  {loading ? <Spinner text={t("fetching", "Fetching...")} /> : `📋 ${t("get_suggested_crops", "Get Suggestions")}`}
                </button>
                <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline" onClick={switchToExpert}>
                  {t("switch_to_expert", "Have Soil Data? Switch to Expert")}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Results Section */}
        {
          result && !result.error && (result.recommended_crop || result.predicted_crop || result.recommended_crops) && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">📊</span> {t("results_title", "Results")}
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {/* Card 1: Recommended Crop - HERO */}
                <div className="md:col-span-3 rounded-3xl p-10 text-center shadow-lg relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400 opacity-20 rounded-full blur-3xl -ml-16 -mb-16"></div>

                  <p className="relative z-10 text-sm font-bold uppercase tracking-[0.2em] text-emerald-100">{t("results_recommended_crop", "Recommended Crop")}</p>
                  <p className="relative z-10 text-6xl md:text-8xl font-black mt-4 mb-6 drop-shadow-md">
                    {translateCrop(result.recommended_crop || result.predicted_crop, lang) || "—"}
                  </p>

                  {result.confidence && (
                    <div className="relative z-10 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-2 border border-white/20">
                      <span className="text-2xl font-bold">{result.confidence}%</span>
                      <span className="text-xs font-bold uppercase opacity-80">{t("results_confidence", "Confidence")}</span>
                    </div>
                  )}
                </div>

                {/* Card 2: Top-3 Options */}
                {result.top_3 && result.top_3.length > 0 && (
                  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">🔄</div>
                      <p className="font-bold text-gray-800">{t("results_alternatives", "Alternatives")}</p>
                    </div>
                    <div className="space-y-4">
                      {result.top_3.map((item, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-700">{idx + 1}. {translateCrop(item.crop, lang)}</span>
                            <span className="font-bold text-blue-600 text-sm">{item.confidence}%</span>
                          </div>
                          <div className="w-full rounded-full h-2 bg-gray-100 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${item.confidence}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card 3: Fertilizer Status */}
                {result.fertilizer && result.fertilizer.nutrients && (
                  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-md md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">🧪</div>
                      <p className="font-bold text-gray-800">{t("results_soil_analysis", "Soil Analysis")}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {["N", "P", "K"].map(key => {
                        const n = result.fertilizer.nutrients[key];
                        if (!n) return null;
                        const statusColor = n.status === "optimal" ? "bg-green-100 text-green-700" : n.status === "low" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";
                        return (
                          <div key={key} className="rounded-xl border border-gray-100 p-4 bg-gray-50/50">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-2xl font-bold text-gray-400">{key}</span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColor}`}>{n.status}</span>
                            </div>
                            <div className="text-sm font-semibold text-gray-700">{n.value} kg/ha</div>
                            <div className="text-xs text-gray-400 mt-1">Ideal: {n.ideal_range[0]}-{n.ideal_range[1]}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {result.fertilizer?.recommendations && (
                <div className="mt-6 rounded-3xl bg-amber-50 border border-amber-100 p-8">
                  <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <span>📋</span> {t("results_action_plan", "Recommended Action Plan")}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {result.fertilizer.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 bg-white/60 p-4 rounded-xl border border-amber-100/50">
                        <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        <p className="text-sm text-gray-800 leading-relaxed font-medium">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        }

        {/* Beginner Results */}
        {
          result && !result.error && result.recommended_crops && (
            <div className="animate-fade-in-up rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {t("results_suggested_for", "Suggested Crops for")} <span className="text-emerald-600">{beginnerForm.district}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {result.recommended_crops.map(c => (
                  <div key={c} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-default">
                    <span className="text-3xl mb-2">🌱</span>
                    <span className="font-bold text-center">{translateCrop(c, lang)}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        {/* Error State */}
        {
          result?.error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex items-center gap-4 text-red-700">
              <div className="text-2xl">⚠️</div>
              <p className="font-medium">{result.error}</p>
            </div>
          )
        }

        {/* Empty State */}
        {
          !result && (
            <div className="rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-3xl text-gray-300 mb-4">
                🌱
              </div>
              <p className="text-gray-500 font-medium">
                {mode === "expert" ? t("empty_expert", "Enter values above to get insights") : t("empty_beginner", "Select location to get suggestions")}
              </p>
            </div>
          )
        }

      </main >
    </div >
  );
}
