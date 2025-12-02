// client/src/pages/Advisory.jsx
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Field from "../components/Field";
import Spinner from "../components/Spinner";
import { getWeatherFromCoords, reverseGeocode } from "../lib/weather"; // ✅ Weather
import { monthToSeason } from "../lib/season"; // ✅ Season helper

// use the structured API actions
import { getCropRecommendation, getSeasonalCrops, getSeasonalList } from "../lib/api.actions";
import { useTranslation } from "../i18n";

/* =========================
   CONFIG
========================= */
const FIELDS = [
  { key: "N",            label: "Nitrogen (N)",      placeholder: "e.g. 50 (kg/ha)" },
  { key: "P",            label: "Phosphorus (P)",    placeholder: "e.g. 40 (kg/ha)" },
  { key: "K",            label: "Potassium (K)",     placeholder: "e.g. 35 (kg/ha)" },
  { key: "ph",           label: "Soil pH",           placeholder: "e.g. 6.8" },
  { key: "temperature",  label: "Temperature (°C)",  placeholder: "e.g. 26" },
  { key: "rainfall",     label: "Rainfall (mm)",     placeholder: "e.g. 120" },
];

// fallback (if CSV missing) keep your KA list
const KA_DISTRICTS = [
  "Bengaluru", "Bengaluru Rural", "Mysuru", "Mandya",
  "Ballari", "Belagavi", "Dharwad", "Shivamogga",
  "Tumakuru", "Hassan", "Chikkamagaluru", "Kodagu",
];

