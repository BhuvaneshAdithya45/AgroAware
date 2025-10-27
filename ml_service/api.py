from fastapi import FastAPI
from pydantic import BaseModel
import joblib, numpy as np

app = FastAPI(title="AgroAware ML API")
model = joblib.load("crop_model.pkl")

class SoilInput(BaseModel):
    N: float
    P: float
    K: float
    ph: float
    temperature: float
    rainfall: float

@app.get("/")
def root():
    return {"status": "ok", "service": "crop_recommender"}

@app.post("/predict")
def predict(inp: SoilInput):
    X = np.array([[inp.N, inp.P, inp.K, inp.ph, inp.temperature, inp.rainfall]])
    pred = model.predict(X)[0]
    try:
        conf = float(model.predict_proba(X)[0].max())
    except Exception:
        conf = 0.0
    return {"recommended_crop": pred, "confidence": round(conf, 3)}