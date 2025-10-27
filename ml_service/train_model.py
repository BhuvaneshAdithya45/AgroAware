import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# TODO: replace with your real dataset csv
# Minimal starter data so the pipeline runs:
df = pd.DataFrame([
    {"N":90,"P":42,"K":43,"ph":6.5,"temperature":25,"rainfall":200,"label_crop":"rice"},
    {"N":40,"P":50,"K":60,"ph":7.2,"temperature":22,"rainfall":80,"label_crop":"wheat"},
    {"N":20,"P":20,"K":20,"ph":6.8,"temperature":30,"rainfall":40,"label_crop":"millet"},
    {"N":55,"P":35,"K":30,"ph":6.8,"temperature":26,"rainfall":120,"label_crop":"rice"},
    {"N":35,"P":60,"K":50,"ph":7.1,"temperature":20,"rainfall":70,"label_crop":"wheat"},
    {"N":18,"P":25,"K":22,"ph":6.9,"temperature":32,"rainfall":50,"label_crop":"millet"},
])

X = df[["N","P","K","ph","temperature","rainfall"]]
y = df["label_crop"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

print("Classes:", list(model.classes_))
joblib.dump(model, "crop_model.pkl")
print("Model saved to crop_model.pkl")
