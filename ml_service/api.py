# ml_service/api.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import json
import numpy as np
from pathlib import Path
import os
import uvicorn

# RAG imports (lazy loaded for faster startup)
rag_loaded = False
load_pdf_text = None
split_text = None
embed_texts = None
embed_query = None
vector_store = None

def load_rag_modules():
    """Lazy load RAG modules when first needed"""
    global rag_loaded, load_pdf_text, split_text, embed_texts, embed_query, vector_store
    if not rag_loaded:
        from rag.pdf_loader import load_pdf_text as _load_pdf
        from rag.text_splitter import split_text as _split
        from rag.embeddings import embed_texts as _embed_texts, embed_query as _embed_query
        from rag.vector_store import vector_store as _store
        load_pdf_text = _load_pdf
        split_text = _split
        embed_texts = _embed_texts
        embed_query = _embed_query
        vector_store = _store
        rag_loaded = True
        print("✅ RAG modules loaded")

from fertilizer import get_fertilizer_recommendation


APP_DIR = Path(__file__).resolve().parent
MODELS_DIR = APP_DIR / "models"

UPLOAD_DIR = APP_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# ---------- Load Artifacts ----------
# Global mapping for seasonal reliability cross-check (all 40 model crops)
CROP_SEASON_MAP = {
    # Cereals & Grains
    'rice': ['Kharif'], 'maize': ['Kharif', 'Summer'], 'wheat': ['Rabi'],
    'barley': ['Rabi'], 'jowar': ['Kharif', 'Rabi'], 'ragi': ['Kharif'],
    # Pulses & Legumes
    'blackgram': ['Kharif'], 'moong': ['Kharif', 'Summer'], 'horsegram': ['Kharif', 'Rabi'],
    'soyabean': ['Kharif'], 'lentil': ['Rabi'],
    # Oilseeds
    'sunflower': ['Whole Year'], 'mustard': ['Rabi'], 'rapeseed': ['Rabi'],
    # Fibre Crops
    'cotton': ['Kharif'], 'jute': ['Kharif'],
    # Vegetables
    'potato': ['Rabi'], 'tomato': ['Whole Year'], 'onion': ['Rabi', 'Kharif'],
    'brinjal': ['Whole Year'], 'cabbage': ['Rabi'], 'cauliflower': ['Rabi'],
    'garlic': ['Rabi'], 'radish': ['Rabi', 'Kharif'], 'cucumber': ['Summer', 'Kharif'],
    'ladyfinger': ['Kharif', 'Summer'], 'bittergourd': ['Summer', 'Kharif'],
    'bottlegourd': ['Summer', 'Kharif'], 'pumpkin': ['Kharif', 'Summer'],
    'drumstick': ['Whole Year'], 'coriander': ['Rabi'],
    'sweetpotato': ['Kharif', 'Rabi'],
    # Fruits
    'banana': ['Whole Year'], 'mango': ['Summer'], 'grapes': ['Whole Year'],
    'orange': ['Whole Year'], 'papaya': ['Whole Year'], 'pineapple': ['Whole Year'],
    'jackfruit': ['Whole Year'],
    # Spices & Plantation
    'turmeric': ['Kharif'], 'cardamom': ['Kharif'], 'blackpepper': ['Whole Year'],
    'sugarcane': ['Whole Year', 'Kharif'],
}

MODEL_FILE = MODELS_DIR / "ensemble_model.pkl"
SCALER_FILE = MODELS_DIR / "scaler.pkl"
ENCODER_FILE = MODELS_DIR / "label_encoder.pkl"
FEATURES_FILE = MODELS_DIR / "features.json"

model = None
scaler = None
label_encoder = None
feature_names = None

try:
    model = joblib.load(MODEL_FILE)
    print("✅ Model loaded")
except Exception as e:
    print("❌ Model load failed:", e)

try:
    scaler = joblib.load(SCALER_FILE)
    print("✅ Scaler loaded")
except Exception as e:
    print("❌ Scaler load failed:", e)

try:
    label_encoder = joblib.load(ENCODER_FILE)
    print("✅ Label encoder loaded")
except Exception as e:
    print("❌ Label encoder load failed:", e)

try:
    with open(FEATURES_FILE, "r") as f:
        feature_names = json.load(f)
    print("✅ Feature names loaded")
