# ml_service/api.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
from pathlib import Path
import os

from rag.pdf_loader import load_pdf_text
from fertilizer import get_fertilizer_recommendation

from fertilizer import get_fertilizer_recommendation   # ✅ NEW

from rag.text_splitter import split_text
from rag.embeddings import embed_texts
from rag.vector_store import vector_store
from rag.embeddings import embed_query


APP_DIR = Path(__file__).resolve().parent
MODELS_DIR = APP_DIR / "models"

UPLOAD_DIR = APP_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

MODEL_FILE = MODELS_DIR / "ensemble_model.pkl"
SCALER_FILE = MODELS_DIR / "scaler.pkl"
ENCODER_FILE = MODELS_DIR / "label_encoder.pkl"

# ---------- Load Artifacts ----------
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



# ---------- Routes ----------
@app.get("/")
def home():
    return {"status": "✅ ML Service Running", "model": "Ensemble Soft Voting"}


@app.post("/predict")
def predict(data: CropInput):
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

    return {
        "predicted_crop": top3_crops[0]["crop"],
        "confidence": top3_crops[0]["confidence"],
        "top_3": top3_crops
    }




@app.post("/fertilizer")
def fertilizer(data: FertilizerInput):
    result = get_fertilizer_recommendation(data.crop, data.N, data.P, data.K)
    return result

@app.post("/rag/upload")
async def upload_document(file: UploadFile = File(...)):
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
    if vector_store.embeddings is None:
        return {
            "status": "error",
            "message": "No document indexed yet"
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
        "context": context
    }
