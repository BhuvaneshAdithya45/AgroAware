import { useState, useEffect } from "react";
import { getAllSchemes, getApplicableSchemes, searchSchemes } from "../lib/schemeFilter";
import { useLanguage } from "../i18n";
import SpeakerButton from "../components/SpeakerButton";

const schemeTranslations = {
  en: {
    title: "Government Agricultural Schemes",
    subtitle: "Discover schemes you're eligible for",
    search: "Search schemes...",
    filter: "Filter by eligibility",
    noFilters: "All Schemes",
    crop: "Crop",
    state: "State",
    landSize: "Land Size (acres)",
    noResults: "No schemes match your criteria",
    eligibility: "Eligibility",
    benefits: "Benefits",
    applyProcess: "How to Apply",
    website: "Visit Website",
    phone: "Call",
    apply: "Learn More & Apply",
    recommended: "Recommended for you"
  },
  hi: {
    title: "सरकारी कृषि योजनाएं",
    subtitle: "अपने लिए योग्य योजनाएं खोजें",
    search: "योजनाएं खोजें...",
    filter: "पात्रता के आधार पर फ़िल्टर करें",
    noFilters: "सभी योजनाएं",
    crop: "फसल",
    state: "राज्य",
    landSize: "भूमि का आकार (एकड़)",
    noResults: "कोई योजना आपकी मानदंड से मेल नहीं खाती",
    eligibility: "पात्रता",
    benefits: "लाभ",
    applyProcess: "आवेदन कैसे करें",
    website: "वेबसाइट पर जाएं",
    phone: "कॉल करें",
    apply: "और जानें व आवेदन करें",
    recommended: "आपके लिए अनुशंसित"
  },
  kn: {
    title: "ಸರ್ಕಾರಿ ಕೃಷಿ ಯೋಜನೆಗಳು",
    subtitle: "ನಿಮಗೆ ಅರ್ಹ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ",
    search: "ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ...",
    filter: "ಅರ್ಹತೆಯ ಆಧಾರದ ಮೇಲೆ ಫಿಲ್ಟರ್ ಮಾಡಿ",
    noFilters: "ಎಲ್ಲಾ ಯೋಜನೆಗಳು",
    crop: "ಫಸಲು",
    state: "ರಾಜ್ಯ",
    landSize: "ಭೂಮಿಯ ಗಾತ್ರ (ಎಕರೆ)",
    noResults: "ನಿಮ್ಮ ಮಾನದಂಡಕ್ಕೆ ಯಾವುದೇ ಯೋಜನೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ",
    eligibility: "ಅರ್ಹತೆ",
    benefits: "ಲಾಭಗಳು",
    applyProcess: "ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
    website: "ವೆಬ್‌ಸೈಟ್‌ಗೆ ಭೇಟಿ ನೀಡಿ",
    phone: "ಕರೆ ಮಾಡಿ",
    apply: "ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಮತ್ತು ಅರ್ಜಿ",
    recommended: "ನಿಮಗೆ ಸುಪಾರಿಶ"
  },
  te: {
    title: "ప్రభుత్వ వ్యవసాయ పథకాలు",
    subtitle: "మీకు అర్హత కల్గిన పథకాలను కనుగొనండి",
    search: "పథకాలను శోధించండి...",
    filter: "అర్హతల ఆధారంపై ఫిల్టర్ చేయండి",
    noFilters: "అన్ని పథకాలు",
    crop: "పంట",
    state: "రాష్ట్రం",
    landSize: "భూమి పరిమాణం (ఎకరలు)",
    noResults: "మీ ప్రమాణాలకు పంటపడే పథకలు లేవు",
    eligibility: "అర్హత",
    benefits: "ప్రయోజనాలు",
    applyProcess: "దరఖాస్తు ఎలా చేయాలి",
    website: "వెబ్‌సైట్‌ను సందర్శించండి",
    phone: "కాల్ చేయండి",
    apply: "మరింత తెలుసుకోండి & దరఖాస్తు చేయండి",
    recommended: "మీకు సిఫారసు చేయబడినది"
  },
  ta: {
    title: "அரசு வேளாண் திட்டங்கள்",
    subtitle: "உங்களுக்குத் தகுதியான திட்டங்களைக் கண்டறியவும்",
    search: "திட்டங்களைத் தேடு...",
    filter: "தகுதி மூலம் வடிகட்டு",
    noFilters: "அனைத்து திட்டங்கள்",
    crop: "பயிர்",
    state: "மாநிலம்",
    landSize: "நில அளவு (ஏக்கர்)",
    noResults: "உங்கள் நிபந்தனைகளுக்கு எந்த திட்டமும் பொருந்தவில்லை",
    eligibility: "தகுதி",
    benefits: "நன்மைகள்",
    applyProcess: "விண்ணப்பிப்பது எப்படி",
    website: "வலைத்தளத்தைப் பார்வையிடவும்",
    phone: "அழைக்க",
    apply: "மேலும் அறிய & விண்ணப்பிக்க",
    recommended: "உங்களுக்காக பரிந்துரைக்கப்பட்டது"
  }
};