except Exception as e:
    print("❌ Feature names load failed:", e)

# ---------- App Init ----------
app = FastAPI(title="AgroAware ML Service", version="2.0")

# Read allowed origins from env, fallback to localhost for dev
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5000,http://localhost:5173,http://127.0.0.1:5000,http://127.0.0.1:5173")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Schemas ----------
class CropInput(BaseModel):
    N: float
    P: float
    K: float
    ph: float
    temperature: float
    rainfall: float
    season: str = "Kharif"

class FertilizerInput(BaseModel):
    crop: str
    N: float
    P: float
    K: float

class RagQuery(BaseModel):
    question: str


# ---------- Input Validation with Smart Micro-Recommendations ----------
VALID_RANGES = {
    "N":           {"min": 0,   "max": 300,  "unit": "kg/ha"},
    "P":           {"min": 0,   "max": 200,  "unit": "kg/ha"},
    "K":           {"min": 0,   "max": 300,  "unit": "kg/ha"},
    "ph":          {"min": 3.0, "max": 10.0, "unit": "pH"},
    "temperature": {"min": 5,   "max": 50,   "unit": "°C"},
    "rainfall":    {"min": 10,  "max": 3000, "unit": "mm"},
}

# Actionable micro-recommendations for borderline/extreme input values
SMART_WARNINGS = {
    "ph": [
        {"condition": lambda v: v < 4.5, "msg": "Very acidic soil (pH {v}) — consider applying agricultural lime (2-4 tonnes/ha) to raise pH before sowing."},
        {"condition": lambda v: v < 5.5, "msg": "Acidic soil (pH {v}) — apply dolomite lime (1-2 tonnes/ha). Suitable for tea, coffee, blueberry."},
        {"condition": lambda v: v > 8.5, "msg": "Alkaline soil (pH {v}) — consider gypsum treatment (2-3 tonnes/ha) or grow salt-tolerant crops like barley."},
        {"condition": lambda v: v > 7.5, "msg": "Slightly alkaline soil (pH {v}) — add organic compost or sulphur to gradually lower pH."},
    ],
    "N": [
        {"condition": lambda v: v > 200, "msg": "Very high Nitrogen ({v} kg/ha) — risk of leaf burn and groundwater contamination. Reduce by 20-30%."},
        {"condition": lambda v: v < 20,  "msg": "Very low Nitrogen ({v} kg/ha) — apply urea (40-60 kg/ha) or green manure to boost nitrogen."},
    ],
    "P": [
        {"condition": lambda v: v > 100, "msg": "Very high Phosphorus ({v} kg/ha) — risk of soil toxicity. Skip P fertilizer this season."},
        {"condition": lambda v: v < 10,  "msg": "Very low Phosphorus ({v} kg/ha) — apply DAP or rock phosphate to improve root development."},
    ],
    "K": [
        {"condition": lambda v: v > 200, "msg": "Very high Potassium ({v} kg/ha) — can lock out calcium/magnesium. Reduce K inputs."},
        {"condition": lambda v: v < 15,  "msg": "Very low Potassium ({v} kg/ha) — apply MOP (Muriate of Potash) for better crop resilience."},
    ],
    "temperature": [
        {"condition": lambda v: v > 42, "msg": "Extreme heat ({v}°C) — consider heat-tolerant varieties and mulching to protect roots."},
        {"condition": lambda v: v < 10, "msg": "Cold conditions ({v}°C) — frost risk for tropical crops. Consider protected cultivation."},
    ],
    "rainfall": [
        {"condition": lambda v: v > 2500, "msg": "Very high rainfall ({v}mm) — ensure proper drainage. Suitable for rice, jute."},
        {"condition": lambda v: v < 50,  "msg": "Very low rainfall ({v}mm) — drip irrigation essential. Consider drought-tolerant crops like millet, sorghum."},
    ],
}

