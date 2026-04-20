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
  { key: "N", labelKey: "nitrogen", label: "Nitrogen (N)", placeholder: "e.g. 50", icon: "🧪" },
  { key: "P", labelKey: "phosphorus", label: "Phosphorus (P)", placeholder: "e.g. 40", icon: "🔬" },
  { key: "K", labelKey: "potassium", label: "Potassium (K)", placeholder: "e.g. 35", icon: "⚗️" },
  { key: "ph", labelKey: "soil_ph", label: "Soil pH", placeholder: "e.g. 6.8", icon: "🌡️" },
  { key: "temperature", labelKey: "temperature", label: "Temperature (°C)", placeholder: "e.g. 26", icon: "☀️" },
  { key: "rainfall", labelKey: "rainfall", label: "Rainfall (mm)", placeholder: "e.g. 120", icon: "🌧️" },
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
  const [form, setForm] = useState({ ...Object.fromEntries(FIELDS.map(f => [f.key, ""])), season: "Kharif" });
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
    setForm({ N: "60", P: "45", K: "40", ph: "6.7", temperature: "27", rainfall: "110", season: "Kharif" });
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
        season: form.season || "Kharif"
      };
      const { data } = await getCropRecommendation(payload);
      setResult(data);
      toast.success(`${t("recommended_toast", "Recommended: ")} ${translateCrop(data.predicted_crop, lang)}`);
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
    setForm({ ...Object.fromEntries(FIELDS.map(f => [f.key, ""])), season: "Kharif" });
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
        temperature: parseFloat(seasonalData.avg_temp || locationInfo.temperature || "26"),
        rainfall: parseFloat(seasonalData.avg_rainfall || locationInfo.rainfall || "100"),
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
    // Beginner mode priority: Use districts from CSV if available, else static list
    if (mode === "beginner" && seasonalMeta.districtsByState[beginnerForm.state]) {
      return seasonalMeta.districtsByState[beginnerForm.state];
    }
    return INDIAN_STATES_DISTRICTS[beginnerForm.state] || [];
  }, [beginnerForm.state, mode, seasonalMeta.districtsByState]);

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
        toast.success(t("averages_applied", "District averages applied"));
      } else {
        toast.error(t("no_soil_data", "No historical soil data found."));
      }
    } catch (err) {
      toast.error(t("fetch_averages_failed", "Failed to fetch averages."));
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {FIELDS.map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1">{t(f.labelKey || f.key.toLowerCase(), f.label)}</label>
                    <input
                      type="text"
                      name={f.key}
                      value={form[f.key]}
                      onChange={onChangeExpert}
                      placeholder={f.key === "ph" ? "6.5" : "50"}
                      className={`w-full rounded-2xl border-2 p-4 outline-none transition-all ${errors[f.key] ? "border-red-300 bg-red-50" : "border-gray-100 bg-gray-50 focus:border-emerald-500 focus:bg-white focus:shadow-md"}`}
                    />
                    {errors[f.key] && <p className="text-xs text-red-500 font-bold mt-1 ml-1">{errors[f.key]}</p>}
                  </div>
                ))}

                {/* Expert Season Selector */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">{t("label_season", "Season")}</label>
                  <select
                    name="season"
                    value={form.season}
                    onChange={onChangeExpert}
                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 p-4 outline-none focus:border-emerald-500 focus:bg-white focus:shadow-md transition-all font-medium"
                  >
                    {seasonalMeta.seasons.map((s) => (
                      <option key={s} value={s}>{t(`season_${s.toLowerCase()}`, s)}</option>
                    ))}
                    {seasonalMeta.seasons.length === 0 && (
                      <>
                        <option value="Kharif">{t("season_kharif", "Monsoon (Kharif)")}</option>
                        <option value="Rabi">{t("season_rabi", "Winter (Rabi)")}</option>
                        <option value="Summer">{t("season_summer", "Summer")}</option>
                      </>
                    )}
                  </select>
                </div>
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
          result && !result.error && (result.predicted_crop || result.recommended_crop || result.recommended_crops) && (
            <div className="animate-fade-in-up space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">📊</span> {t("results_title", "Results")}
              </h2>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* AI Prediction HERO Card */}
                <div className="lg:col-span-2 rounded-3xl p-8 shadow-xl relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl -ml-8 -mb-8" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-100 bg-white/10 px-3 py-1 rounded-full border border-white/10">🤖 {t("results_ai_prediction", "AI Smart Prediction")}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-4">
                      <div>
                        <p className="text-sm font-bold text-emerald-100/80 uppercase mb-1">{t("results_recommended_crop", "Recommended Crop")}</p>
                        <h3 className="text-5xl md:text-7xl font-black drop-shadow-md tracking-tight">
                          {translateCrop(result.predicted_crop || result.recommended_crop, lang) || "—"}
                        </h3>
                      </div>

                      {result.confidence && (
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase opacity-60 leading-none mb-1">{t("results_confidence", "Confidence")}</p>
                            <p className="text-3xl font-black">{result.confidence}%</p>
                          </div>
                          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white flex items-center justify-center font-bold text-xs">
                            {result.confidence}%
                          </div>
                        </div>
                      )}
                    </div>

                    {result.note && (
                      <div className="mt-6 flex items-start gap-2 text-xs font-medium text-emerald-50 bg-black/10 p-3 rounded-xl border border-white/5">
                        <span>💡</span>
                        <span>{result.note}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Traditional Advice / Alternatives Card */}
                <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg flex flex-col h-full">
                  {mode === "beginner" && result.static_suggestion ? (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">📜</div>
                        <p className="font-bold text-gray-800">{t("results_trad_advice", "Traditional Local Advice")}</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {Array.isArray(result.static_suggestion)
                          ? result.static_suggestion.map(c => (
                            <div key={c} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-transparent hover:border-emerald-200 transition-all font-medium text-gray-700">
                              <span className="text-xl">🌱</span> {translateCrop(c, lang)}
                            </div>
                          ))
                          : <p className="text-sm text-gray-500">{result.static_suggestion}</p>
                        }
                      </div>
                    </>
                  ) : result.top_3 ? (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">🔄</div>
                        <p className="font-bold text-gray-800">{t("results_alternatives", "Alternatives")}</p>
                      </div>
                      <div className="flex-1 space-y-5">
                        {result.top_3.map((item, idx) => (
                          <div key={idx}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-gray-700">{idx + 1}. {translateCrop(item.crop, lang)}</span>
                              <span className="font-bold text-blue-600 text-xs">{item.confidence}%</span>
                            </div>
                            <div className="w-full rounded-full h-2 bg-gray-100 overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${item.confidence}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>

                {/* Card 3: Fertilizer Status */}
                {result.fertilizer && result.fertilizer.nutrients && (
                  <div className="rounded-3xl border border-emerald-100 bg-white p-7 shadow-lg md:col-span-3">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">🧪</div>
                      <p className="font-bold text-gray-800">{t("results_soil_analysis", "Soil Analysis & Nutrients")}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {["N", "P", "K"].map(key => {
                        const n = result.fertilizer.nutrients[key];
                        if (!n) return null;
                        const statusColor = n.status === "optimal" ? "bg-green-100 text-green-700" : n.status === "low" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";
                        return (
                          <div key={key} className="rounded-2xl border border-gray-100 p-5 bg-gray-50/70 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-3xl font-black text-gray-300">{key}</span>
                              <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${statusColor}`}>{t(`status_${n.status}`, n.status)}</span>
                            </div>
                            <div className="text-sm font-bold text-gray-800">{n.value} {t("unit_kg_ha", "kg/ha")}</div>
                            <div className="w-full h-1 bg-gray-200 mt-2 rounded-full overflow-hidden">
                              <div className={`h-full ${n.status === 'optimal' ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (n.value / n.ideal_range[1]) * 100)}%` }}></div>
                            </div>
                            <div className="text-[10px] text-gray-500 mt-2 font-medium">{t("ideal_range", "Ideal")}: {n.ideal_range[0]}-{n.ideal_range[1]}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Plan */}
              {result.fertilizer?.recommendations && (
                <div className="rounded-3xl bg-amber-50 border border-amber-100 p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-2">
                    <span className="bg-amber-100 p-2 rounded-lg text-amber-600">📋</span> {t("results_action_plan", "Recommended Action Plan")}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {result.fertilizer.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-4 bg-white/80 p-5 rounded-2xl border border-amber-200/50 shadow-sm hover:translate-x-1 transition-transform">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        <p className="text-sm text-gray-800 leading-relaxed font-semibold">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        }

        {/* 🆕 Post-Prediction Guidance — What to do next */}
        {
          result && !result.error && (result.recommended_crop || result.predicted_crop || result.recommended_crops) && (
            <div className="animate-fade-in-up rounded-3xl border border-blue-100 bg-blue-50 p-8 shadow-md">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span>🚀</span> {t("what_next", "What should I do next?")}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <a href="/advisory-chat" className="flex gap-3 items-start bg-white p-4 rounded-xl border border-blue-100 hover:shadow-md transition group">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-bold text-gray-800 group-hover:text-blue-600 transition">{t("next_ask_ai", "Ask AI for farming tips")}</p>
                    <p className="text-sm text-gray-500">{t("next_ask_ai_desc", "Get personalized advice on how to grow this crop")}</p>
                  </div>
                </a>
                <a href="/schemes" className="flex gap-3 items-start bg-white p-4 rounded-xl border border-blue-100 hover:shadow-md transition group">
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <p className="font-bold text-gray-800 group-hover:text-blue-600 transition">{t("next_check_schemes", "Check government schemes")}</p>
                    <p className="text-sm text-gray-500">{t("next_check_schemes_desc", "Find subsidies and loans for this crop")}</p>
                  </div>
                </a>
                <a href="/voice" className="flex gap-3 items-start bg-white p-4 rounded-xl border border-blue-100 hover:shadow-md transition group">
                  <span className="text-2xl">🎤</span>
                  <div>
                    <p className="font-bold text-gray-800 group-hover:text-blue-600 transition">{t("next_voice", "Use Voice Assistant")}</p>
                    <p className="text-sm text-gray-500">{t("next_voice_desc", "Ask questions by speaking in your language")}</p>
                  </div>
                </a>
                <a href="/awareness" className="flex gap-3 items-start bg-white p-4 rounded-xl border border-blue-100 hover:shadow-md transition group">
                  <span className="text-2xl">📰</span>
                  <div>
                    <p className="font-bold text-gray-800 group-hover:text-blue-600 transition">{t("next_awareness", "Create awareness poster")}</p>
                    <p className="text-sm text-gray-500">{t("next_awareness_desc", "Share farming knowledge with your community")}</p>
                  </div>
                </a>
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