/* =========================
   COMPONENT
========================= */
export default function Advisory(){
  const { t } = useTranslation();

  // Mode: "expert" or "beginner"
  const [mode, setMode] = useState("expert");

  // Expert state
  const [form, setForm]       = useState(Object.fromEntries(FIELDS.map(f => [f.key, ""])));
  const [errors, setErrors]   = useState({});

  // Beginner state
  const [beginnerForm, setBeginnerForm] = useState({
    state: "Karnataka",
    district: "",
    season: "",
  });

  // Shared
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  // ✅ NEW: show live location + weather in header
  const [locationInfo, setLocationInfo] = useState({
    district: "",
    state: "",
    temperature: "",
    rainfall: "",
  });

  // ✅ NEW: local history (last 10)
  const [history, setHistory] = useState(() =>
    JSON.parse(localStorage.getItem("advisory_history") || "[]")
  );

  // Seasonal metadata from server
  const [seasonalMeta, setSeasonalMeta] = useState({
    states: [],
    districtsByState: {},
    seasons: []
  });

  const modeTitle = useMemo(() =>
    mode === "expert"
      ? t("mode_expert", "Soil & Weather Inputs (Expert)")
      : t("mode_beginner", "District & Season (Beginner — No Soil Test)")
  , [mode, t]);

  /* ---------- Load seasonal metadata on mount ---------- */
  useEffect(() => {
    let mounted = true;
    async function loadMeta() {
      try {
        const { data } = await getSeasonalList();
        if (!mounted) return;
        // if dataset empty, fallback to Karnataka defaults
        if (!data || !data.states || data.states.length === 0) {
          setSeasonalMeta({
            states: ["Karnataka"],
            districtsByState: { Karnataka: KA_DISTRICTS },
            seasons: ["Kharif", "Rabi", "Summer"]
          });
        } else {
          setSeasonalMeta({
            states: data.states,
            districtsByState: data.districtsByState || {},
            seasons: data.seasons || []
          });
          // ensure beginnerForm state is valid - default to first state available
          setBeginnerForm(bf => ({
            ...bf,
            state: bf.state && data.states.includes(bf.state) ? bf.state : data.states[0] || bf.state
          }));
        }
      } catch (err) {
        console.warn("Failed to fetch seasonal metadata:", err);
        // fallback same as above
        setSeasonalMeta({
          states: ["Karnataka"],
          districtsByState: { Karnataka: KA_DISTRICTS },
          seasons: ["Kharif", "Rabi", "Summer"]
        });
      }
    }
    loadMeta();
    return () => { mounted = false; };
  }, []);

  /* ---------- ✅ NEW: Auto-run weather fill once on first visit ---------- */
  useEffect(() => {
    const alreadyRan = sessionStorage.getItem("auto_gps_done");
    if (!alreadyRan) {
      // Run auto-fill silently on first page load (optional)
      fetchWeatherAutoFill().catch(() => {
        // Silently fail; user can click button manually
      }).finally(() => {
        sessionStorage.setItem("auto_gps_done", "1");
      });
    }
  }, []);

  /* ---------- Expert handlers (unchanged) ---------- */
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
    setForm({ N:"60", P:"45", K:"40", ph:"6.7", temperature:"27", rainfall:"110" });
    setErrors({});
    setResult(null);
  };

  const submitExpert = async () => {
    if (!validateExpert()) return;
    setLoading(true);
    try {
      // convert all to numbers explicitly
      const payload = {
        N: Number(form.N),
        P: Number(form.P),
        K: Number(form.K),
        ph: Number(form.ph),
        temperature: Number(form.temperature),
        rainfall: Number(form.rainfall),
      };
      const { data } = await getCropRecommendation(payload);
      setResult(data);

      // ✅ push into history (max 10)
      setHistory((h) => {
        const updated = [{ time: Date.now(), result: data }, ...h].slice(0, 10);
        localStorage.setItem("advisory_history", JSON.stringify(updated));
        return updated;
      });

      window.__agro_result = data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || t("something_wrong", "Something went wrong");
      setResult({ error: msg });
    } finally {
      setLoading(false);
    }
  };

  const resetExpert = () => {
    setForm(Object.fromEntries(FIELDS.map(f => [f.key, ""])));
    setErrors({});
    setResult(null);
  };

  /* ---------- Beginner handlers (dynamic selects) ---------- */
  const onChangeBeginner = (e) => {
    const { name, value } = e.target;
    // if state changed -> reset district selection
    if (name === "state") {
      setBeginnerForm({ ...beginnerForm, state: value, district: "", season: beginnerForm.season });
    } else {
      setBeginnerForm({ ...beginnerForm, [name]: value });
    }
    setResult(null);
  };

  const validateBeginner = () => {
    if (!beginnerForm.district) return t("select_district", "Please select a district");
    if (!beginnerForm.season)   return t("select_season", "Please select a season");
    return "";
  };

  const prefillBeginner = () => {
    // pick defaults from loaded meta (prefer Mysuru if present)
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
      const { data } = await getSeasonalCrops({
        state: beginnerForm.state,
        district: beginnerForm.district,
        season: beginnerForm.season,
      });
      setResult(data);

      // ✅ add to history as well
      setHistory((h) => {
        const updated = [{ time: Date.now(), result: data }, ...h].slice(0, 10);
        localStorage.setItem("advisory_history", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
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

  /* ---------- Helpers to get current district list ---------- */
  const currentDistricts = (() => {
    const list = seasonalMeta.districtsByState?.[beginnerForm.state];
    return Array.isArray(list) && list.length ? list : (beginnerForm.state === "Karnataka" ? KA_DISTRICTS : []);
  })();

  /* ---------- Mode switch helpers ---------- */
  const switchToExpert = () => { setMode("expert"); setResult(null); };
  const switchToBeginner = () => { setMode("beginner"); setResult(null); };

  /* ---------- ✅ NEW: GPS + Weather autofill ---------- */
  const fetchWeatherAutoFill = async () => {
    try {
      setLoading(true);

      if (!("geolocation" in navigator)) {
        setResult({ error: t("geolocation_not_supported", "Geolocation not supported in this browser.") });
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // 1) Weather (OpenWeather) — needs VITE_WEATHER_KEY in client/.env
          const weather = await getWeatherFromCoords(lat, lon, import.meta.env.VITE_WEATHER_KEY);

          // 2) Reverse Geocode → district/state (OpenStreetMap Nominatim)
          const address = await reverseGeocode(lat, lon);
          const district =
            address?.county ||
            address?.state_district ||
            address?.city ||
            address?.town ||
            address?.village ||
            "";
          const state = address?.state || "Karnataka";

          // 3) Update header badge
          setLocationInfo({
            district: district,
            state: state,
            temperature: Number(weather.temperature).toFixed(1),
            rainfall: Number(weather.rainfall || 0).toFixed(1),
          });

          // 4) Auto-fill the expert form (keep user's own inputs if already filled)
          setForm((prev) => ({
            ...prev,
            temperature: Number(weather.temperature).toFixed(1),
            rainfall: Number(weather.rainfall || 0).toFixed(1),
            ph: prev.ph || "6.8",
            N: prev.N || "50",
            P: prev.P || "40",
            K: prev.K || "35",
          }));

          // 5) ✅ NEW: Auto-fill beginner form with district + season
          const detectedSeason = monthToSeason(new Date().getMonth(), state || "Karnataka");
          setBeginnerForm((prev) => ({
            state: state || "Karnataka",
            district: district || prev.district || "",
            season: detectedSeason,
          }));

          setResult({ note: t("auto_filled_using_location", "Auto-filled using live weather at your location") + ` (${district || t("your_area", "your area")})` });
          setLoading(false);
        },
        (err) => {
          setResult({ error: t("location_permission", "Unable to get location permission. Please allow location access.") });
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } catch (err) {
      console.warn("Autofill failed:", err);
      setResult({ error: t("autofill_failed", "Weather/GPS autofill failed. Try again.") });
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl p-4 md:p-8 space-y-8">
        {/* Phase-1 Banner / Dashboard Header */}
        <header className="rounded-2xl border bg-white p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-800">{t("dashboard", "Dashboard")}</h1>
              <p className="text-gray-600">
                <span className="mr-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">{t("phase", "Phase-1")}</span>
                {t("dashboard_sub", "Live now: Expert (Soil & Weather) + Beginner (District & Season). Other modules are planned next.")}
              </p>

              {/* ✅ NEW: live location badge */}
              {locationInfo.district && (
                <p className="text-sm text-green-700 mt-1">
                  📍 {locationInfo.district}, {locationInfo.state} — {locationInfo.temperature}°C | {locationInfo.rainfall} mm
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">{t("crop_advisory", "Crop Advisory")}</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">{t("generative_ai", "Generative AI (Soon)")}</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">{t("voice_soon", "Voice (Soon)")}</span>
            </div>
          </div>
        </header>

        {/* Input Form */}
        <section className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-green-700">{modeTitle}</h2>

            {mode === "expert" ? (
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg border px-3 py-2 text-sm" onClick={prefillExpert}>
                  {t("prefill_sample", "Prefill Sample")}
                </button>

                {/* ✅ NEW: GPS + Weather autofill button */}
                <button
                  className="rounded-lg border px-3 py-2 text-sm"
                  onClick={fetchWeatherAutoFill}
                  disabled={loading}
                  title={t("auto_fill_title", "Auto-fill Temperature & Rainfall using your current location")}
                >
                  {t("auto_fill", "Auto Fill (Weather + GPS)")}
                </button>

                <button className="rounded-lg border px-3 py-2 text-sm" onClick={resetExpert}>
                  {t("reset", "Reset")}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button className="rounded-lg border px-3 py-2 text-sm" onClick={prefillBeginner}>
                  {t("prefill_sample", "Prefill Sample")}
                </button>
                <button className="rounded-lg border px-3 py-2 text-sm" onClick={resetBeginner}>
                  {t("reset", "Reset")}
                </button>
              </div>
            )}
          </div>

          {/* Forms */}
          {mode === "expert" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {FIELDS.map(f => (
                  <Field
                    key={f.key}
                    label={t(f.key.toLowerCase(), f.label)}
                    name={f.key}
                    value={form[f.key]}
                    onChange={onChangeExpert}
                    error={errors[f.key]}
                    placeholder={t(`${f.key.toLowerCase()}_placeholder`, f.placeholder)}
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="btn" onClick={submitExpert} disabled={loading}>
                  {loading ? <Spinner text={t("predicting", "Predicting...")} /> : t("get_recommendation", "Get Recommendation")}
                </button>
                <button
                  className="rounded-lg border px-4 py-2 text-sm"
                  onClick={() => { switchToBeginner(); }}
                >
                  {t("switch_to_beginner", "Switch to Beginner")}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <select
                  name="state"
                  className="input"
                  value={beginnerForm.state}
                  onChange={onChangeBeginner}
                >
                  {seasonalMeta.states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                  name="district"
                  className="input"
                  value={beginnerForm.district}
                  onChange={onChangeBeginner}
                >
                  <option value="">{t("select_district_option", "Select District")}</option>
                  {currentDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select
                  name="season"
                  className="input"
                  value={beginnerForm.season}
                  onChange={onChangeBeginner}
                >
                  <option value="">{t("select_season_option", "Select Season")}</option>
                  {seasonalMeta.seasons.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button className="btn" onClick={submitBeginner} disabled={loading}>
                  {loading ? <Spinner text={t("fetching", "Fetching...")} /> : t("get_suggested_crops", "Get Suggested Crops")}
                </button>
                <button
                  className="rounded-lg border px-4 py-2 text-sm"
                  onClick={() => { switchToExpert(); }}
                >
                  {t("switch_to_expert", "Switch to Expert")}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Results Section - SIDE BY SIDE */}
        {result && !result.error && (result.recommended_crop || result.predicted_crop || result.recommended_crops) && (
          <div>
            <h2 className="text-lg font-semibold text-green-700 mb-4">📊 {t("results", "Results")}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Card 1: Recommended Crop */}
              <div className="card rounded-lg border border-green-200 bg-green-50">
                <p className="text-sm text-gray-700 font-semibold">🌱 {t("recommended_crop", "Recommended Crop")}</p>
                <p className="text-3xl font-bold text-green-700 mt-3">{result.recommended_crop || result.predicted_crop || "—"}</p>
                {result.confidence && (
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-semibold text-green-600">{t("confidence", "Confidence")}:</span> {result.confidence}%
                  </p>
                )}
              </div>

              {/* Card 2: Top-3 Options */}
              {result.top_3 && Array.isArray(result.top_3) && result.top_3.length > 0 && (
                <div className="card rounded-lg border border-blue-200 bg-blue-50">
                  <p className="text-sm text-gray-700 font-semibold">🔄 {t("alternative_options", "Alternative Options")}</p>
                  <div className="space-y-2 mt-3">
                    {result.top_3.map((item, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-medium text-gray-800">{idx + 1}. {item.crop}</span>
                          <span className="font-semibold text-blue-600">{item.confidence}%</span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${item.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Card 3: Fertilizer Recommendations */}
              {result.fertilizer && (
                <div className="card rounded-lg border border-amber-200 bg-amber-50">
                  <p className="text-sm text-gray-700 font-semibold">🌾 {t("fertilizer_status", "Fertilizer Status")}</p>
                  <div className="space-y-2 mt-3 text-xs">
                    {result.fertilizer.nutrients && (
                      <>
                        {result.fertilizer.nutrients.N && (
                          <div className="rounded bg-white p-2 border border-amber-100">
                            <p className="font-semibold text-gray-800">{t("nitrogen", "Nitrogen (N)")}</p>
                            <p className="text-gray-600 text-[11px]">{result.fertilizer.nutrients.N.status.toUpperCase()}</p>
                            <p className="text-gray-500 text-[10px] mt-1">
                              {result.fertilizer.nutrients.N.value} / {result.fertilizer.nutrients.N.ideal_range[0]}-{result.fertilizer.nutrients.N.ideal_range[1]} kg/ha
                            </p>
                          </div>
                        )}
                        {result.fertilizer.nutrients.P && (
                          <div className="rounded bg-white p-2 border border-amber-100">
                            <p className="font-semibold text-gray-800">{t("phosphorus", "Phosphorus (P)")}</p>
                            <p className="text-gray-600 text-[11px]">{result.fertilizer.nutrients.P.status.toUpperCase()}</p>
                            <p className="text-gray-500 text-[10px] mt-1">
                              {result.fertilizer.nutrients.P.value} / {result.fertilizer.nutrients.P.ideal_range[0]}-{result.fertilizer.nutrients.P.ideal_range[1]} kg/ha
                            </p>
                          </div>
                        )}
                        {result.fertilizer.nutrients.K && (
                          <div className="rounded bg-white p-2 border border-amber-100">
                            <p className="font-semibold text-gray-800">{t("potassium", "Potassium (K)")}</p>
                            <p className="text-gray-600 text-[11px]">{result.fertilizer.nutrients.K.status.toUpperCase()}</p>
                            <p className="text-gray-500 text-[10px] mt-1">
                              {result.fertilizer.nutrients.K.value} / {result.fertilizer.nutrients.K.ideal_range[0]}-{result.fertilizer.nutrients.K.ideal_range[1]} kg/ha
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions from Fertilizer */}
            {result.fertilizer?.recommendations && Array.isArray(result.fertilizer.recommendations) && (
              <div className="card mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800 mb-3">✅ {t("recommended_actions", "Recommended Actions")}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.fertilizer.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-2 text-sm text-gray-800">
                      <span className="text-amber-600 font-bold">•</span>
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Beginner Results */}
        {result && !result.error && result.recommended_crops && Array.isArray(result.recommended_crops) && (
          <div className="card rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-800 mb-3">
              🌾 {t("suggested_crops_for", "Suggested Crops for")} {beginnerForm.district || "—"}, {beginnerForm.state} ({beginnerForm.season || "—"})
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {result.recommended_crops.map(c => (
                <div key={c} className="rounded bg-green-100 px-3 py-2 text-sm font-medium text-green-700 text-center">
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {result?.error && (
          <div className="card rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{result.error}</p>
          </div>
        )}

        {/* Empty State */}
        {!result && (
          <div className="card rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === "expert"
                ? t("empty_expert", "👉 Enter soil & weather values or click Prefill Sample, then Get Recommendation")
                : t("empty_beginner", "👉 Select district & season (or use Prefill Sample), then Get Suggested Crops")}
            </p>
          </div>
        )}

        {/* Raw JSON (debug) */}
        {result && (
          <details className="mt-6 rounded border bg-gray-50 p-3">
            <summary className="cursor-pointer text-sm text-gray-600 font-semibold">📋 {t("raw_json", "Raw JSON (debug)")}</summary>
            <pre className="mono text-xs overflow-auto mt-2">{JSON.stringify(result, null, 2)}</pre>
          </details>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">📜 {t("history", "History (Last 10)")}</h3>
            <ul className="space-y-1 text-xs text-gray-600 max-h-48 overflow-auto">
              {history.map((h, i) => (
                <li key={i} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <span className="text-gray-500">{new Date(h.time).toLocaleTimeString()}</span>
                  <span className="font-medium text-gray-700">{h.result?.recommended_crop || h.result?.predicted_crop || (Array.isArray(h.result?.recommended_crops) ? h.result.recommended_crops.slice(0, 3).join(", ") : "—")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Future features (UI only) */}
        <section className="grid gap-4 md:grid-cols-3">
          {[
            { icon:"🎨", titleKey:"future_genai_title", title:"Gen-AI Awareness Posters", descKey:"future_genai_desc", desc:"Auto-generate posters, slogans, tips for NGO drives" },
            { icon:"🏛", titleKey:"future_scheme_title", title:"Government Scheme Simplifier", descKey:"future_scheme_desc", desc:"Explain schemes in simple local language" },
            { icon:"🗣", titleKey:"future_voice_title", title:"Voice Assistant (KN/HI/TE)", descKey:"future_voice_desc", desc:"Ask in local language & hear answers" },
            { icon:"🌐", titleKey:"future_multilingual_title", title:"Multilingual UI", descKey:"future_multilingual_desc", desc:"Localized interface & content" },
            { icon:"📈", titleKey:"future_history_title", title:"Advisory History & Analytics", descKey:"future_history_desc", desc:"View previous queries & improvements" },
            { icon:"🤝", titleKey:"future_ngo_title", title:"NGO Campaign Planner", descKey:"future_ngo_desc", desc:"Create shareable awareness campaigns" },
          ].map((f) => (
            <div key={f.titleKey} className="rounded-2xl border bg-white p-5 opacity-75">
              <div className="text-2xl">{f.icon}</div>
              <div className="mt-1 text-lg font-semibold text-gray-800">
                {t(f.titleKey, f.title)}
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  {t("coming_soon", "Coming Soon")}
                </span>
              </div>
              <p className="mt-1 text-gray-700">{t(f.descKey, f.desc)}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