def validate_inputs(data: CropInput):
    """Check inputs against realistic agronomic ranges. Returns (errors, smart_warnings)."""
    errors = []
    warnings = []
    values = {"N": data.N, "P": data.P, "K": data.K,
              "ph": data.ph, "temperature": data.temperature, "rainfall": data.rainfall}

    for field, val in values.items():
        r = VALID_RANGES[field]
        # Hard errors — physically impossible
        if val < 0:
            errors.append(f"{field} cannot be negative (got {val})")
        elif field == "ph" and (val < 0 or val > 14):
            errors.append(f"pH must be between 0 and 14 (got {val})")
        # Smart micro-recommendations instead of generic warnings
        if field in SMART_WARNINGS:
            for rule in SMART_WARNINGS[field]:
                if rule["condition"](val):
                    warnings.append(rule["msg"].format(v=val))
                    break  # only first matching warning per field
    return errors, warnings


# ---------- Feature Importance (Explainability) ----------
FEATURE_LABELS = {
    "N": "Nitrogen", "P": "Phosphorus", "K": "Potassium",
    "ph": "Soil pH", "temperature": "Temperature", "rainfall": "Rainfall",
    "season_Kharif": "Kharif season", "season_Rabi": "Rabi season",
    "season_Summer": "Summer season", "season_Whole Year": "Year-round season"
}

def get_prediction_explanation(model, arr_scaled, feature_names_list):
    """Extract feature importance from ensemble sub-estimators and explain prediction."""
    try:
        importances = np.zeros(len(feature_names_list))
        count = 0
        # Extract from each estimator in the ensemble
        for name, estimator in model.named_estimators_.items():
            if hasattr(estimator, 'feature_importances_'):
                importances += estimator.feature_importances_
                count += 1
        if count > 0:
            importances /= count  # average importances

        # Combine with actual input values to get contribution
        input_vals = arr_scaled[0]
        contributions = importances * np.abs(input_vals)

        # Get top 3 contributing features
        top_indices = np.argsort(-contributions)[:3]
        factors = []
        for idx in top_indices:
            feat_name = feature_names_list[idx]
            label = FEATURE_LABELS.get(feat_name, feat_name)
            importance_pct = round(float(contributions[idx] / (contributions.sum() + 1e-9)) * 100, 1)
            factors.append({"feature": label, "impact": f"{importance_pct}%"})
        return factors
    except Exception as e:
        print(f"⚠️ Explanation generation failed: {e}")
        return []


# ---------- Graduated Seasonal Penalty ----------
# Adjacent seasons get a lighter penalty than opposite ones
SEASON_ADJACENCY = {
    "kharif": {"adjacent": ["summer"], "opposite": ["rabi"]},
    "rabi":   {"adjacent": ["summer"], "opposite": ["kharif"]},
    "summer": {"adjacent": ["kharif", "rabi"], "opposite": []},
}

def get_seasonal_penalty(crop_key, selected_season):
    """Returns a multiplier (0.65-1.0) based on how far the season is from ideal."""
    if crop_key not in CROP_SEASON_MAP:
        return 1.0  # unknown crop, no penalty
    suitable = [s.lower() for s in CROP_SEASON_MAP[crop_key]]
    if selected_season in suitable or "whole year" in suitable:
        return 1.0  # perfect match
    # Check adjacency
    adj_info = SEASON_ADJACENCY.get(selected_season, {})
    for s in suitable:
        if s in adj_info.get("adjacent", []):
            return 0.85  # 15% penalty — adjacent season
    return 0.65  # 35% penalty — opposite season


# ---------- Routes ----------
@app.get("/")
def home():
    return {"status": "✅ ML Service Running", "model": "Ensemble Soft Voting", "rag_enabled": True}


