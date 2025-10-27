import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Field from "../components/Field";
import Spinner from "../components/Spinner";
import API from "../lib/api";

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

const KA_DISTRICTS = [
  "Bengaluru", "Bengaluru Rural", "Mysuru", "Mandya",
  "Ballari", "Belagavi", "Dharwad", "Shivamogga",
  "Tumakuru", "Hassan", "Chikkamagaluru", "Kodagu",
];

/* =========================
   COMPONENT
========================= */
export default function Advisory(){
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

  const modeTitle = useMemo(() =>
    mode === "expert"
      ? "Soil & Weather Inputs (Expert)"
      : "District & Season (Beginner — No Soil Test)"
  , [mode]);

  /* ---------- Expert handlers ---------- */
  const onChangeExpert = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateExpert = () => {
    const e = {};
    for (const f of FIELDS) {
      const v = form[f.key];
      if (v === "") e[f.key] = "Required";
      else if (isNaN(Number(v))) e[f.key] = "Must be a number";
      else if (f.key === "ph" && (Number(v) < 3 || Number(v) > 10)) e[f.key] = "pH should be 3–10";
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
      const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, Number(v)]));
      const { data } = await API.post("/api/advisory/crop", payload);
      setResult(data);
      window.__agro_result = data; // optional future voice readout
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Something went wrong";
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

  /* ---------- Beginner handlers ---------- */
  const onChangeBeginner = (e) => {
    setBeginnerForm({ ...beginnerForm, [e.target.name]: e.target.value });
    setResult(null);
  };

  const validateBeginner = () => {
    if (!beginnerForm.district) return "Please select a district";
    if (!beginnerForm.season)   return "Please select a season";
    return "";
  };

  const prefillBeginner = () => {
    setBeginnerForm({ state: "Karnataka", district: "Mysuru", season: "Kharif" });
    setResult(null);
  };

  const submitBeginner = async () => {
    const v = validateBeginner();
    if (v) return setResult({ error: v });
    setLoading(true);
    try {
      const { data } = await API.post("/api/advisory/seasonal/recommend", {
        state: beginnerForm.state,
        district: beginnerForm.district,
        season: beginnerForm.season,
      });
      setResult(data);
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Something went wrong";
      setResult({ error: msg });
    } finally {
      setLoading(false);
    }
  };

  const resetBeginner = () => {
    setBeginnerForm({ state: "Karnataka", district: "", season: "" });
    setResult(null);
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
              <h1 className="text-2xl font-bold text-green-800">Dashboard</h1>
              <p className="text-gray-600">
                <span className="mr-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Phase-1</span>
                Live now: Expert (Soil & Weather) + Beginner (District & Season). Other modules are planned next.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">Crop Advisory</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">Generative AI (Soon)</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">Voice (Soon)</span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left: Active Form by Mode */}
          <section className="card md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-green-700">{modeTitle}</h2>

              {mode === "expert" ? (
                <div className="flex gap-2">
                  <button className="rounded-lg border px-3 py-2 text-sm" onClick={prefillExpert}>
                    Prefill Sample
                  </button>
                  <button className="rounded-lg border px-3 py-2 text-sm" onClick={resetExpert}>
                    Reset
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button className="rounded-lg border px-3 py-2 text-sm" onClick={prefillBeginner}>
                    Prefill Sample
                  </button>
                  <button className="rounded-lg border px-3 py-2 text-sm" onClick={resetBeginner}>
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* Forms */}
            {mode === "expert" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {FIELDS.map(f => (
                    <Field
                      key={f.key}
                      label={f.label}
                      name={f.key}
                      value={form[f.key]}
                      onChange={onChangeExpert}
                      error={errors[f.key]}
                      placeholder={f.placeholder}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="btn" onClick={submitExpert} disabled={loading}>
                    {loading ? <Spinner text="Predicting..." /> : "Get Recommendation"}
                  </button>
                  <button
                    className="rounded-lg border px-4 py-2 text-sm"
                    onClick={() => { setMode("beginner"); setResult(null); }}
                  >
                    Switch to Beginner
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <select
                    name="state"
                    className="input"
                    value={beginnerForm.state}
                    onChange={onChangeBeginner}
                  >
                    <option value="Karnataka">Karnataka</option>
                  </select>

                  <select
                    name="district"
                    className="input"
                    value={beginnerForm.district}
                    onChange={onChangeBeginner}
                  >
                    <option value="">Select District</option>
                    {KA_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  <select
                    name="season"
                    className="input"
                    value={beginnerForm.season}
                    onChange={onChangeBeginner}
                  >
                    <option value="">Select Season</option>
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button className="btn" onClick={submitBeginner} disabled={loading}>
                    {loading ? <Spinner text="Fetching..." /> : "Get Suggested Crops"}
                  </button>
                  <button
                    className="rounded-lg border px-4 py-2 text-sm"
                    onClick={() => { setMode("expert"); setResult(null); }}
                  >
                    Switch to Expert
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Right: Output */}
          <aside className="card">
            <h2 className="mb-3 text-lg font-semibold text-green-700">Result</h2>

            {!result && (
              <p className="text-sm text-gray-600">
                {mode === "expert"
                  ? <>Enter soil & weather values or click <b>Prefill Sample</b>, then <b>Get Recommendation</b>.</>
                  : <>Select district & season (or use <b>Prefill Sample</b>), then <b>Get Suggested Crops</b>.</>
                }
              </p>
            )}

            {result?.error && <p className="text-sm text-red-600">{result.error}</p>}

            {/* Expert response */}
            {result && !result.error && (result.recommended_crop || result.fertilizer || result.confidence !== undefined) && (
              <div className="space-y-2">
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-sm text-gray-700">Recommended Crop</p>
                  <p className="text-xl font-bold text-green-700">{result.recommended_crop || "—"}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-gray-700">Model Confidence</p>
                  <p className="mono">{result.confidence ?? "—"}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-gray-700">Fertilizer Advice</p>
                  <p className="text-gray-800">{result.fertilizer || "—"}</p>
                </div>
              </div>
            )}

            {/* Beginner response */}
            {result && !result.error && result.recommended_crops && Array.isArray(result.recommended_crops) && (
              <div className="mt-3 space-y-2">
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-sm text-gray-700">
                    Suggested Crops for {beginnerForm.district || "—"}, {beginnerForm.state} ({beginnerForm.season || "—"})
                  </p>
                  <ul className="list-disc list-inside">
                    {result.recommended_crops.map(c => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {/* Raw JSON (debug) */}
            {result && (
              <details className="mt-3 rounded border bg-gray-50 p-3">
                <summary className="cursor-pointer text-sm text-gray-600">Raw JSON (debug)</summary>
                <pre className="mono text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
              </details>
            )}
          </aside>
        </div>

        {/* Future features (UI only) */}
        <section className="grid gap-4 md:grid-cols-3">
          {[
            { icon:"🎨", title:"Gen-AI Awareness Posters", desc:"Auto-generate posters, slogans, tips for NGO drives", soon:true },
            { icon:"🏛", title:"Government Scheme Simplifier", desc:"Explain schemes in simple local language", soon:true },
            { icon:"🗣", title:"Voice Assistant (KN/HI/TE)", desc:"Ask in local language & hear answers", soon:true },
            { icon:"🌐", title:"Multilingual UI", desc:"Localized interface & content", soon:true },
            { icon:"📈", title:"Advisory History & Analytics", desc:"View previous queries & improvements", soon:true },
            { icon:"🤝", title:"NGO Campaign Planner", desc:"Create shareable awareness campaigns", soon:true },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-white p-5 opacity-75">
              <div className="text-2xl">{f.icon}</div>
              <div className="mt-1 text-lg font-semibold text-gray-800">
                {f.title}
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  Coming Soon
                </span>
              </div>
              <p className="mt-1 text-gray-700">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}