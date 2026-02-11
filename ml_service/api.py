# ml_service/api.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
from pathlib import Path
import os

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

MODEL_FILE = MODELS_DIR / "ensemble_model.pkl"
SCALER_FILE = MODELS_DIR / "scaler.pkl"
ENCODER_FILE = MODELS_DIR / "label_encoder.pkl"

# ---------- Load Artifacts ----------
model = None
scaler = None
label_encoder = None

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

# ---------- App Init ----------
app = FastAPI(title="AgroAware ML Service", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

class FertilizerInput(BaseModel):
    crop: str
    N: float
    P: float
    K: float

class RagQuery(BaseModel):
    question: str


# ---------- Input Validation ----------
VALID_RANGES = {
    "N":           {"min": 0,   "max": 300,  "unit": "kg/ha"},
    "P":           {"min": 0,   "max": 200,  "unit": "kg/ha"},
    "K":           {"min": 0,   "max": 300,  "unit": "kg/ha"},
    "ph":          {"min": 3.0, "max": 10.0, "unit": "pH"},
    "temperature": {"min": 5,   "max": 50,   "unit": "°C"},
    "rainfall":    {"min": 10,  "max": 3000, "unit": "mm"},
}

def validate_inputs(data: CropInput):
    """Check inputs against realistic agronomic ranges. Returns (errors, warnings)."""
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
        # Soft warnings — outside typical agronomic range
        elif val < r["min"] or val > r["max"]:
            warnings.append(
                f"{field}={val} is outside typical range ({r['min']}–{r['max']} {r['unit']}). Prediction may be unreliable."
            )
    return errors, warnings


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

    arr = np.array([[data.N, data.P, data.K, data.ph,
                     data.temperature, data.rainfall]])

    arr_scaled = scaler.transform(arr)

    probs = model.predict_proba(arr_scaled)[0]
    top3_indices = np.argsort(-probs)[:3]

    top3_crops = []
    for idx in top3_indices:
        crop_name = label_encoder.inverse_transform([idx])[0]
        confidence = float(probs[idx]) * 100

        top3_crops.append({
            "crop": crop_name,
            "confidence": round(confidence, 1)
        })

    result = {
        "predicted_crop": top3_crops[0]["crop"],
        "confidence": top3_crops[0]["confidence"],
        "top_3": top3_crops
    }

    # Include warnings if any values were borderline
    if warnings:
        result["warnings"] = warnings

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