@app.post("/predict")
def predict(data: CropInput):
    # ✅ Input validation
    errors, warnings = validate_inputs(data)
    if errors:
        return {"status": "error", "message": "Invalid input: " + "; ".join(errors)}

    if feature_names is None:
        return {"status": "error", "message": "Model feature configuration missing. Please retrain."}

    # Construct feature vector matching specific One-Hot column names
    input_data = {
        "N": data.N, "P": data.P, "K": data.K, 
        "ph": data.ph, "temperature": data.temperature, "rainfall": data.rainfall
    }
    
    # Handle One-Hot Encoding for season
    # The columns in features.json will be like "season_Kharif", "season_Rabi", etc.
    for col in feature_names:
        if col.startswith("season_"):
            # e.g., if col is "season_Rabi" and data.season is "Rabi", set to 1.0
            season_suffix = col.replace("season_", "").lower()
            input_data[col] = 1.0 if data.season.lower() == season_suffix else 0.0

    # Create array in the exact order model expects
    arr = np.array([[input_data.get(col, 0.0) for col in feature_names]])
    
    arr_scaled = scaler.transform(arr)

    probs = model.predict_proba(arr_scaled)[0]
    top3_indices = np.argsort(-probs)[:3]

    top3_crops = []
    selected_season = data.season.lower().replace("monsoon (", "").replace("winter (", "").replace(")", "").strip()

    for idx in top3_indices:
        crop_name = label_encoder.inverse_transform([idx])[0]
        confidence = float(probs[idx]) * 100
        
        # --- Data-Driven Seasonal Penalty ---
        crop_key = crop_name.lower()
        penalty = get_seasonal_penalty(crop_key, selected_season)
        confidence *= penalty
        
        top3_crops.append({
            "crop": crop_name,
            "confidence": round(confidence, 1)
        })

    # Sort again after penalty
    top3_crops.sort(key=lambda x: x["confidence"], reverse=True)

    result = {
        "predicted_crop": top3_crops[0]["crop"],
        "confidence": top3_crops[0]["confidence"],
        "top_3": top3_crops
    }

    # --- Feature Importance Explanation ---
    explanation = get_prediction_explanation(model, arr_scaled, feature_names)
    if explanation:
        result["explanation"] = {
            "key_factors": explanation,
            "summary": f"Top factors: {', '.join(f['feature'] + ' (' + f['impact'] + ')' for f in explanation)}"
        }

    # Add seasonal reliability note
    main_crop_key = result["predicted_crop"].lower()
    if main_crop_key in CROP_SEASON_MAP:
        suitable = [s for s in CROP_SEASON_MAP[main_crop_key]]
        if selected_season.capitalize() not in suitable and "Whole Year" not in suitable:
            penalty_val = get_seasonal_penalty(main_crop_key, selected_season)
            penalty_pct = round((1 - penalty_val) * 100)
            result["note"] = f"Warning: {result['predicted_crop']} is traditionally not grown in {selected_season.capitalize()} ({penalty_pct}% confidence adjustment applied)."
        else:
            result["note"] = f"Verified: {result['predicted_crop']} is suitable for {selected_season.capitalize()}."

    # Low-confidence threshold warning
    if result["confidence"] < 30:
        result["low_confidence_warning"] = (
            "Prediction confidence is low. Consider getting a soil test done "
            "for more reliable crop recommendations."
        )

    # Include smart warnings if any values were borderline
    if warnings:
        result["input_recommendations"] = warnings

    return result




@app.post("/fertilizer")
def fertilizer(data: FertilizerInput):
    result = get_fertilizer_recommendation(data.crop, data.N, data.P, data.K)
    return result


# ---------- RAG Routes ----------
@app.post("/rag/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and index a PDF document for RAG queries"""
    load_rag_modules()
    
    if not file.filename.lower().endswith(".pdf"):
        return {"status": "error", "message": "Only PDF files are supported"}

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # 1. Extract text
    text = load_pdf_text(str(file_path))
    if not text.strip():
        return {"status": "error", "message": "No readable text found in PDF"}

    # 2. Split into chunks
    chunks = split_text(text)

    # 3. Create embeddings
    embeddings = embed_texts(chunks)

    # 4. Store in vector store
    vector_store.add(embeddings, chunks)

    return {
        "status": "success",
        "filename": file.filename,
        "total_chunks": len(chunks),
        "message": "Document indexed successfully"
    }

@app.post("/rag/ask")
def ask_rag(query: RagQuery):
    """Query the indexed documents using RAG"""
    load_rag_modules()
    
    if vector_store.embeddings is None:
        return {
            "status": "error",
            "message": "No document indexed yet. Please upload a PDF first."
        }

    # 1. Embed user question
    query_embedding = embed_query(query.question)

    # 2. Retrieve relevant chunks
    relevant_chunks = vector_store.search(query_embedding, top_k=3)

    # 3. Combine context
    context = "\n\n".join(relevant_chunks)

    return {
        "status": "success",
        "question": query.question,
        "context": context,
        "chunks_retrieved": len(relevant_chunks)
    }
@app.get("/health")
def health_check():
    return {"status": "online", "service": "AgroAware ML"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)