export default function Schemes() {
  const { language } = useLanguage();
  const t = schemeTranslations[language] || schemeTranslations.en;

  const [allSchemes, setAllSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [translatedSchemes, setTranslatedSchemes] = useState({});
  const [loadingTranslation, setLoadingTranslation] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ crop: "", state: "", landSize: "" });
  const [showFilters, setShowFilters] = useState(false);

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const popularCrops = [
    "Rice", "Wheat", "Maize", "Cotton", "Soyabean", "Sugarcane",
    "Potato", "Onion", "Tomato", "Banana", "Mango"
  ];

  useEffect(() => {
    const schemes = getAllSchemes();
    setAllSchemes(schemes);
    setFilteredSchemes(schemes);
  }, []);

  useEffect(() => {
    let results = allSchemes;

    // Apply search
    if (searchTerm.trim()) {
      results = searchSchemes(searchTerm);
    }

    // Apply filters
    if (filters.crop || filters.state || filters.landSize) {
      results = getApplicableSchemes({
        crop: filters.crop ? filters.crop.toLowerCase() : undefined,
        state: filters.state || undefined,
        landSize: filters.landSize ? parseFloat(filters.landSize) : undefined
      });
    }

    setFilteredSchemes(results);
  }, [searchTerm, filters, allSchemes]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ crop: "", state: "", landSize: "" });
    setSearchTerm("");
  };

  const handleTranslate = async (scheme) => {
    if (loadingTranslation[scheme.id]) return;

    setLoadingTranslation(prev => ({ ...prev, [scheme.id]: true }));

    try {
      const textToTranslate = `
        Name: ${scheme.name}
        Description: ${scheme.description}
        Benefits: ${scheme.benefits}
        Eligibility: ${scheme.eligibility.requirements.join(", ")}
        Apply: ${scheme.applyProcess}
      `;

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/advisory/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToTranslate, targetLang: language }),
      });

      const data = await response.json();

      if (data.translatedText) {
        // Parse the translated text back (naive parsing assuming structure is kept)
        // Since LLM output structure might vary, we'll just store the block text for now or try to parse
        // For simplicity and robustness, let's just translate individual fields or ask LLM to return JSON.
        // Let's re-do the API call to ask for JSON to be safe, OR just accept the text block and show it.
        // Actually, let's do a refined prompt in the API? No, API is generic.
        // Let's use 4 parallel requests? No, too slow.
        // Let's just translate the Description and Benefits for now as a single block?
        // Or better: Ask LLM to translate a JSON object string.

        const payload = JSON.stringify({
          name: scheme.name,
          description: scheme.description,
          benefits: scheme.benefits,
          applyProcess: scheme.applyProcess
        });

        const responseJson = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/advisory/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `Translate this JSON object values to ${language} and return ONLY valid JSON: ${payload}`,
            targetLang: language
          }),
        });

        const dataJson = await responseJson.json();
        // Try to parse the result
        try {
          const startInfo = dataJson.translatedText.indexOf('{');
          const endInfo = dataJson.translatedText.lastIndexOf('}');
          if (startInfo !== -1 && endInfo !== -1) {
            const jsonStr = dataJson.translatedText.substring(startInfo, endInfo + 1);
            const translatedObj = JSON.parse(jsonStr);
            setTranslatedSchemes(prev => ({ ...prev, [scheme.id]: translatedObj }));
          }
        } catch (e) {
          console.error("Failed to parse translated JSON", e);
        }
      }
    } catch (error) {
      console.error("Translation failed", error);
    } finally {
      setLoadingTranslation(prev => ({ ...prev, [scheme.id]: false }));
    }
  };

  const getSchemeDisplay = (scheme) => {
    return translatedSchemes[scheme.id] ? { ...scheme, ...translatedSchemes[scheme.id] } : scheme;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-2">{t.title}</h1>
          <p className="text-gray-600 text-lg">{t.subtitle}</p>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-green-600 font-semibold mb-4 flex items-center gap-2 hover:text-green-700"
          >
            {showFilters ? "▼" : "▶"} {t.filter}
          </button>

          {/* Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.crop}</label>
                <select
                  value={filters.crop}
                  onChange={e => handleFilterChange("crop", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{t.noFilters}</option>
                  {popularCrops.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.state}</label>
                <select
                  value={filters.state}
                  onChange={e => handleFilterChange("state", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{t.noFilters}</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.landSize}</label>
                <input
                  type="number"
                  placeholder="e.g., 2.5"
                  value={filters.landSize}
                  onChange={e => handleFilterChange("landSize", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Reset Button */}
          {(searchTerm || filters.crop || filters.state || filters.landSize) && (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          {filteredSchemes.length > 0 ? (
            <p>
              Found <span className="font-bold text-green-700">{filteredSchemes.length}</span> schemes
            </p>
          ) : (
            <p className="text-red-600">{t.noResults}</p>
          )}
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSchemes.map(originalScheme => {
            const scheme = getSchemeDisplay(originalScheme);
            return (
              <div
                key={scheme.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-l-4 border-green-500"
              >
                <div className="p-6">
                  {/* Title with Speaker Button */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-green-800">{scheme.name}</h2>
                      <p className="text-gray-600 text-sm mt-1">{scheme.description}</p>
                    </div>
                    {/* 🔊 Speaker button for scheme name & description */}
                    <div className="flex gap-2">
                      {language !== "en" && !translatedSchemes[scheme.id] && (
                        <button
                          onClick={() => handleTranslate(scheme)}
                          disabled={loadingTranslation[scheme.id]}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition"
                        >
                          {loadingTranslation[scheme.id] ? "Translating..." : "🌐 Translate"}
                        </button>
                      )}
                      <SpeakerButton
                        text={`${scheme.name}. ${scheme.description}`}
                        language={language}
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Benefits Highlight */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-800 mb-1">{t.benefits}</p>
                      <p className="text-green-700 font-semibold">{scheme.benefits}</p>
                    </div>
                    {/* 🔊 Speaker button for benefits */}
                    <SpeakerButton
                      text={scheme.benefits}
                      language={language}
                      size="sm"
                    />
                  </div>

                  {/* Eligibility */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">{t.eligibility}</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {scheme.eligibility.crops[0] !== "all" && (
                        <li>• Crops: {scheme.eligibility.crops.join(", ")}</li>
                      )}
                      {scheme.eligibility.states[0] !== "all" && (
                        <li>• States: {scheme.eligibility.states.join(", ")}</li>
                      )}
                      {scheme.eligibility.landSize !== "all" && (
                        <li>• Min. Land Size: {scheme.eligibility.landSize}</li>
                      )}
                      {scheme.eligibility.income && (
                        <li>• Income Criteria: {scheme.eligibility.income}</li>
                      )}
                      {scheme.eligibility.requirements && (
                        <li>• {scheme.eligibility.requirements[0]}</li>
                      )}
                    </ul>
                  </div>

                  {/* How to Apply */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-blue-800 mb-1">{t.applyProcess}</p>
                    <p className="text-sm text-blue-700">{scheme.applyProcess}</p>
                  </div>

                  {/* Contact & Links */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scheme.website && (
                      <a
                        href={scheme.website.startsWith("http") ? scheme.website : `https://${scheme.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                      >
                        {t.website}
                      </a>
                    )}
                    {scheme.phone && (
                      <a
                        href={`tel:${scheme.phone}`}
                        className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                      >
                        {t.phone}: {scheme.phone}
                      </a>
                    )}
                  </div>

                  {/* Learn More Button */}
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition">
                    {t.apply}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredSchemes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">{t.noResults}</p>
            <button
              onClick={resetFilters}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              {t.noFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}