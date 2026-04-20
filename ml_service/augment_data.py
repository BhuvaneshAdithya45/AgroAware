import pandas as pd
import numpy as np
from pathlib import Path

# Mapping crops to their valid seasons for training augmentation
# Uses lists so crops with multiple valid seasons get diverse training data
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

def assign_season(crop_name):
    """Assign a random valid season for the crop. Falls back to 'Kharif'."""
    crop_key = crop_name.lower().strip()
    seasons = CROP_SEASON_MAP.get(crop_key, ['Kharif'])
    return np.random.choice(seasons)

def augment_csv(file_path):
    print(f"📄 Processing {file_path.name}...")
    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        return
    df = pd.read_csv(file_path)
    # Detect label col
    label_col = None
    for c in ['Crop', 'crop', 'label', 'Label']:
        if c in df.columns:
            label_col = c
            break
    
    if not label_col:
        print(f"❌ Could not find label column in {file_path.name}")
        return

    # Add Season column — randomly picks from valid seasons per crop
    np.random.seed(42)  # Reproducibility
    df['season'] = df[label_col].apply(assign_season)
    
    # Report coverage
    mapped = df[label_col].str.lower().isin(CROP_SEASON_MAP).sum()
    total = len(df)
    print(f"   📊 Season mapped: {mapped}/{total} rows ({mapped/total*100:.1f}%)")
    
    # Save back
    df.to_csv(file_path, index=False)
    print(f"✅ Augmented {file_path.name} with 'season' column")

if __name__ == "__main__":
    DATA_DIR = Path(__file__).resolve().parent / "data"
    augment_csv(DATA_DIR / "Train Dataset.csv")
    augment_csv(DATA_DIR / "Test Dataset.csv")
